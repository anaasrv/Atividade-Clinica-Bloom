from flask import Blueprint, request

from extensions import db
from models import Especialidade
from utils.auth import admin_required
from utils.responses import fail, ok

bp = Blueprint("especialidades", __name__, url_prefix="/api/especialidades")


@bp.get("")
def list_especialidades():
    rows = Especialidade.query.filter_by(ativo=True).order_by(Especialidade.nome.asc()).all()
    return ok({"especialidades": [row.to_dict() for row in rows]})


@bp.post("")
@admin_required
def create_especialidade():
    data = request.get_json(silent=True) or {}
    if not data.get("nome"):
        return fail("Nome é obrigatório", 400)
    row = Especialidade(nome=data["nome"].strip(), descricao=data.get("descricao"), ativo=bool(data.get("ativo", True)))
    db.session.add(row)
    db.session.commit()
    return ok({"message": "Especialidade criada", "especialidade": row.to_dict()}, 201)


@bp.put("/<int:item_id>")
@admin_required
def update_especialidade(item_id):
    row = Especialidade.query.get_or_404(item_id)
    data = request.get_json(silent=True) or {}
    for field in ["nome", "descricao"]:
        if field in data:
            setattr(row, field, data[field])
    if "ativo" in data:
        row.ativo = bool(data.get("ativo"))
    db.session.commit()
    return ok({"message": "Especialidade atualizada", "especialidade": row.to_dict()})


@bp.delete("/<int:item_id>")
@admin_required
def delete_especialidade(item_id):
    row = Especialidade.query.get_or_404(item_id)
    row.ativo = False
    db.session.commit()
    return ok({"message": "Especialidade desativada", "especialidade": row.to_dict()})
