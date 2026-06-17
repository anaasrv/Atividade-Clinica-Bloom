from config import Config
from extensions import db
from app import create_app

app = create_app()

with app.app_context():
    print('=== Banco de Dados Integrado - Bloom Maternity ===')
    print('Stack atual: Python + Flask + SQLAlchemy + MySQL')
    print()
    
    print('=== Tabelas existentes ===')
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    for table in sorted(tables):
        print(f'- {table}')
    
    print()
    print('=== Colunas da tabela pacientes ===')
    columns = inspector.get_columns('pacientes')
    for col in columns:
        print(f'- {col["name"]}: {col["type"]}')
    
    print()
    print('=== Colunas da tabela agendamentos ===')
    columns = inspector.get_columns('agendamentos')
    for col in columns:
        print(f'- {col["name"]}: {col["type"]}')
    
    print()
    print('=== Colunas da tabela avaliacoes ===')
    columns = inspector.get_columns('avaliacoes')
    for col in columns:
        print(f'- {col["name"]}: {col["type"]}')