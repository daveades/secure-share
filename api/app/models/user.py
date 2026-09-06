"""
User model for the application.
"""
from datetime import datetime
from bson import ObjectId
import bcrypt
from app.utils.db import get_db

class User:
    """User model class for authentication and user management"""

    def __init__(self, username, email, password=None, first_name=None, 
                 last_name=None, created_at=None, updated_at=None, 
                 is_active=True, is_admin=False, _id=None):
        """Initialize a User object"""
        self._id = _id
        self.username = username
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.is_active = is_active
        self.is_admin = is_admin

    @classmethod
    def find_by_username(cls, username):
        """Find a user by username"""
        db = get_db()
        user_data = db.users.find_one({"username": username})
        return cls.from_dict(user_data) if user_data else None

    @classmethod
    def find_by_email(cls, email):
        """Find a user by email"""
        db = get_db()
        user_data = db.users.find_one({"email": email})
        return cls.from_dict(user_data) if user_data else None

    @classmethod
    def find_by_id(cls, user_id):
        """Find a user by ID"""
        db = get_db()
        user_data = db.users.find_one({"_id": ObjectId(user_id)})
        return cls.from_dict(user_data) if user_data else None

    @classmethod
    def from_dict(cls, user_dict):
        """Create a User object from a dictionary"""
        if not user_dict:
            return None

        return cls(
            _id=user_dict.get("_id"),
            username=user_dict.get("username"),
            email=user_dict.get("email"),
            password=user_dict.get("password"),
            first_name=user_dict.get("first_name"),
            last_name=user_dict.get("last_name"),
            created_at=user_dict.get("created_at"),
            updated_at=user_dict.get("updated_at"),
            is_active=user_dict.get("is_active", True),
            is_admin=user_dict.get("is_admin", False)
        )

    def to_dict(self, include_password=False):
        """Convert User object to dictionary"""
        user_dict = {
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_active": self.is_active,
            "is_admin": self.is_admin
        }
        
        if self._id:
            user_dict["_id"] = str(self._id)
            
        if include_password and self.password:
            user_dict["password"] = self.password
            
        return user_dict

    def save(self):
        """Save user to database"""
        db = get_db()
        user_data = self.to_dict(include_password=True)
        
        if self._id:
            # Update existing user
            user_data["updated_at"] = datetime.utcnow()
            db.users.update_one(
                {"_id": ObjectId(self._id)},
                {"$set": user_data}
            )
            return self
        else:
            # Create new user
            user_data["created_at"] = datetime.utcnow()
            user_data["updated_at"] = datetime.utcnow()
            result = db.users.insert_one(user_data)
            self._id = result.inserted_id
            return self

    def hash_password(self, password):
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        self.password = hashed.decode('utf-8')

    def check_password(self, password):
        """Check if password is correct"""
        if not self.password:
            return False
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password.encode('utf-8')
        )

    def delete(self):
        """Delete user from database"""
        if not self._id:
            return False
        
        db = get_db()
        result = db.users.delete_one({"_id": ObjectId(self._id)})
        return result.deleted_count > 0
