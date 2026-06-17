from __future__ import annotations

import os
from pathlib import Path

import pymysql
from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from sqlalchemy import text
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import Config
from extensions import bcrypt, db, jwt
from routes import register_blueprints
from services.seed import seed_initial_data

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"


def ensure_mysql_database(config: type[Config]) -> None:
    uri = config.SQLALCHEMY_DATABASE_URI
    if not uri.startswith("mysql") or not config.AUTO_CREATE_DATABASE:
        return
    connection = pymysql.connect(
        host=config.MYSQL_HOST,
        port=config.MYSQL_PORT,
        user=config.MYSQL_USER,
        password=config.MYSQL_PASSWORD,
        charset="utf8mb4",
        autocommit=True,
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{config.MYSQL_DATABASE}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
    finally:
        connection.close()


def create_app() -> Flask:
    load_dotenv(BASE_DIR / ".env")
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)

    ensure_mysql_database(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}, r"/health": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    register_blueprints(app)

    @app.get("/health")
    def health():
        try:
            db.session.execute(text("SELECT 1"))
            database = "connected"
        except Exception:
            database = "disconnected"
        return jsonify({"status": "OK", "environment": os.getenv("FLASK_ENV", "development"), "database": database})

    @app.get("/api")
    def api_info():
        return jsonify(
            {
                "success": True,
                "name": "Bloom Maternity API Integrada",
                "stack": "Python + Flask + SQLAlchemy + MySQL",
                "version": "3.0.0",
                "modules": ["auth", "pacientes", "médicos", "agendamentos", "especialidades", "procedimentos", "admin"],
                "adminDefault": {"email": "admin@bloommaternity.com.br", "senha": "admin123"},
            }
        )

    @app.get("/")
    def index():
        return send_from_directory(FRONTEND_DIR / "pages", "index.html")

    @app.get("/assets/<path:filename>")
    def assets(filename):
        return send_from_directory(FRONTEND_DIR / "assets", filename)

    @app.get("/css/<path:filename>")
    def css(filename):
        return send_from_directory(FRONTEND_DIR / "css", filename)

    @app.get("/js/<path:filename>")
    def js(filename):
        return send_from_directory(FRONTEND_DIR / "js", filename)

    @app.get("/components/<path:filename>")
    def components(filename):
        return send_from_directory(FRONTEND_DIR / "components", filename)

    @app.get("/pages/<path:filename>")
    def pages(filename):
        return send_from_directory(FRONTEND_DIR / "pages", filename)

    @app.get("/<path:filename>")
    def page_fallback(filename):
        candidate = FRONTEND_DIR / "pages" / filename
        if candidate.exists():
            return send_from_directory(FRONTEND_DIR / "pages", filename)
        return send_from_directory(FRONTEND_DIR / "pages", "index.html")

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({"success": False, "message": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_error(error):
        app.logger.exception("Erro não tratado")
        return jsonify({"success": False, "message": str(error) or "Erro interno do servidor"}), 500

    with app.app_context():
        if app.config.get("AUTO_CREATE_TABLES", True):
            db.create_all()
        if app.config.get("AUTO_SEED", True):
            seed_initial_data()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_ENV", "development") == "development")
