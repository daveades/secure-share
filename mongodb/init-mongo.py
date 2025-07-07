import os
import sys
import pymongo

# Print function that forces flush to ensure logs are captured
def log_print(message):
    print(message, flush=True)

log_print("Starting init-mongo.py script...")

# Get environment variables
mongo_root_user = os.environ.get("MONGO_INITDB_ROOT_USERNAME")
mongo_root_password = os.environ.get("MONGO_INITDB_ROOT_PASSWORD")
app_username = os.environ.get("MONGO_APP_USERNAME")
app_password = os.environ.get("MONGO_APP_PASSWORD")

# Database name for the application
db_name = os.environ.get("DB_NAME", "secure_share")

# Debug environment variables (without showing passwords)
log_print("Environment variables in init-mongo.py:")
log_print(f"  MONGO_INITDB_ROOT_USERNAME: {mongo_root_user}")
log_print(f"  MONGO_APP_USERNAME: {app_username}")
log_print(f"  DB_NAME: {db_name}")

try:
    # Connect to MongoDB
    # Hostname is mongodb, service name in docker-compose
    log_print("Connecting to MongoDB...")
    client = pymongo.MongoClient(
        f"mongodb://{mongo_root_user}:{mongo_root_password}@mongodb:27017/admin?authSource=admin&retryWrites=true&w=majority"
    )

    # Create the database for the app
    log_print(f"Creating database '{db_name}'...")
    db = client[db_name]

    log_print(f"Creating user '{app_username}' in database '{db_name}'...")
    db.command("createUser", app_username,
               pwd=app_password,
               roles=[{"role": "readWrite", "db": db_name}])

    log_print(f"Database '{db_name}' created with user '{app_username}'")
    sys.exit(0)
except Exception as e:
    log_print(f"Error in init-mongo.py: {str(e)}")
    sys.exit(1)