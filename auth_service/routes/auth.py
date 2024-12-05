from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if User.find_by_username(username):
        return jsonify({"error": "Username already exists"}), 400

    User.create_user(username, password, email)
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.find_by_username(username)
    if not user or not User.verify_password(user['password'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)  # Ensure identity is a string
    return jsonify({"token": access_token}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = User.find_by_username(current_user)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"username": user['username'], "email": user['email'], "is_admin": user.get('is_admin', False)}), 200