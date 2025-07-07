import os
import pymongo

# Get environment variables
mongo_root_user = os.environ.get("MONGO_INITDB_ROOT_USERNAME")
mongo_root_password = os.environ.get("MONGO_INITDB_ROOT_PASSWORD")
app_username = os.environ.get("MONGO_APP_USERNAME")
app_password = os.environ.get("MONGO_APP_PASSWORD")

# Database name for the application
db_name = os.environ.get("DB_NAME", "secure_share")
# Connect to MongoDB
# Hostname is mongodb, service name in docker-compose
client = pymongo.MongoClient(
    f"mongodb://{mongo_root_user}:{mongo_root_password}@mongodb:27017/admin?authSource=admin&retryWrites=true&w=majority"
)

# Create the database for the app
db = client[db_name]

db.command("createUser", app_username,
           pwd=app_password,
           roles=[{"role": "readWrite", "db": db_name}])


print(f"Database '{db_name}' created with user '{app_username}'")