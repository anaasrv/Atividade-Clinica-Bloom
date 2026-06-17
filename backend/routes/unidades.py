from flask import Blueprint

from utils.responses import ok

bp = Blueprint("unidades", __name__, url_prefix="/api/unidades")

UNIDADES = [
    {
        "id": 1,
        "nome": "Bloom Maternity Paulista",
        "endereco": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
        "telefone": "(11) 3000-1000",
        "horarios": {"segunda_sexta": "08:00 às 20:00", "sabado": "08:00 às 14:00", "domingo": "Fechado"},
    },
    {
        "id": 2,
        "nome": "Bloom Maternity Pinheiros",
        "endereco": "Rua dos Pinheiros, 500 - Pinheiros, São Paulo - SP",
        "telefone": "(11) 3000-2000",
        "horarios": {"segunda_sexta": "08:00 às 19:00", "sabado": "08:00 às 13:00", "domingo": "Fechado"},
    },
]


@bp.get("")
def list_unidades():
    return ok({"unidades": UNIDADES})


@bp.get("/<int:unidade_id>/horarios")
def unidade_horarios(unidade_id):
    unidade = next((item for item in UNIDADES if item["id"] == unidade_id), None)
    return ok({"horarios": unidade["horarios"] if unidade else {}})
