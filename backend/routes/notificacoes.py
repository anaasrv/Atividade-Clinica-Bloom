from flask import Blueprint, request

from utils.auth import auth_required
from utils.responses import ok

bp = Blueprint("notificacoes", __name__, url_prefix="/api/notificacoes")


@bp.get("")
@auth_required
def list_notificacoes():
    return ok({"notificacoes": []})


@bp.post("")
@auth_required
def create_notificacao():
    return ok({"message": "Notificação registrada", "notificacao": request.get_json(silent=True) or {}}, 201)
