from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

# Extensões compartilhadas pelo app Flask.
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
