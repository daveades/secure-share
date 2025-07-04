set -e

# Wait for MongoDB to be raedy
echo "waiting for MongoDB to start..."
until mongosh --host mongodb --port 27017 -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "db.adminCommand('ping')" &>/dev/null; do
    echo "MongoDB is not available yet, waiting..."
    sleep 2
done

echo "MongoDB is up, running initialization script..."

# Run the initialization script
python /app/init-mongo.py