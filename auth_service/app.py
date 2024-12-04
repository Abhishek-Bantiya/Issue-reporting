from flask import Flask
from flask_cors import CORS
from utils.mongo import app as mongo_app
from utils.jwt import jwt  # Import the initialized JWTManager
from routes.auth import auth_bp
from routes.admin import admin_bp  # Import the admin blueprint
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
app.config.from_object(mongo_app.config)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")  # Ensure JWT_SECRET_KEY is set

jwt.init_app(app)  # Initialize JWTManager with the Flask app

CORS(app)  # Enable CORS for all routes

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')  # Register the admin blueprint

if __name__ == '__main__':
    port = int(os.getenv("PORT", 3002))
    print(f"Running on port: {port}")
    app.run(port=port, debug=True)