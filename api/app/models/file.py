"""
File model for storing file metadata.
"""
from datetime import datetime, timedelta
from bson import ObjectId
from app.utils.db import get_db


class File:
    def __init__(self, filename, original_filename, file_size, file_type, 
                 uploader_id, expiration_hours=24, password=None, download_limit=None):
        self.filename = filename
        self.original_filename = original_filename
        self.file_size = file_size
        self.file_type = file_type
        self.uploader_id = uploader_id
        self.upload_date = datetime.utcnow()
        self.expiration_date = datetime.utcnow() + timedelta(hours=expiration_hours)
        self.password = password
        self.download_limit = download_limit
        self.download_count = 0
        self.is_active = True
        self.access_token = None  # For public access

    def to_dict(self):
        """Convert file object to dictionary"""
        return {
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'uploader_id': self.uploader_id,
            'upload_date': self.upload_date,
            'expiration_date': self.expiration_date,
            'password': self.password,
            'download_limit': self.download_limit,
            'download_count': self.download_count,
            'is_active': self.is_active,
            'access_token': self.access_token
        }

    @staticmethod
    def create_file(filename, original_filename, file_size, file_type, 
                   uploader_id, expiration_hours=24, password=None, download_limit=None):
        """Create a new file record in the database"""
        db = get_db()
        file_obj = File(filename, original_filename, file_size, file_type, 
                       uploader_id, expiration_hours, password, download_limit)
        
        result = db.files.insert_one(file_obj.to_dict())
        return str(result.inserted_id)

    @staticmethod
    def get_file_by_id(file_id):
        """Get file by ID"""
        try:
            db = get_db()
            file_data = db.files.find_one({'_id': ObjectId(file_id)})
            return file_data
        except Exception:
            return None

    @staticmethod
    def get_file_by_filename(filename):
        """Get file by filename"""
        db = get_db()
        return db.files.find_one({'filename': filename})

    @staticmethod
    def get_files_by_uploader(uploader_id, include_expired=False):
        """Get all files uploaded by a specific user"""
        db = get_db()
        query = {'uploader_id': uploader_id}
        
        if not include_expired:
            query['is_active'] = True
            query['expiration_date'] = {'$gt': datetime.utcnow()}
            
        return list(db.files.find(query).sort('upload_date', -1))

    @staticmethod
    def update_download_count(file_id):
        """Increment download count for a file"""
        db = get_db()
        db.files.update_one(
            {'_id': ObjectId(file_id)},
            {'$inc': {'download_count': 1}}
        )

    @staticmethod
    def deactivate_file(file_id):
        """Deactivate a file"""
        db = get_db()
        return db.files.update_one(
            {'_id': ObjectId(file_id)},
            {'$set': {'is_active': False}}
        )

    @staticmethod
    def delete_expired_files():
        """Mark expired files as inactive"""
        db = get_db()
        current_time = datetime.utcnow()
        return db.files.update_many(
            {'expiration_date': {'$lt': current_time}, 'is_active': True},
            {'$set': {'is_active': False}}
        )

    @staticmethod
    def check_file_access(file_id, password=None):
        """Check if file can be accessed"""
        file_data = File.get_file_by_id(file_id)
        
        if not file_data:
            return False, "File not found"
        
        if not file_data['is_active']:
            return False, "File is no longer available"
        
        if file_data['expiration_date'] < datetime.utcnow():
            return False, "File has expired"
        
        if file_data['download_limit'] and file_data['download_count'] >= file_data['download_limit']:
            return False, "Download limit reached"
        
        if file_data['password'] and file_data['password'] != password:
            return False, "Invalid password"
        
        return True, "Access granted"

    def is_expired(self):
        """Check if file is expired"""
        return datetime.utcnow() > self.expiration_date

    def can_download(self, password=None):
        """Check if file can be downloaded"""
        if not self.is_active:
            return False
        
        if self.is_expired():
            return False
        
        if self.download_limit and self.download_count >= self.download_limit:
            return False
        
        if self.password and self.password != password:
            return False
        
        return True
