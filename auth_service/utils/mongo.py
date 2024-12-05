from flask_pymongo import PyMongo
from flask import Flask
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGODB_URI")
mongo = PyMongo(app)