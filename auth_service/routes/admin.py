from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/grant_admin', methods=['POST'])
@jwt_required()
def grant_admin():
    current_user = get_jwt_identity()
    user = User.find_by_username(current_user)
    if not user or not user.get('is_admin', False):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    username = data.get('username')

    user_to_update = User.find_by_username(username)
    if not user_to_update:
        return jsonify({"error": "User not found"}), 404

    User.update_user(username, {"is_admin": True})
    return jsonify({"message": "User granted admin privileges"}), 200