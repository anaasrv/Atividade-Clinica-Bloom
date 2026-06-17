from datetime import date, datetime, time, timedelta
from decimal import Decimal

from extensions import db
from models import Agendamento, DisponibilidadeMedico, Exame, Medico
from utils.validators import parse_date, parse_time

ACTIVE_STATUSES = ["agendado", "confirmado", "pendente", "reagendado"]


def generate_slots(start: time, end: time, interval_minutes: int) -> list[str]:
    today = date.today()
    current = datetime.combine(today, start)
    finish = datetime.combine(today, end)
    slots = []
    while current < finish:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=interval_minutes or 30)
    return slots


def available_slots(medico: Medico, selected_date: date) -> list[str]:
    if not medico or not medico.disponivel or not medico.ativo:
        return []

    # Banco legado usa 1=segunda, ..., 7=domingo.
    day_number = selected_date.weekday() + 1
    dias = {int(x) for x in str(medico.dias_atendimento or "1,2,3,4,5").split(",") if x.strip().isdigit()}
    if dias and day_number not in dias:
        return []

    slots = generate_slots(medico.horario_inicio, medico.horario_fim, medico.intervalo_consulta or 30)
    occupied_rows = Agendamento.query.filter(
        Agendamento.medico_id == medico.id,
        Agendamento.data == selected_date,
        Agendamento.status.in_(ACTIVE_STATUSES),
    ).all()
    occupied = {row.horario.strftime("%H:%M") for row in occupied_rows}

    manual_rows = DisponibilidadeMedico.query.filter_by(medico_id=medico.id, data=selected_date).all()
    manual = {row.horario.strftime("%H:%M"): row.disponivel for row in manual_rows}

    result = []
    now = datetime.now()
    for slot in slots:
        slot_time = datetime.strptime(slot, "%H:%M").time()
        slot_datetime = datetime.combine(selected_date, slot_time)
        if slot in occupied:
            continue
        if slot in manual and manual[slot] is False:
            continue
        if selected_date == date.today() and slot_datetime <= now:
            continue
        result.append(slot)
    return result


def has_conflict(medico_id: int, selected_date, selected_time, ignore_id: int | None = None) -> bool:
    query = Agendamento.query.filter(
        Agendamento.medico_id == medico_id,
        Agendamento.data == selected_date,
        Agendamento.horario == selected_time,
        Agendamento.status.in_(ACTIVE_STATUSES),
    )
    if ignore_id:
        query = query.filter(Agendamento.id != ignore_id)
    return db.session.query(query.exists()).scalar()


def create_appointment(payload: dict, user) -> Agendamento:
    required = ["paciente_id", "medico_id", "exame_id", "data", "horario"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        raise ValueError(f"Campos obrigatórios ausentes: {', '.join(missing)}")

    paciente_id = int(payload["paciente_id"])
    if not (user.is_admin or user.tipo_usuario == "admin" or user.id == paciente_id):
        raise PermissionError("Você só pode agendar consultas para o seu próprio cadastro")

    medico = Medico.query.get(int(payload["medico_id"]))
    if not medico or not medico.ativo:
        raise LookupError("Médico não encontrado ou inativo")

    exame = Exame.query.get(int(payload["exame_id"]))
    if not exame or not exame.ativo:
        raise LookupError("Procedimento/exame não encontrado ou inativo")

    selected_date = parse_date(payload["data"])
    selected_time = parse_time(payload["horario"])
    if selected_date < date.today():
        raise ValueError("Não é possível agendar para uma data passada")
    if selected_time.strftime("%H:%M") not in available_slots(medico, selected_date):
        raise ValueError("Horário indisponível para este médico")
    if has_conflict(medico.id, selected_date, selected_time):
        raise ValueError("Já existe consulta para este médico neste horário")

    appointment = Agendamento(
        paciente_id=paciente_id,
        medico_id=medico.id,
        exame_id=exame.id,
        especialidade_id=payload.get("especialidade_id") or medico.especialidade_id,
        convenio=payload.get("convenio") or "Particular",
        data=selected_date,
        horario=selected_time,
        status=payload.get("status") or "agendado",
        valor=Decimal(str(payload.get("valor") or exame.preco or 0)),
        observacoes=payload.get("observacoes"),
        link_telemedicina=payload.get("link_telemedicina"),
    )
    db.session.add(appointment)
    db.session.commit()
    return appointment
