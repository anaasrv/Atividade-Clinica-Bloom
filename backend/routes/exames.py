from decimal import Decimal

from flask import Blueprint, request

from extensions import db
from models import Agendamento, Exame
from utils.auth import admin_required, auth_required, can_access_user
from utils.responses import fail, ok, pagination, pagination_payload

bp = Blueprint("exames", __name__, url_prefix="/api/exames")
procedimentos_bp = Blueprint("procedimentos", __name__, url_prefix="/api/procedimentos")


def _list_payload():
    page, limit, offset = pagination(request.args, 20)
    query = Exame.query
    if request.args.get("ativo", "true") != "all":
        query = query.filter(Exame.ativo == (request.args.get("ativo", "true") != "false"))
    categoria = request.args.get("categoria")
    if categoria:
        query = query.filter(Exame.categoria == categoria)
    search = request.args.get("q") or request.args.get("search")
    if search:
        like = f"%{search}%"
        query = query.filter((Exame.nome.ilike(like)) | (Exame.descricao.ilike(like)))
    total = query.count()
    rows = query.order_by(Exame.ordem_exibicao.asc(), Exame.nome.asc()).offset(offset).limit(limit).all()
    return {"exames": [row.to_dict() for row in rows], "procedimentos": [row.to_dict() for row in rows], "pagination": pagination_payload(total, page, limit)}


def _apply(row: Exame, data: dict) -> None:
    for field in ["nome", "descricao", "categoria", "preparo", "resultado_entrega"]:
        if field in data:
            setattr(row, field, data[field])
    if "preco" in data:
        row.preco = Decimal(str(data.get("preco") or 0))
    if "duracao" in data:
        row.duracao = int(data.get("duracao") or 30)
    if "ordem_exibicao" in data:
        row.ordem_exibicao = int(data.get("ordem_exibicao") or 0)
    if "ativo" in data:
        row.ativo = bool(data.get("ativo"))


@bp.get("")
def list_exames():
    return ok(_list_payload())


@procedimentos_bp.get("")
def list_procedimentos():
    return ok(_list_payload())


@bp.get("/<int:item_id>")
def get_exame(item_id):
    row = Exame.query.get_or_404(item_id)
    return ok({"exame": row.to_dict(), "procedimento": row.to_dict()})


@procedimentos_bp.get("/<int:item_id>")
def get_procedimento(item_id):
    return get_exame(item_id)


@bp.post("")
@admin_required
def create_exame():
    data = request.get_json(silent=True) or {}
    if not data.get("nome"):
        return fail("Nome é obrigatório", 400)
    row = Exame(nome=data["nome"], ativo=True)
    _apply(row, data)
    db.session.add(row)
    db.session.commit()
    return ok({"message": "Procedimento criado", "exame": row.to_dict(), "procedimento": row.to_dict()}, 201)


@procedimentos_bp.post("")
@admin_required
def create_procedimento():
    return create_exame()


@bp.put("/<int:item_id>")
@admin_required
def update_exame(item_id):
    row = Exame.query.get_or_404(item_id)
    _apply(row, request.get_json(silent=True) or {})
    db.session.commit()
    return ok({"message": "Procedimento atualizado", "exame": row.to_dict(), "procedimento": row.to_dict()})


@procedimentos_bp.put("/<int:item_id>")
@admin_required
def update_procedimento(item_id):
    return update_exame(item_id)


@bp.delete("/<int:item_id>")
@admin_required
def delete_exame(item_id):
    row = Exame.query.get_or_404(item_id)
    row.ativo = False
    db.session.commit()
    return ok({"message": "Procedimento desativado", "exame": row.to_dict(), "procedimento": row.to_dict()})


@procedimentos_bp.delete("/<int:item_id>")
@admin_required
def delete_procedimento(item_id):
    return delete_exame(item_id)


@bp.get("/paciente/<int:user_id>")
@auth_required
def exames_paciente(user_id):
    if not can_access_user(user_id):
        return fail("Você não tem permissão para acessar estes exames", 403)
    rows = Agendamento.query.filter_by(paciente_id=user_id).all()
    exames = [row.to_dict() for row in rows]
    return ok({"exames": exames, "resultados": []})


@bp.get("/paciente/<int:user_id>/resultados")
@auth_required
def resultados_paciente(user_id):
    return exames_paciente(user_id)
