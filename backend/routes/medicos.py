from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import DisponibilidadeMedico, Exame, Medico
from services.agendamentos import available_slots
from utils.auth import admin_required
from utils.responses import fail, ok, pagination, pagination_payload
from utils.validators import parse_date, parse_time

bp = Blueprint("medicos", __name__, url_prefix="/api/medicos")


def _apply(row: Medico, data: dict) -> None:
    for field in ["nome", "crm", "foto", "email", "telefone", "resumo", "descricao", "formacao", "experiencia", "premios", "dias_atendimento"]:
        if field in data:
            setattr(row, field, data[field])
    for field in ["especialidade_id", "experiencia_anos", "total_avaliacoes", "intervalo_consulta"]:
        if field in data and data[field] not in (None, ""):
            setattr(row, field, int(data[field]))
    if "avaliacao" in data and data["avaliacao"] not in (None, ""):
        row.avaliacao = data["avaliacao"]
    if "ativo" in data:
        row.ativo = bool(data.get("ativo"))
    if "disponivel" in data:
        row.disponivel = bool(data.get("disponivel"))
    if data.get("horario_inicio"):
        row.horario_inicio = parse_time(data.get("horario_inicio"))
    if data.get("horario_fim"):
        row.horario_fim = parse_time(data.get("horario_fim"))


@bp.get("")
def list_medicos():
    page, limit, offset = pagination(request.args, 20)
    query = Medico.query
    if request.args.get("ativo", "true") != "all":
        query = query.filter(Medico.ativo == (request.args.get("ativo", "true") != "false"))
    especialidade = request.args.get("especialidade")
    if especialidade:
        query = query.join(Medico.especialidade_info).filter(Medico.especialidade_info.has(nome=especialidade))
    search = request.args.get("q") or request.args.get("search")
    if search:
        like = f"%{search}%"
        query = query.filter((Medico.nome.ilike(like)) | (Medico.crm.ilike(like)) | (Medico.resumo.ilike(like)))
    total = query.count()
    rows = query.order_by(Medico.nome.asc()).offset(offset).limit(limit).all()
    return ok({"medicos": [row.to_dict() for row in rows], "pagination": pagination_payload(total, page, limit)})


@bp.post("")
@admin_required
def create_medico():
    data = request.get_json(silent=True) or {}
    if not data.get("nome") or not data.get("crm") or not data.get("especialidade_id"):
        return fail("Nome, CRM e especialidade são obrigatórios", 400)
    row = Medico(nome=data["nome"], crm=data["crm"], especialidade_id=int(data["especialidade_id"]), ativo=True, disponivel=True)
    _apply(row, data)
    db.session.add(row)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return fail("CRM já cadastrado", 409)
    return ok({"message": "Médico criado", "medico": row.to_dict(include_exames=True)}, 201)


@bp.get("/<int:item_id>")
def get_medico(item_id):
    row = Medico.query.get_or_404(item_id)
    return ok({"medico": row.to_dict(include_exames=True)})


@bp.put("/<int:item_id>")
@admin_required
def update_medico(item_id):
    row = Medico.query.get_or_404(item_id)
    _apply(row, request.get_json(silent=True) or {})
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return fail("CRM já cadastrado por outro médico", 409)
    return ok({"message": "Médico atualizado", "medico": row.to_dict(include_exames=True)})


@bp.delete("/<int:item_id>")
@admin_required
def delete_medico(item_id):
    row = Medico.query.get_or_404(item_id)
    row.ativo = False
    row.disponivel = False
    db.session.commit()
    return ok({"message": "Médico desativado", "medico": row.to_dict()})


@bp.get("/<int:item_id>/exames")
def medico_exames(item_id):
    row = Medico.query.get_or_404(item_id)
    exames = [exame.to_dict() for exame in row.exames_realizados if exame.ativo]
    return ok({"exames": exames, "procedimentos": exames})


@bp.put("/<int:item_id>/exames")
@admin_required
def update_medico_exames(item_id):
    row = Medico.query.get_or_404(item_id)
    data = request.get_json(silent=True) or {}
    ids = data.get("exames_ids") or data.get("exame_ids") or data.get("procedimentos_ids") or []
    row.exames_realizados = Exame.query.filter(Exame.id.in_(ids)).all() if ids else []
    db.session.commit()
    return ok({"message": "Exames do médico atualizados", "exames": [e.to_dict() for e in row.exames_realizados]})


@bp.get("/<int:item_id>/horarios")
def medico_horarios(item_id):
    row = Medico.query.get_or_404(item_id)
    date_value = parse_date(request.args.get("data"))
    if not date_value:
        return fail("Informe a data no formato YYYY-MM-DD", 400)
    return ok({"horarios": available_slots(row, date_value)})


@bp.post("/<int:item_id>/horarios")
@admin_required
def save_medico_horario(item_id):
    Medico.query.get_or_404(item_id)
    data = request.get_json(silent=True) or {}
    selected_date = parse_date(data.get("data"))
    selected_time = parse_time(data.get("horario"))
    row = DisponibilidadeMedico.query.filter_by(medico_id=item_id, data=selected_date, horario=selected_time).first()
    if not row:
        row = DisponibilidadeMedico(medico_id=item_id, data=selected_date, horario=selected_time)
        db.session.add(row)
    row.disponivel = bool(data.get("disponivel", True))
    db.session.commit()
    return ok({"message": "Disponibilidade salva", "disponibilidade": row.to_dict()}, 201)
