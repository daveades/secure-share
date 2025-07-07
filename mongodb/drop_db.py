from pymongo import MongoClient
import os

client = MongoClient(
    f"mongodb://{os.environ['MONGO_INITDB_ROOT_USERNAME']}:"
    f"{os.environ['MONGO_INITDB_ROOT_PASSWORD']}@mongodb:27017/admin"
)

# drop the database
client.drop_database('secure_share')
print("Dropped 'secure_share' database")

# drop the application user from that DB
app_user = os.environ.get('MONGO_APP_USERNAME')
if app_user:
    try:
        db = client['secure_share']
        db.command('dropUser', app_user)
        print(f"Dropped user '{app_user}' from 'secure_share' database")
    except Exception as e:
        print(f"Error dropping user '{app_user}': {e}")
else:
    print("MONGO_APP_USERNAME not set, skipping user drop")