#!/usr/bin/env python3
import os
import sys
import time
import pymongo

def wait_for_mongodb():
    # Get environment variables
    mongo_root_user = os.environ.get("MONGO_INITDB_ROOT_USERNAME")
    mongo_root_password = os.environ.get("MONGO_INITDB_ROOT_PASSWORD")
    app_username = os.environ.get("MONGO_APP_USERNAME")
    
    # Print environment variables for debugging (without showing passwords)
    print("Environment variables:")
    print(f"  MONGO_INITDB_ROOT_USERNAME: {mongo_root_user}")
    print(f"  MONGO_APP_USERNAME: {app_username}")
    print(f"  DB_NAME: {os.environ.get('DB_NAME', 'secure_share')}")
    
    # Maximum number of attempts
    MAX_ATTEMPTS = 30
    RETRY_INTERVAL = 2
    attempt = 0
    
    print("Waiting for MongoDB to start...")
    
    while attempt < MAX_ATTEMPTS:
        try:
            print(f"Attempt {attempt+1}/{MAX_ATTEMPTS}: Checking MongoDB connection...")
            
            # Try to connect to MongoDB with explicit authSource
            client = pymongo.MongoClient(
                f"mongodb://{mongo_root_user}:{mongo_root_password}@mongodb:27017/admin?authSource=admin&retryWrites=true&w=majority",
                serverSelectionTimeoutMS=2000  # 2 second timeout for server selection
            )
            
            # Force a connection to verify it works
            client.admin.command('ping')
            
            print("MongoDB is up and running!")
            print("Running initialization script...")
            
            # Run the initialization script
            import subprocess
            result = subprocess.run(["python", "/app/init-mongo.py"], check=True)
            return result.returncode
            
        except (pymongo.errors.ServerSelectionTimeoutError, 
                pymongo.errors.ConnectionFailure, 
                pymongo.errors.OperationFailure) as e:
            attempt += 1
            print(f"MongoDB is not available yet. Error: {str(e)}")
            
            if attempt < MAX_ATTEMPTS:
                print(f"Waiting for {RETRY_INTERVAL} seconds...")
                time.sleep(RETRY_INTERVAL)
            else:
                print(f"Error: MongoDB did not become available after {MAX_ATTEMPTS} attempts.")
                print("Please check if the MongoDB container is running properly and environment variables are set correctly.")
                print("MongoDB connection parameters:")
                print(f"  Host: mongodb")
                print(f"  Port: 27017")
                print(f"  Username: {mongo_root_user}")
                print(f"  Authentication Database: admin")
                return 1

if __name__ == "__main__":
    sys.exit(wait_for_mongodb())