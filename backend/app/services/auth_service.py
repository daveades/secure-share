"""
Authentication service for user login and registration
"""
from app.models import User
from app.utils.auth import generate_token

class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def register(username, email, password, first_name=None, last_name=None):
        """
        Register a new user
        
        Args:
            username: Unique username
            email: User email
            password: User password
            first_name: User's first name
            last_name: User's last name
            
        Returns:
            tuple: (User object, None) if successful, (None, error_message) if failed
        """
        # Check if username already exists
        if User.find_by_username(username):
            return None, "Username already exists"
        
        # Check if email already exists
        if User.find_by_email(email):
            return None, "Email already exists"
        
        # Create and save the new user
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        # Hash the password
        user.hash_password(password)
        
        # Save user to database
        user.save()
        
        return user, None
    
    @staticmethod
    def login(username_or_email, password):
        """
        Authenticate a user
        
        Args:
            username_or_email: Username or email for login
            password: User password
            
        Returns:
            tuple: (tokens_dict, User) if successful, (error_message, None) if failed
        """
        # Try to find user by username
        user = User.find_by_username(username_or_email)
        
        # If not found by username, try email
        if not user:
            user = User.find_by_email(username_or_email)
        
        # If user not found or inactive
        if not user:
            return "Invalid username or email", None
        
        if not user.is_active:
            return "Account is deactivated", None
        
        # Check password
        if not user.check_password(password):
            return "Invalid password", None
        
        # Generate tokens
        access_token = generate_token(user._id, "access")
        refresh_token = generate_token(user._id, "refresh")
        
        tokens = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer"
        }
        
        return tokens, user
    
    @staticmethod
    def refresh_token(refresh_token):
        """
        Generate a new access token using a refresh token
        
        Args:
            refresh_token: The refresh token
            
        Returns:
            tuple: (new_tokens, None) if successful, (None, error_message) if failed
        """
        from app.utils.auth import decode_token
        
        # Decode the refresh token
        payload = decode_token(refresh_token)
        
        if not payload:
            return None, "Invalid or expired refresh token"
        
        if payload.get("type") != "refresh":
            return None, "Invalid token type"
        
        user_id = payload.get("user_id")
        
        # Check if user exists
        user = User.find_by_id(user_id)
        if not user or not user.is_active:
            return None, "User not found or inactive"
        
        # Generate new tokens
        new_access_token = generate_token(user._id, "access")
        
        tokens = {
            "access_token": new_access_token,
            "token_type": "Bearer"
        }
        
        return tokens, None
