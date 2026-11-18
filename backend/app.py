from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Development only: allow the Vite development server to call this API.
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    db.init_app(app)
    app.register_blueprint(api)

    @app.get("/")
    def index():
        return jsonify({"message": "Student Management API is running."})

    with app.app_context():
        db.create_all()

    return app
