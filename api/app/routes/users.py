"""
User management routes for CRUD operations
"""
from flask import Blueprint, request, jsonify
from app.models import User
from app.utils.auth import token_required, admin_required

# Create blueprint
user_bp = Blueprint('users', __name__)

@user_bp.route('', methods=['GET'])
@admin_required
def get_all_users(user_id):
    """
    Get all users (admin only)
    ---
    headers:
      Authorization: Bearer <access_token>
    """
    from app.utils.db import get_db
    
    db = get_db()
    users_data = list(db.users.find())
    
    users = [User.from_dict(user_data).to_dict() for user_data in users_data]
    
    return jsonify({
        "users": users,
        "count": len(users)
    }), 200

@user_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_user(user_id, requested_user_id):
    """
    Get user by ID
    ---
    headers:
      Authorization: Bearer <access_token>
    path:
      user_id: ID of the user to retrieve
    """
    # Check if user is requesting their own profile or is admin
    user = User.find_by_id(user_id)
    requested_user = User.find_by_id(requested_user_id)
    
    if not requested_user:
        return jsonify({"error": "User not found"}), 404
    
    if str(user_id) != str(requested_user_id) and not user.is_admin:
        return jsonify({"error": "Access denied"}), 403
    
    return jsonify({
        "user": requested_user.to_dict()
    }), 200

@user_bp.route('/<user_id>', methods=['PUT'])
@token_required
def update_user(user_id, requested_user_id):
    """
    Update user by ID
    ---
    headers:
      Authorization: Bearer <access_token>
    path:
      user_id: ID of the user to update
    request body:
      first_name: (optional) first name
      last_name: (optional) last name
      email: (optional) email
    """
    # Check if user is updating their own profile or is admin
    user = User.find_by_id(user_id)
    requested_user = User.find_by_id(requested_user_id)
    
    if not requested_user:
        return jsonify({"error": "User not found"}), 404
    
    if str(user_id) != str(requested_user_id) and not user.is_admin:
        return jsonify({"error": "Access denied"}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'first_name' in data:
        requested_user.first_name = data['first_name']
    
    if 'last_name' in data:
        requested_user.last_name = data['last_name']
    
    if 'email' in data:
        # Check if email already exists
        existing_user = User.find_by_email(data['email'])
        if existing_user and str(existing_user._id) != str(requested_user._id):
            return jsonify({"error": "Email already in use"}), 400
        
        requested_user.email = data['email']
    
    # Save changes
    requested_user.save()
    
    return jsonify({
        "message": "User updated successfully",
        "user": requested_user.to_dict()
    }), 200

@user_bp.route('/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id, requested_user_id):
    """
    Delete user by ID (admin only)
    ---
    headers:
      Authorization: Bearer <access_token>
    path:
      user_id: ID of the user to delete
    """
    requested_user = User.find_by_id(requested_user_id)
    
    if not requested_user:
        return jsonify({"error": "User not found"}), 404
    
    # Prevent deleting yourself
    if str(user_id) == str(requested_user_id):
        return jsonify({"error": "Cannot delete your own account"}), 400
    
    # Delete user
    if requested_user.delete():
        return jsonify({
            "message": "User deleted successfully"
        }), 200
    else:
        return jsonify({"error": "Failed to delete user"}), 500
