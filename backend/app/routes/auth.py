"""
Authentication routes for login, register, and token refresh
"""
from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.utils.auth import token_required

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    request body:
      username: unique username
      email: valid email address
      password: password (min 8 chars)
      first_name: (optional) first name
      last_name: (optional) last name
    """
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Validate password length
    if len(data['password']) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    
    # Register user
    user, error = AuthService.register(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    # Generate tokens
    tokens, _ = AuthService.login(data['username'], data['password'])
    
    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict(),
        "tokens": tokens
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return tokens
    ---
    request body:
      username_or_email: username or email
      password: password
    """
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['username_or_email', 'password']):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Login user
    result, user = AuthService.login(
        data['username_or_email'],
        data['password']
    )
    
    if not user:
        return jsonify({"error": result}), 401
    
    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "tokens": result
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """
    Refresh access token
    ---
    request body:
      refresh_token: valid refresh token
    """
    data = request.get_json()
    
    # Validate required fields
    if 'refresh_token' not in data:
        return jsonify({"error": "Refresh token is required"}), 400
    
    # Refresh token
    tokens, error = AuthService.refresh_token(data['refresh_token'])
    
    if error:
        return jsonify({"error": error}), 401
    
    return jsonify({
        "message": "Token refreshed successfully",
        "tokens": tokens
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_user_profile(user_id):
    """
    Get current user profile
    ---
    headers:
      Authorization: Bearer <access_token>
    """
    from app.models import User
    
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "user": user.to_dict()
    }), 200

@auth_bp.route('/password', methods=['PUT'])
@token_required
def change_password(user_id):
    """
    Change user password
    ---
    headers:
      Authorization: Bearer <access_token>
    request body:
      current_password: current password
      new_password: new password
    """
    from app.models import User
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['current_password', 'new_password']):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Validate new password length
    if len(data['new_password']) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400
    
    # Get user
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Verify current password
    if not user.check_password(data['current_password']):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Update password
    user.hash_password(data['new_password'])
    user.save()
    
    return jsonify({
        "message": "Password changed successfully"
    }), 200
