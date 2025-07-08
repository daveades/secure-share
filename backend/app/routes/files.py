"""
File upload and management routes.
"""
from flask import Blueprint, request, jsonify, send_file
from werkzeug.exceptions import RequestEntityTooLarge
import io
from app.services.file_service import FileService
from app.utils.auth import token_required


file_bp = Blueprint('files', __name__, url_prefix='/api/files')
file_service = FileService()


@file_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({
        'success': False,
        'message': f'File too large. Maximum size is {FileService.MAX_FILE_SIZE / (1024*1024):.0f}MB'
    }), 413


@file_bp.route('/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    """Upload a file"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Get optional parameters
        expiration_hours = int(request.form.get('expiration_hours', 24))
        password = request.form.get('password')
        download_limit = request.form.get('download_limit')
        
        if download_limit:
            try:
                download_limit = int(download_limit)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid download limit'
                }), 400
        
        # Upload file
        success, message, file_data = file_service.upload_file(
            file=file,
            uploader_id=current_user['user_id'],
            expiration_hours=expiration_hours,
            password=password,
            download_limit=download_limit
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'data': file_data
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Upload failed: {str(e)}'
        }), 500


@file_bp.route('/download/<file_id>', methods=['GET', 'POST'])
def download_file(file_id):
    """Download a file"""
    try:
        password = None
        
        # Handle password from either GET params or POST body
        if request.method == 'POST':
            data = request.get_json()
            password = data.get('password') if data else None
        else:
            password = request.args.get('password')
        
        # Download file
        success, message, file_content, filename, file_type = file_service.download_file(file_id, password)
        
        if success:
            return send_file(
                io.BytesIO(file_content),
                as_attachment=True,
                download_name=filename,
                mimetype=file_type
            )
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400 if 'not found' in message.lower() else 403
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Download failed: {str(e)}'
        }), 500


@file_bp.route('/info/<file_id>', methods=['GET'])
def get_file_info(file_id):
    """Get file information"""
    try:
        success, message, file_info = file_service.get_file_info(file_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'data': file_info
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving file info: {str(e)}'
        }), 500


@file_bp.route('/my-files', methods=['GET'])
@token_required
def get_my_files(current_user):
    """Get all files uploaded by the current user"""
    try:
        include_expired = request.args.get('include_expired', 'false').lower() == 'true'
        
        success, message, files = file_service.get_user_files(
            current_user['user_id'], 
            include_expired
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'data': files
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving files: {str(e)}'
        }), 500


@file_bp.route('/delete/<file_id>', methods=['DELETE'])
@token_required
def delete_file(current_user, file_id):
    """Delete a file"""
    try:
        success, message = file_service.delete_file(file_id, current_user['user_id'])
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400 if 'not found' in message.lower() else 403
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Delete failed: {str(e)}'
        }), 500


@file_bp.route('/share/<access_token>', methods=['GET'])
def get_shared_file_info(access_token):
    """Get file info by access token for sharing"""
    try:
        from app.utils.db import get_db
        
        db = get_db()
        file_record = db.files.find_one({'access_token': access_token})
        
        if not file_record:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired share link'
            }), 404
        
        # Check if file is still active and not expired
        from datetime import datetime
        if not file_record['is_active'] or file_record['expiration_date'] < datetime.utcnow():
            return jsonify({
                'success': False,
                'message': 'File is no longer available'
            }), 410
        
        # Return safe file info
        file_info = {
            'file_id': str(file_record['_id']),
            'original_filename': file_record['original_filename'],
            'file_size': file_record['file_size'],
            'file_type': file_record['file_type'],
            'upload_date': file_record['upload_date'],
            'expiration_date': file_record['expiration_date'],
            'download_count': file_record['download_count'],
            'download_limit': file_record['download_limit'],
            'has_password': bool(file_record.get('password'))
        }
        
        return jsonify({
            'success': True,
            'message': 'File info retrieved',
            'data': file_info
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving file: {str(e)}'
        }), 500


@file_bp.route('/share/<access_token>/download', methods=['GET', 'POST'])
def download_shared_file(access_token):
    """Download a file using access token"""
    try:
        from app.utils.db import get_db
        
        db = get_db()
        file_record = db.files.find_one({'access_token': access_token})
        
        if not file_record:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired share link'
            }), 404
        
        file_id = str(file_record['_id'])
        
        password = None
        if request.method == 'POST':
            data = request.get_json()
            password = data.get('password') if data else None
        else:
            password = request.args.get('password')
        
        # Download file
        success, message, file_content, filename, file_type = file_service.download_file(file_id, password)
        
        if success:
            return send_file(
                io.BytesIO(file_content),
                as_attachment=True,
                download_name=filename,
                mimetype=file_type
            )
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400 if 'not found' in message.lower() else 403
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Download failed: {str(e)}'
        }), 500


@file_bp.route('/cleanup', methods=['POST'])
@token_required
def cleanup_expired_files(current_user):
    """Cleanup expired files (admin function)"""
    try:
        # You might want to add admin role check here
        success, message = file_service.cleanup_expired_files()
        
        return jsonify({
            'success': success,
            'message': message
        }), 200 if success else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Cleanup failed: {str(e)}'
        }), 500
