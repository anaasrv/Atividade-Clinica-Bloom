from functools import wraps

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from models import Paciente
from utils.responses import fail


def get_current_user():
    identity = get_jwt_identity()
    if identity is None:
        return None
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None
    return Paciente.query.get(user_id)


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user or not user.ativo:
            return fail("Usuário não encontrado ou inativo", 401)
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user or not user.ativo:
            return fail("Usuário não encontrado ou inativo", 401)
        if not (user.is_admin or user.tipo_usuario == "admin"):
            return fail("Acesso restrito a administradores", 403)
        return fn(*args, **kwargs)

    return wrapper


def can_access_user(target_user_id: int) -> bool:
    user = get_current_user()
    if not user:
        return False
    return bool(user.is_admin or user.tipo_usuario == "admin" or user.id == int(target_user_id))
