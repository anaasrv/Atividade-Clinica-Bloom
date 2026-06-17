from datetime import date, datetime


def _utcnow():
    return datetime.utcnow()

from flask import Blueprint, request

from extensions import db
from models import Agendamento, Exame, Medico
from services.agendamentos import ACTIVE_STATUSES, available_slots, create_appointment, has_conflict
from utils.auth import admin_required, auth_required, can_access_user, get_current_user
from utils.responses import fail, ok, pagination, pagination_payload
from utils.validators import parse_date, parse_time

bp = Blueprint("agendamentos", __name__, url_prefix="/api/agendamentos")


def _can_access(appointment: Agendamento, user) -> bool:
    return bool(user and (user.is_admin or user.tipo_usuario == "admin" or appointment.paciente_id == user.id))


@bp.get("/disponibilidade")
def disponibilidade():
    medico_id = request.args.get("medicoId") or request.args.get("medico_id")
    data = request.args.get("data")
    horario = request.args.get("horario")
    if not medico_id or not data:
        return fail("medicoId e data são obrigatórios", 400)
    medico = Medico.query.get_or_404(int(medico_id))
    selected_date = parse_date(data)
    slots = available_slots(medico, selected_date)
    payload = {"disponivel": bool(not horario or str(horario)[:5] in slots), "horarios": slots}
    return ok(payload)


@bp.post("")
@auth_required
def create():
    try:
        row = create_appointment(request.get_json(silent=True) or {}, get_current_user())
        return ok({"message": "Agendamento realizado com sucesso", "agendamento": row.to_dict()}, 201)
    except PermissionError as exc:
        return fail(str(exc), 403)
    except LookupError as exc:
        return fail(str(exc), 404)
    except ValueError as exc:
        return fail(str(exc), 400)


@bp.get("")
@auth_required
def list_all():
    user = get_current_user()
    page, limit, offset = pagination(request.args, 20)
    query = Agendamento.query
    if not (user.is_admin or user.tipo_usuario == "admin"):
        query = query.filter_by(paciente_id=user.id)
    if request.args.get("status"):
        query = query.filter_by(status=request.args.get("status"))
    total = query.count()
    rows = query.order_by(Agendamento.data.desc(), Agendamento.horario.desc()).offset(offset).limit(limit).all()
    return ok({"agendamentos": [row.to_dict() for row in rows], "pagination": pagination_payload(total, page, limit)})


@bp.get("/meus")
@auth_required
def meus():
    user = get_current_user()
    rows = Agendamento.query.filter_by(paciente_id=user.id).order_by(Agendamento.data.desc(), Agendamento.horario.desc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows]})


@bp.get("/paciente/<int:user_id>")
@auth_required
def by_paciente(user_id):
    if not can_access_user(user_id):
        return fail("Você não tem permissão para acessar estes agendamentos", 403)
    rows = Agendamento.query.filter_by(paciente_id=user_id).order_by(Agendamento.data.desc(), Agendamento.horario.desc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows]})


@bp.get("/paciente/<int:user_id>/futuras")
@auth_required
def futuras(user_id):
    if not can_access_user(user_id):
        return fail("Você não tem permissão para acessar estes agendamentos", 403)
    rows = Agendamento.query.filter(
        Agendamento.paciente_id == user_id,
        Agendamento.data >= date.today(),
        Agendamento.status.notin_(["cancelado", "realizado"]),
    ).order_by(Agendamento.data.asc(), Agendamento.horario.asc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows], "consultas": [row.to_dict() for row in rows]})


@bp.get("/paciente/<int:user_id>/historico")
@auth_required
def historico(user_id):
    if not can_access_user(user_id):
        return fail("Você não tem permissão para acessar estes agendamentos", 403)
    rows = Agendamento.query.filter(
        Agendamento.paciente_id == user_id,
        ((Agendamento.data < date.today()) | (Agendamento.status.in_(["cancelado", "realizado"]))),
    ).order_by(Agendamento.data.desc(), Agendamento.horario.desc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows], "consultas": [row.to_dict() for row in rows]})


@bp.get("/medico/<int:medico_id>")
@admin_required
def by_medico(medico_id):
    rows = Agendamento.query.filter_by(medico_id=medico_id).order_by(Agendamento.data.desc(), Agendamento.horario.desc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows]})


@bp.get("/<int:item_id>")
@auth_required
def get_item(item_id):
    row = Agendamento.query.get_or_404(item_id)
    if not _can_access(row, get_current_user()):
        return fail("Você não tem permissão para acessar este agendamento", 403)
    return ok({"agendamento": row.to_dict()})


@bp.put("/<int:item_id>")
@auth_required
def update_item(item_id):
    row = Agendamento.query.get_or_404(item_id)
    user = get_current_user()
    if not _can_access(row, user):
        return fail("Você não tem permissão para alterar este agendamento", 403)
    data = request.get_json(silent=True) or {}
    if data.get("medico_id"):
        row.medico_id = int(data["medico_id"])
    if data.get("exame_id"):
        row.exame_id = int(data["exame_id"])
        exame = Exame.query.get(row.exame_id)
        if exame and not data.get("valor"):
            row.valor = exame.preco
    if data.get("data"):
        row.data = parse_date(data["data"])
    if data.get("horario"):
        row.horario = parse_time(data["horario"])
    if data.get("convenio"):
        row.convenio = data["convenio"]
    if data.get("observacoes") is not None:
        row.observacoes = data.get("observacoes")
    if data.get("valor") is not None:
        row.valor = data.get("valor")
    if data.get("status") and (user.is_admin or user.tipo_usuario == "admin"):
        row.status = data["status"]
    medico = Medico.query.get(row.medico_id)
    if has_conflict(row.medico_id, row.data, row.horario, ignore_id=row.id):
        return fail("Já existe consulta para este médico neste horário", 409)
    if row.horario.strftime("%H:%M") not in available_slots(medico, row.data) and row.status in ACTIVE_STATUSES:
        # Mantém o próprio horário liberado durante edição.
        pass
    db.session.commit()
    return ok({"message": "Agendamento atualizado", "agendamento": row.to_dict()})


@bp.put("/<int:item_id>/reagendar")
@auth_required
def reagendar(item_id):
    data = request.get_json(silent=True) or {}
    data["status"] = "reagendado"
    return update_item(item_id)


@bp.put("/<int:item_id>/confirmar")
@admin_required
def confirmar(item_id):
    row = Agendamento.query.get_or_404(item_id)
    row.status = "confirmado"
    row.data_confirmacao = _utcnow()
    db.session.commit()
    return ok({"message": "Consulta confirmada", "agendamento": row.to_dict()})


@bp.put("/<int:item_id>/cancelar")
@auth_required
def cancelar(item_id):
    row = Agendamento.query.get_or_404(item_id)
    user = get_current_user()
    if not _can_access(row, user):
        return fail("Você não tem permissão para cancelar este agendamento", 403)
    data = request.get_json(silent=True) or {}
    row.status = "cancelado"
    row.data_cancelamento = _utcnow()
    row.motivo_cancelamento = data.get("motivo_cancelamento") or data.get("motivo")
    db.session.commit()
    return ok({"message": "Consulta cancelada", "agendamento": row.to_dict()})


@bp.delete("/<int:item_id>")
@auth_required
def delete_item(item_id):
    return cancelar(item_id)
