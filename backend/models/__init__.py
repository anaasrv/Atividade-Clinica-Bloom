from __future__ import annotations

from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Any, Optional

from extensions import bcrypt, db


def _utcnow():
    return datetime.utcnow()


def _iso(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, time):
        return value.strftime("%H:%M:%S")
    if isinstance(value, Decimal):
        return float(value)
    return value


medico_exames = db.Table(
    "medico_exames",
    db.Column("medico_id", db.Integer, db.ForeignKey("medicos.id", ondelete="CASCADE"), primary_key=True),
    db.Column("exame_id", db.Integer, db.ForeignKey("exames.id", ondelete="CASCADE"), primary_key=True),
    db.Column("created_at", db.DateTime, default=_utcnow),
)


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime)


class Paciente(db.Model, TimestampMixin):
    __tablename__ = "pacientes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True, index=True)
    senha = db.Column(db.String(255), nullable=False)
    cpf = db.Column(db.String(14), unique=True)
    data_nascimento = db.Column(db.Date)
    genero = db.Column(db.String(40), default="Prefiro não informar")
    telefone = db.Column(db.String(20))
    endereco = db.Column(db.Text)
    cep = db.Column(db.String(10))
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    ativo = db.Column(db.Boolean, default=True, index=True)
    ultimo_login = db.Column(db.DateTime)
    token_recuperacao = db.Column(db.String(255))
    token_recuperacao_expira = db.Column(db.DateTime)
    aceita_comunicacoes = db.Column(db.Boolean, default=False)
    observacoes = db.Column(db.Text)
    tipo_usuario = db.Column(db.String(20), default="paciente", index=True)
    is_admin = db.Column(db.Boolean, default=False)

    agendamentos = db.relationship("Agendamento", back_populates="paciente", lazy="dynamic")

    def set_password(self, password: str) -> None:
        self.senha = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        if not self.senha:
            return False
        # Compatibilidade com bancos antigos que tenham sido populados com senha em texto puro.
        if not str(self.senha).startswith(("$2a$", "$2b$", "$2y$")):
            return password == self.senha
        return bcrypt.check_password_hash(self.senha, password)

    def to_dict(self, include_sensitive: bool = False) -> dict[str, Any]:
        data = {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "cpf": self.cpf,
            "data_nascimento": _iso(self.data_nascimento),
            "genero": self.genero,
            "telefone": self.telefone,
            "endereco": self.endereco,
            "cep": self.cep,
            "cidade": self.cidade,
            "estado": self.estado,
            "ativo": self.ativo,
            "ultimo_login": _iso(self.ultimo_login),
            "aceita_comunicacoes": self.aceita_comunicacoes,
            "observacoes": self.observacoes,
            "tipo_usuario": self.tipo_usuario,
            "is_admin": bool(self.is_admin or self.tipo_usuario == "admin"),
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }
        if include_sensitive:
            data["token_recuperacao"] = self.token_recuperacao
            data["token_recuperacao_expira"] = _iso(self.token_recuperacao_expira)
        return data


class Especialidade(db.Model, TimestampMixin):
    __tablename__ = "especialidades"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    descricao = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True)

    medicos = db.relationship("Medico", back_populates="especialidade_info", lazy="dynamic")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "ativo": self.ativo,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }


class Exame(db.Model, TimestampMixin):
    __tablename__ = "exames"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    categoria = db.Column(db.String(100))
    preco = db.Column(db.Numeric(10, 2), default=0)
    duracao = db.Column(db.Integer, default=30)
    preparo = db.Column(db.Text)
    resultado_entrega = db.Column(db.String(100))
    ativo = db.Column(db.Boolean, default=True, index=True)
    ordem_exibicao = db.Column(db.Integer, default=0)

    medicos = db.relationship("Medico", secondary=medico_exames, back_populates="exames_realizados")
    agendamentos = db.relationship("Agendamento", back_populates="exame", lazy="dynamic")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "categoria": self.categoria,
            "preco": _iso(self.preco),
            "duracao": self.duracao,
            "preparo": self.preparo,
            "resultado_entrega": self.resultado_entrega,
            "ativo": self.ativo,
            "ordem_exibicao": self.ordem_exibicao,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }


