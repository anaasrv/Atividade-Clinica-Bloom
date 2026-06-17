from decimal import Decimal

from extensions import db
from models import Especialidade, Exame, Medico, Paciente

ESPECIALIDADES = [
    ("Obstetrícia", "Acompanhamento da gestação, pré-natal, parto e puerpério."),
    ("Ginecologia", "Cuidado preventivo, saúde íntima, contracepção e acompanhamento da saúde feminina."),
    ("Medicina Fetal", "Diagnóstico pré-natal, ultrassonografia morfológica e gestação de alto risco."),
    ("Reprodução Humana", "Fertilidade, investigação de infertilidade e reprodução assistida."),
    ("Ultrassonografia", "Exames de imagem ginecológicos e obstétricos."),
]

EXAMES = [
    {"nome": "Consulta Ginecológica", "descricao": "Consulta clínica de rotina.", "categoria": "Consulta", "preco": Decimal("180.00"), "duracao": 30, "ordem_exibicao": 1},
    {"nome": "Consulta Pré-natal", "descricao": "Acompanhamento gestacional.", "categoria": "Consulta", "preco": Decimal("220.00"), "duracao": 40, "ordem_exibicao": 2},
    {"nome": "Ultrassonografia Obstétrica", "descricao": "Exame de imagem obstétrica.", "categoria": "Ultrassonografia", "preco": Decimal("250.00"), "duracao": 30, "ordem_exibicao": 3},
    {"nome": "Ultrassom Morfológico", "descricao": "Avaliação detalhada da anatomia fetal.", "categoria": "Ultrassonografia", "preco": Decimal("380.00"), "duracao": 45, "ordem_exibicao": 4},
    {"nome": "Preventivo Papanicolau", "descricao": "Rastreamento preventivo ginecológico.", "categoria": "Preventivo", "preco": Decimal("80.00"), "duracao": 15, "ordem_exibicao": 5},
]

MEDICOS = [
    {"nome": "Dr. Gustavo Henrique Martins", "especialidade": "Reprodução Humana", "crm": "145987-SP", "foto": "../assets/images/dr-gustavo-henrique-martins.png", "email": "gustavo.martins@bloommaternity.com.br", "telefone": "(11) 99999-1111", "resumo": "Fertilidade do casal, inseminação artificial e FIV.", "experiencia_anos": 12, "avaliacao": Decimal("4.90"), "total_avaliacoes": 128, "horario_inicio": "08:00", "horario_fim": "18:00"},
    {"nome": "Dr. Ricardo Almeida Costa", "especialidade": "Medicina Fetal", "crm": "132456-SP", "foto": "../assets/images/dr-ricardo-almeida-costa.png", "email": "ricardo.costa@bloommaternity.com.br", "telefone": "(11) 99999-2222", "resumo": "Ultrassom morfológico, acompanhamento fetal e gestação de risco.", "experiencia_anos": 10, "avaliacao": Decimal("4.80"), "total_avaliacoes": 95, "horario_inicio": "09:00", "horario_fim": "19:00"},
    {"nome": "Dra. Fernanda Ribeiro Alves", "especialidade": "Reprodução Humana", "crm": "149876-SP", "foto": "../assets/images/dra-fernanda-ribeiro-alves.png", "email": "fernanda.alves@bloommaternity.com.br", "telefone": "(11) 99999-3333", "resumo": "Hormônios femininos, infertilidade e menopausa.", "experiencia_anos": 8, "avaliacao": Decimal("4.90"), "total_avaliacoes": 87, "horario_inicio": "08:00", "horario_fim": "17:00"},
    {"nome": "Dra. Mariana Costa Ferreira", "especialidade": "Obstetrícia", "crm": "181654-SP", "foto": "../assets/images/dra-mariana-costa-ferreira.png", "email": "mariana.ferreira@bloommaternity.com.br", "telefone": "(11) 99999-4444", "resumo": "Gestação, parto normal, puerpério e amamentação.", "experiencia_anos": 15, "avaliacao": Decimal("5.00"), "total_avaliacoes": 156, "horario_inicio": "08:00", "horario_fim": "16:00"},
    {"nome": "Dra. Ana Carolina Mendes", "especialidade": "Ginecologia", "crm": "154789-SP", "foto": "../assets/images/dra-ana-carolina-mendes.png", "email": "ana.mendes@bloommaternity.com.br", "telefone": "(11) 99999-5555", "resumo": "Pré-natal, parto humanizado, contracepção e saúde feminina.", "experiencia_anos": 11, "avaliacao": Decimal("4.90"), "total_avaliacoes": 142, "horario_inicio": "08:00", "horario_fim": "18:00"},
]


def _parse_time(text):
    from datetime import datetime

    return datetime.strptime(text, "%H:%M").time()


def seed_initial_data() -> None:
    esp_by_name = {}
    for nome, descricao in ESPECIALIDADES:
        esp = Especialidade.query.filter_by(nome=nome).first()
        if not esp:
            esp = Especialidade(nome=nome, descricao=descricao, ativo=True)
            db.session.add(esp)
        esp_by_name[nome] = esp
    db.session.commit()

    exames = []
    for item in EXAMES:
        exame = Exame.query.filter_by(nome=item["nome"]).first()
        if not exame:
            exame = Exame(**item, ativo=True)
            db.session.add(exame)
        exames.append(exame)
    db.session.commit()

    for item in MEDICOS:
        medico = Medico.query.filter_by(crm=item["crm"]).first()
        esp = esp_by_name[item["especialidade"]]
        if not medico:
            medico = Medico(
                nome=item["nome"],
                especialidade_id=esp.id,
                crm=item["crm"],
                foto=item["foto"],
                email=item["email"],
                telefone=item["telefone"],
                resumo=item["resumo"],
                experiencia_anos=item["experiencia_anos"],
                avaliacao=item["avaliacao"],
                total_avaliacoes=item["total_avaliacoes"],
                horario_inicio=_parse_time(item["horario_inicio"]),
                horario_fim=_parse_time(item["horario_fim"]),
                intervalo_consulta=30,
                dias_atendimento="1,2,3,4,5",
                ativo=True,
                disponivel=True,
            )
            db.session.add(medico)
            db.session.flush()
        medico.exames_realizados = exames
    db.session.commit()

    admin = Paciente.query.filter_by(email="admin@bloommaternity.com.br").first()
    if not admin:
        admin = Paciente(
            nome="Administrador Bloom",
            email="admin@bloommaternity.com.br",
            telefone="(11) 99999-0000",
            tipo_usuario="admin",
            is_admin=True,
            ativo=True,
        )
        admin.set_password("admin123")
        db.session.add(admin)

    paciente = Paciente.query.filter_by(email="paciente@bloommaternity.com.br").first()
    if not paciente:
        paciente = Paciente(
            nome="Paciente Demonstração",
            email="paciente@bloommaternity.com.br",
            telefone="(11) 98888-0000",
            tipo_usuario="paciente",
            is_admin=False,
            ativo=True,
        )
        paciente.set_password("paciente123")
        db.session.add(paciente)

    db.session.commit()
