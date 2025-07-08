"""
Main application package.
"""
import os
from flask import Flask
from flask_cors import CORS
from app.utils.db import close_mongo_connection

def create_app(test_config=None):
    """Create and configure the Flask application"""
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app)
    
    # Load default configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://mongo:27017/'),
        DB_NAME=os.environ.get('DB_NAME', 'secure_share'),
        MAX_CONTENT_LENGTH=100 * 1024 * 1024,  # 100MB max file size
    )

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Register teardown callback to close MongoDB connection
    @app.teardown_appcontext
    def teardown_db(exception):
        close_mongo_connection()

    # A simple route to verify the app is working
    @app.route('/health')
    def health_check():
        return {'status': 'ok'}

    # Import and register blueprints
    from app.routes import auth_bp, user_bp, file_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(file_bp, url_prefix='/api/files')

    return app
