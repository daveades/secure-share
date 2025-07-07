FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install MongoDB client tools for testing connectivity
RUN apt-get update && apt-get install -y gnupg curl \
    && curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list \
    && apt-get update \
    && apt-get install -y mongodb-org-shell \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Pymongo
RUN pip install pymongo

# Copy Scripts
COPY init-mongo.py /app/
COPY wait-for-mongo.py /app/

# Make the Python script executable
RUN chmod +x /app/wait-for-mongo.py

CMD ["/app/wait-for-mongo.py"]