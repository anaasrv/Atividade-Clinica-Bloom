from datetime import date

from flask import Blueprint
from sqlalchemy import func

from models import Agendamento, Exame, Medico, Paciente
from utils.auth import admin_required
from utils.responses import ok

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.get("/dashboard")
@admin_required
def dashboard():
    today = date.today()
    por_status = [
        {"status": status or "sem_status", "total": int(total)}
        for status, total in Agendamento.query.with_entities(Agendamento.status, func.count(Agendamento.id)).group_by(Agendamento.status).all()
    ]
    proximas = Agendamento.query.filter(
        Agendamento.data >= today,
        Agendamento.status.notin_(["cancelado", "realizado"]),
    ).order_by(Agendamento.data.asc(), Agendamento.horario.asc()).limit(8).all()
    cards = {
        "totalConsultas": Agendamento.query.count(),
        "consultasHoje": Agendamento.query.filter_by(data=today).count(),
        "pendentes": Agendamento.query.filter(Agendamento.status.in_(["agendado", "pendente"])).count(),
        "confirmadas": Agendamento.query.filter_by(status="confirmado").count(),
        "canceladas": Agendamento.query.filter_by(status="cancelado").count(),
        "pacientes": Paciente.query.filter_by(ativo=True).count(),
        "medicos": Medico.query.filter_by(ativo=True).count(),
        "procedimentos": Exame.query.filter_by(ativo=True).count(),
    }
    return ok({"cards": cards, "porStatus": por_status, "proximas": [row.to_dict() for row in proximas]})


@bp.get("/consultas-hoje")
@admin_required
def consultas_hoje():
    rows = Agendamento.query.filter_by(data=date.today()).order_by(Agendamento.horario.asc()).all()
    return ok({"agendamentos": [row.to_dict() for row in rows], "consultas": [row.to_dict() for row in rows]})


@bp.get("/notificacoes")
@admin_required
def notificacoes():
    return ok({"notificacoes": [
        {"titulo": "Sistema Flask ativo", "mensagem": "Backend migrado de Node.js/Express para Python/Flask."},
        {"titulo": "Banco integrado", "mensagem": "Dados principais usam MySQL via SQLAlchemy."},
    ]})
