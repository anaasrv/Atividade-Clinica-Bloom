from datetime import datetime, timedelta


def _utcnow():
    return datetime.utcnow()
from uuid import uuid4

from flask import Blueprint, request
from flask_jwt_extended import create_access_token

from extensions import db
from models import Paciente
from utils.auth import auth_required, get_current_user
from utils.responses import fail, ok
from utils.validators import is_valid_email, parse_date

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def public_user(user: Paciente) -> dict:
    return user.to_dict()


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    nome = (data.get("nome") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("senha") or data.get("password")

    if not nome:
        return fail("Nome é obrigatório", 400)
    if not is_valid_email(email):
        return fail("E-mail inválido", 400)
    if not password or len(password) < 6:
        return fail("Senha deve ter pelo menos 6 caracteres", 400)
    if Paciente.query.filter_by(email=email).first():
        return fail("E-mail já cadastrado", 409)

    user = Paciente(
        nome=nome,
        email=email,
        cpf=data.get("cpf") or None,
        data_nascimento=parse_date(data.get("data_nascimento")),
        genero=data.get("genero") or "Prefiro não informar",
        telefone=data.get("telefone"),
        endereco=data.get("endereco"),
        cep=data.get("cep"),
        cidade=data.get("cidade"),
        estado=data.get("estado"),
        aceita_comunicacoes=bool(data.get("aceita_comunicacoes", False)),
        tipo_usuario="paciente",
        is_admin=False,
        ativo=True,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id), additional_claims={"tipo_usuario": user.tipo_usuario, "is_admin": user.is_admin})
    return ok({"message": "Cadastro realizado com sucesso", "usuario": public_user(user), "token": token}, 201)


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("senha") or data.get("password") or ""
    user = Paciente.query.filter_by(email=email).first()
    if not user or not user.ativo or not user.check_password(password):
        return fail("E-mail ou senha incorretos", 401)

    if user.senha == password:
        user.set_password(password)
    user.ultimo_login = _utcnow()
    db.session.commit()
    token = create_access_token(identity=str(user.id), additional_claims={"tipo_usuario": user.tipo_usuario, "is_admin": bool(user.is_admin)})
    return ok({"message": "Login realizado com sucesso", "usuario": public_user(user), "token": token})


@bp.get("/validate")
@auth_required
def validate():
    return ok({"message": "Token válido", "usuario": public_user(get_current_user())})


@bp.get("/me")
@auth_required
def me():
    return ok({"usuario": public_user(get_current_user())})


@bp.put("/me")
@auth_required
def update_me():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    for field in ["nome", "cpf", "genero", "telefone", "endereco", "cep", "cidade", "estado", "observacoes"]:
        if field in data:
            setattr(user, field, data[field] or None)
    if data.get("data_nascimento"):
        user.data_nascimento = parse_date(data.get("data_nascimento"))
    if "aceita_comunicacoes" in data:
        user.aceita_comunicacoes = bool(data.get("aceita_comunicacoes"))
    db.session.commit()
    return ok({"message": "Perfil atualizado", "usuario": public_user(user), "paciente": public_user(user)})


@bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = Paciente.query.filter_by(email=email).first()
    if not user:
        return fail("E-mail não encontrado", 404)
    token = uuid4().hex
    user.token_recuperacao = token
    user.token_recuperacao_expira = _utcnow() + timedelta(hours=1)
    db.session.commit()
    return ok({"message": "Token de recuperação gerado. Em produção, ele deve ser enviado por e-mail.", "token_recuperacao": token})


@bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or data.get("token_recuperacao")
    password = data.get("nova_senha") or data.get("senha") or data.get("password")
    if not token or not password:
        return fail("Token e nova senha são obrigatórios", 400)
    user = Paciente.query.filter_by(token_recuperacao=token).first()
    if not user or not user.token_recuperacao_expira or user.token_recuperacao_expira < _utcnow():
        return fail("Token inválido ou expirado", 400)
    if len(password) < 6:
        return fail("Senha deve ter pelo menos 6 caracteres", 400)
    user.set_password(password)
    user.token_recuperacao = None
    user.token_recuperacao_expira = None
    db.session.commit()
    return ok({"message": "Senha redefinida com sucesso"})


@bp.put("/change-password")
@auth_required
def change_password():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    atual = data.get("senha_atual") or data.get("currentPassword") or data.get("senhaAtual")
    nova = data.get("nova_senha") or data.get("newPassword") or data.get("novaSenha")
    if not atual or not nova:
        return fail("Senha atual e nova senha são obrigatórias", 400)
    if not user.check_password(atual):
        return fail("Senha atual incorreta", 400)
    if len(nova) < 6:
        return fail("Nova senha deve ter pelo menos 6 caracteres", 400)
    user.set_password(nova)
    db.session.commit()
    return ok({"message": "Senha alterada com sucesso"})


@bp.post("/logout")
@auth_required
def logout():
    return ok({"message": "Logout realizado no cliente"})
