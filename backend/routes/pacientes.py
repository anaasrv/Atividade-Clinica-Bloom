from flask import Blueprint, request

from extensions import db
from models import Agendamento, Paciente
from utils.auth import admin_required, auth_required, can_access_user, get_current_user
from utils.responses import fail, ok, pagination, pagination_payload
from utils.validators import parse_date

bp = Blueprint("pacientes", __name__, url_prefix="/api/pacientes")


def _apply_user_fields(user: Paciente, data: dict, allow_role: bool = False) -> None:
    for field in ["nome", "cpf", "genero", "telefone", "endereco", "cep", "cidade", "estado", "observacoes"]:
        if field in data:
            setattr(user, field, data[field] or None)
    if data.get("data_nascimento"):
        user.data_nascimento = parse_date(data.get("data_nascimento"))
    if "ativo" in data and allow_role:
        user.ativo = bool(data.get("ativo"))
    if "tipo_usuario" in data and allow_role:
        user.tipo_usuario = data.get("tipo_usuario") or "paciente"
        user.is_admin = user.tipo_usuario == "admin" or bool(data.get("is_admin"))
    if "is_admin" in data and allow_role:
        user.is_admin = bool(data.get("is_admin"))
        if user.is_admin:
            user.tipo_usuario = "admin"
    if "aceita_comunicacoes" in data:
        user.aceita_comunicacoes = bool(data.get("aceita_comunicacoes"))


@bp.get("")
@admin_required
def list_pacientes():
    page, limit, offset = pagination(request.args, 20)
    query = Paciente.query
    if request.args.get("ativo") is not None:
        query = query.filter(Paciente.ativo == (request.args.get("ativo") != "false"))
    search = request.args.get("q") or request.args.get("search")
    if search:
        like = f"%{search}%"
        query = query.filter((Paciente.nome.ilike(like)) | (Paciente.email.ilike(like)))
    total = query.count()
    users = query.order_by(Paciente.nome.asc()).offset(offset).limit(limit).all()
    payload = [u.to_dict() for u in users]
    return ok({"pacientes": payload, "usuarios": payload, "pagination": pagination_payload(total, page, limit)})


@bp.get("/me")
@auth_required
def my_profile():
    user = get_current_user()
    return ok({"paciente": user.to_dict(), "usuario": user.to_dict()})


@bp.get("/<int:user_id>")
@auth_required
def get_paciente(user_id):
    if not can_access_user(user_id):
        return fail("Você não tem permissão para acessar este paciente", 403)
    user = Paciente.query.get_or_404(user_id)
    return ok({"paciente": user.to_dict(), "usuario": user.to_dict()})


@bp.post("")
@admin_required
def create_paciente():
    data = request.get_json(silent=True) or {}
    if not data.get("nome") or not data.get("email"):
        return fail("Nome e e-mail são obrigatórios", 400)
    if Paciente.query.filter_by(email=data["email"].strip().lower()).first():
        return fail("E-mail já cadastrado", 409)
    user = Paciente(nome=data["nome"], email=data["email"].strip().lower(), ativo=True)
    _apply_user_fields(user, data, allow_role=True)
    user.set_password(data.get("senha") or "123456")
    db.session.add(user)
    db.session.commit()
    return ok({"message": "Paciente criado", "paciente": user.to_dict(), "usuario": user.to_dict()}, 201)


@bp.put("/<int:user_id>")
@auth_required
def update_paciente(user_id):
    current = get_current_user()
    if not can_access_user(user_id):
        return fail("Você não tem permissão para alterar este paciente", 403)
    user = Paciente.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}
    allow_role = bool(current.is_admin or current.tipo_usuario == "admin")
    if data.get("email") and allow_role:
        new_email = data["email"].strip().lower()
        existing = Paciente.query.filter(Paciente.email == new_email, Paciente.id != user.id).first()
        if existing:
            return fail("E-mail já cadastrado por outro usuário", 409)
        user.email = new_email
    _apply_user_fields(user, data, allow_role=allow_role)
    if data.get("senha") and allow_role:
        user.set_password(data["senha"])
    db.session.commit()
    return ok({"message": "Paciente atualizado", "paciente": user.to_dict(), "usuario": user.to_dict()})


@bp.delete("/<int:user_id>")
@admin_required
def delete_paciente(user_id):
    user = Paciente.query.get_or_404(user_id)
    user.ativo = False
    db.session.commit()
    return ok({"message": "Paciente desativado", "paciente": user.to_dict()})


@bp.get("/<int:user_id>/agendamentos")
@auth_required
def paciente_agendamentos(user_id):
    if not can_access_user(user_id):
        return fail("Você não tem permissão para acessar estes agendamentos", 403)
    rows = Agendamento.query.filter_by(paciente_id=user_id).order_by(Agendamento.data.desc(), Agendamento.horario.desc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows]})
