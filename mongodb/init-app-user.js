db = db.getSiblingDB(process.env.DB_NAME);
db.createUser({
  user: process.env.MONGO_APP_USERNAME,
  pwd:  process.env.MONGO_APP_PASSWORD,
  roles:[{role:"readWrite",db:process.env.DB_NAME}]
});
print('User created successfully');