"""
JWT utility functions for authentication
"""
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

# Get JWT secret key from environment or use a default for development
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_secret_key')
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

def generate_token(user_id, token_type="access", expires_delta=None):
    """
    Generate a JWT token for a user
    
    Args:
        user_id: The user ID
        token_type: Type of token (access or refresh)
        expires_delta: Token expiration time
        
    Returns:
        str: JWT token
    """
    if expires_delta is None:
        expires_delta = JWT_ACCESS_TOKEN_EXPIRES if token_type == "access" else JWT_REFRESH_TOKEN_EXPIRES
        
    payload = {
        "user_id": str(user_id),
        "type": token_type,
        "exp": datetime.utcnow() + expires_delta,
        "iat": datetime.utcnow()
    }
    
    encoded_token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_token

def decode_token(token):
    """
    Decode a JWT token
    
    Args:
        token: JWT token to decode
        
    Returns:
        dict: Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_token_from_header():
    """
    Extract JWT token from the Authorization header
    
    Returns:
        str: JWT token or None
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return token

def token_required(f):
    """
    Decorator for routes that require a valid access token
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        
        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        if payload.get("type") != "access":
            return jsonify({"error": "Invalid token type"}), 401
        
        # Add user_id to kwargs
        kwargs['user_id'] = payload.get("user_id")
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """
    Decorator for routes that require admin privileges
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        from app.models import User
        
        token = get_token_from_header()
        
        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        user_id = payload.get("user_id")
        user = User.find_by_id(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Admin privileges required"}), 403
        
        # Add user to kwargs
        kwargs['user_id'] = user_id
        
        return f(*args, **kwargs)
    
    return decorated
