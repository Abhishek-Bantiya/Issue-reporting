from werkzeug.security import generate_password_hash, check_password_hash
from utils.mongo import mongo

class User:
    @staticmethod
    def create_user(username, password, email):
        hashed_password = generate_password_hash(password)
        user = {
            "username": username,
            "password": hashed_password,
            "email": email,
            "is_admin": False  # Ensure is_admin field is set
        }
        mongo.db.users.insert_one(user)
        return user

    @staticmethod
    def find_by_username(username):
        return mongo.db.users.find_one({"username": username})

    @staticmethod
    def update_user(username, update_data):
        return mongo.db.users.update_one({"username": username}, {"$set": update_data})

    @staticmethod
    def verify_password(stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)