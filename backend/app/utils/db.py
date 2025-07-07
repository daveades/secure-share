"""
Database utility functions for MongoDB connection
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# MongoDB connection string from environment variable or default
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://mongo:27017/')
DB_NAME = os.environ.get('DB_NAME', 'secure_share')

# Client instance shared across the app
_mongo_client = None

def get_mongo_client():
    """
    Returns a singleton instance of the MongoDB client
    """
    global _mongo_client
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(MONGO_URI)
            # Ping the server to check if connection is established
            _mongo_client.admin.command('ping')
            print("Connected successfully to MongoDB")
        except ConnectionFailure as e:
            print(f"Could not connect to MongoDB: {e}")
            raise
    return _mongo_client

def get_db():
    """
    Returns the database instance
    """
    client = get_mongo_client()
    return client[DB_NAME]

def close_mongo_connection():
    """
    Closes the MongoDB connection
    """
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        print("MongoDB connection closed")