class Medico(db.Model, TimestampMixin):
    __tablename__ = "medicos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    especialidade_id = db.Column(db.Integer, db.ForeignKey("especialidades.id"), nullable=False, index=True)
    crm = db.Column(db.String(20), nullable=False, unique=True)
    foto = db.Column(db.String(500))
    email = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    resumo = db.Column(db.Text)
    descricao = db.Column(db.Text)
    formacao = db.Column(db.Text)
    experiencia = db.Column(db.Text)
    premios = db.Column(db.Text)
    experiencia_anos = db.Column(db.Integer, default=0)
    avaliacao = db.Column(db.Numeric(3, 2), default=5.0)
    total_avaliacoes = db.Column(db.Integer, default=0)
    ativo = db.Column(db.Boolean, default=True, index=True)
    disponivel = db.Column(db.Boolean, default=True)
    horario_inicio = db.Column(db.Time, default=time(8, 0))
    horario_fim = db.Column(db.Time, default=time(18, 0))
    intervalo_consulta = db.Column(db.Integer, default=30)
    dias_atendimento = db.Column(db.String(50), default="1,2,3,4,5")

    especialidade_info = db.relationship("Especialidade", back_populates="medicos")
    exames_realizados = db.relationship("Exame", secondary=medico_exames, back_populates="medicos")
    agendamentos = db.relationship("Agendamento", back_populates="medico", lazy="dynamic")

    def to_dict(self, include_exames: bool = False) -> dict[str, Any]:
        especialidade = self.especialidade_info.to_dict() if self.especialidade_info else None
        data = {
            "id": self.id,
            "nome": self.nome,
            "especialidade_id": self.especialidade_id,
            "especialidade": especialidade["nome"] if especialidade else None,
            "especialidade_info": especialidade,
            "crm": self.crm,
            "foto": self.foto,
            "email": self.email,
            "telefone": self.telefone,
            "resumo": self.resumo,
            "descricao": self.descricao,
            "formacao": self.formacao,
            "experiencia": self.experiencia,
            "premios": self.premios,
            "experiencia_anos": self.experiencia_anos,
            "avaliacao": _iso(self.avaliacao),
            "total_avaliacoes": self.total_avaliacoes,
            "ativo": self.ativo,
            "disponivel": self.disponivel,
            "horario_inicio": _iso(self.horario_inicio),
            "horario_fim": _iso(self.horario_fim),
            "intervalo_consulta": self.intervalo_consulta,
            "dias_atendimento": self.dias_atendimento,
            "areas": [especialidade["nome"]] if especialidade else [],
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }
        if include_exames:
            data["exames"] = [exame.to_dict() for exame in self.exames_realizados if exame.ativo]
            data["exames_realizados"] = data["exames"]
        return data


class Agendamento(db.Model):
    __tablename__ = "agendamentos"

    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey("pacientes.id"), nullable=False, index=True)
    medico_id = db.Column(db.Integer, db.ForeignKey("medicos.id"), nullable=False, index=True)
    exame_id = db.Column(db.Integer, db.ForeignKey("exames.id"), nullable=False)
    procedimento_id = db.Column(db.String(100))
    procedimento_nome = db.Column(db.String(200))
    procedimento_categoria = db.Column(db.String(50))
    especialidade_id = db.Column(db.Integer, db.ForeignKey("especialidades.id"))
    convenio = db.Column(db.String(120), default="Particular")
    data = db.Column(db.Date, nullable=False, index=True)
    horario = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default="agendado", index=True)
    valor = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    observacoes = db.Column(db.Text)
    data_agendamento = db.Column(db.DateTime, default=_utcnow)
    data_confirmacao = db.Column(db.DateTime)
    data_cancelamento = db.Column(db.DateTime)
    motivo_cancelamento = db.Column(db.Text)
    link_telemedicina = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    paciente = db.relationship("Paciente", back_populates="agendamentos")
    medico = db.relationship("Medico", back_populates="agendamentos")
    exame = db.relationship("Exame", back_populates="agendamentos")
    especialidade = db.relationship("Especialidade")

    def to_dict(self, include_relations: bool = True) -> dict[str, Any]:
        data = {
            "id": self.id,
            "paciente_id": self.paciente_id,
            "medico_id": self.medico_id,
            "exame_id": self.exame_id,
            "especialidade_id": self.especialidade_id,
            "convenio": self.convenio,
            "data": _iso(self.data),
            "horario": _iso(self.horario),
            "status": self.status,
            "valor": _iso(self.valor),
            "observacoes": self.observacoes,
            "data_agendamento": _iso(self.data_agendamento),
            "data_confirmacao": _iso(self.data_confirmacao),
            "data_cancelamento": _iso(self.data_cancelamento),
            "motivo_cancelamento": self.motivo_cancelamento,
            "link_telemedicina": self.link_telemedicina,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }
        if include_relations:
            data["paciente"] = self.paciente.to_dict() if self.paciente else None
            data["medico"] = self.medico.to_dict() if self.medico else None
            data["exame"] = self.exame.to_dict() if self.exame else None
            data["especialidade"] = self.especialidade.to_dict() if self.especialidade else None
        return data


class DisponibilidadeMedico(db.Model):
    __tablename__ = "disponibilidade_medicos"

    id = db.Column(db.Integer, primary_key=True)
    medico_id = db.Column(db.Integer, db.ForeignKey("medicos.id", ondelete="CASCADE"), nullable=False, index=True)
    data = db.Column(db.Date, nullable=False)
    horario = db.Column(db.Time, nullable=False)
    disponivel = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    medico = db.relationship("Medico")

    __table_args__ = (db.UniqueConstraint("medico_id", "data", "horario", name="uk_disp_medico_data_horario"),)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "medico_id": self.medico_id,
            "data": _iso(self.data),
            "horario": _iso(self.horario),
            "disponivel": self.disponivel,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }
