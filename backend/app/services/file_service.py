"""
File service for handling file operations.
"""
import os
import uuid
import secrets
import magic
import gridfs
from datetime import datetime
from werkzeug.utils import secure_filename
from app.utils.db import get_db
from app.models.file import File


class FileService:
    
    ALLOWED_EXTENSIONS = {
        'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 
        'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z', 'mp4', 
        'mp3', 'avi', 'mov', 'wmv', 'csv'
    }
    
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    
    def __init__(self):
        self.db = get_db()
        self.fs = gridfs.GridFS(self.db)
    
    def allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS
    
    def validate_file(self, file):
        """Validate uploaded file"""
        if not file:
            return False, "No file provided"
        
        if file.filename == '':
            return False, "No file selected"
        
        if not self.allowed_file(file.filename):
            return False, f"File type not allowed. Allowed types: {', '.join(self.ALLOWED_EXTENSIONS)}"
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > self.MAX_FILE_SIZE:
            return False, f"File too large. Maximum size: {self.MAX_FILE_SIZE / (1024*1024):.0f}MB"
        
        return True, "File is valid"
    
    def generate_unique_filename(self, original_filename):
        """Generate a unique filename while preserving extension"""
        ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{ext}" if ext else unique_id
    
    def detect_file_type(self, file_content):
        """Detect file MIME type"""
        try:
            return magic.from_buffer(file_content, mime=True)
        except Exception:
            return 'application/octet-stream'
    
    def upload_file(self, file, uploader_id, expiration_hours=24, password=None, download_limit=None):
        """Upload a file to GridFS and create database record"""
        try:
            # Validate file
            is_valid, message = self.validate_file(file)
            if not is_valid:
                return False, message, None
            
            # Read file content
            file_content = file.read()
            file.seek(0)  # Reset for potential re-reading
            
            # Generate secure filename
            original_filename = secure_filename(file.filename)
            unique_filename = self.generate_unique_filename(original_filename)
            
            # Detect file type
            file_type = self.detect_file_type(file_content)
            
            # Store file in GridFS
            file_id = self.fs.put(
                file_content,
                filename=unique_filename,
                original_filename=original_filename,
                content_type=file_type,
                upload_date=datetime.utcnow(),
                uploader_id=uploader_id
            )
            
            # Create file record in database
            file_record_id = File.create_file(
                filename=unique_filename,
                original_filename=original_filename,
                file_size=len(file_content),
                file_type=file_type,
                uploader_id=uploader_id,
                expiration_hours=expiration_hours,
                password=password,
                download_limit=download_limit
            )
            
            # Generate access token for public sharing
            access_token = secrets.token_urlsafe(32)
            self.db.files.update_one(
                {'_id': File.get_file_by_id(file_record_id)['_id']},
                {'$set': {'access_token': access_token, 'gridfs_id': file_id}}
            )
            
            return True, "File uploaded successfully", {
                'file_id': file_record_id,
                'filename': unique_filename,
                'original_filename': original_filename,
                'file_size': len(file_content),
                'file_type': file_type,
                'access_token': access_token
            }
            
        except Exception as e:
            return False, f"Upload failed: {str(e)}", None
    
    def download_file(self, file_id, password=None):
        """Download a file from GridFS"""
        try:
            # Check file access
            can_access, message = File.check_file_access(file_id, password)
            if not can_access:
                return False, message, None, None, None
            
            # Get file record
            file_record = File.get_file_by_id(file_id)
            if not file_record:
                return False, "File not found", None, None, None
            
            # Get file from GridFS
            gridfs_file = self.fs.get(file_record['gridfs_id'])
            file_content = gridfs_file.read()
            
            # Update download count
            File.update_download_count(file_id)
            
            return True, "File retrieved successfully", file_content, file_record['original_filename'], file_record['file_type']
            
        except Exception as e:
            return False, f"Download failed: {str(e)}", None, None, None
    
    def get_file_info(self, file_id):
        """Get file information without downloading"""
        try:
            file_record = File.get_file_by_id(file_id)
            if not file_record:
                return False, "File not found", None
            
            # Remove sensitive information
            safe_info = {
                'file_id': str(file_record['_id']),
                'original_filename': file_record['original_filename'],
                'file_size': file_record['file_size'],
                'file_type': file_record['file_type'],
                'upload_date': file_record['upload_date'],
                'expiration_date': file_record['expiration_date'],
                'download_count': file_record['download_count'],
                'download_limit': file_record['download_limit'],
                'is_active': file_record['is_active'],
                'has_password': bool(file_record.get('password'))
            }
            
            return True, "File info retrieved", safe_info
            
        except Exception as e:
            return False, f"Error retrieving file info: {str(e)}", None
    
    def delete_file(self, file_id, user_id):
        """Delete a file (only by uploader)"""
        try:
            file_record = File.get_file_by_id(file_id)
            if not file_record:
                return False, "File not found"
            
            # Check if user is the uploader
            if file_record['uploader_id'] != user_id:
                return False, "Unauthorized: You can only delete your own files"
            
            # Delete from GridFS
            if 'gridfs_id' in file_record:
                self.fs.delete(file_record['gridfs_id'])
            
            # Deactivate file record
            File.deactivate_file(file_id)
            
            return True, "File deleted successfully"
            
        except Exception as e:
            return False, f"Delete failed: {str(e)}"
    
    def get_user_files(self, user_id, include_expired=False):
        """Get all files for a user"""
        try:
            files = File.get_files_by_uploader(user_id, include_expired)
            
            # Convert ObjectId to string and format data
            formatted_files = []
            for file_record in files:
                formatted_file = {
                    'file_id': str(file_record['_id']),
                    'original_filename': file_record['original_filename'],
                    'file_size': file_record['file_size'],
                    'file_type': file_record['file_type'],
                    'upload_date': file_record['upload_date'],
                    'expiration_date': file_record['expiration_date'],
                    'download_count': file_record['download_count'],
                    'download_limit': file_record['download_limit'],
                    'is_active': file_record['is_active'],
                    'has_password': bool(file_record.get('password')),
                    'access_token': file_record.get('access_token')
                }
                formatted_files.append(formatted_file)
            
            return True, "Files retrieved successfully", formatted_files
            
        except Exception as e:
            return False, f"Error retrieving files: {str(e)}", None
    
    def cleanup_expired_files(self):
        """Clean up expired files (to be run periodically)"""
        try:
            # Mark expired files as inactive
            result = File.delete_expired_files()
            return True, f"Cleaned up {result.modified_count} expired files"
        except Exception as e:
            return False, f"Cleanup failed: {str(e)}"
