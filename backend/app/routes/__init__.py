"""
Routes package initialization.
"""
from app.routes.auth import auth_bp
from app.routes.users import user_bp

__all__ = ['auth_bp', 'user_bp']
