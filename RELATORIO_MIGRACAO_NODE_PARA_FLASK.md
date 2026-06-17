# Relatório de Migração — Node.js para Python Flask

## 1. Objetivo

O objetivo desta alteração foi substituir a estrutura antiga do backend em **Node.js + Express + Sequelize** por uma estrutura em **Python + Flask + SQLAlchemy**, mantendo a integração com o front-end existente da Clínica Bloom Maternity e preservando o uso de banco de dados MySQL.

## 2. Principais mudanças realizadas

### Backend

- Removida a estrutura antiga baseada em Node.js:
  - `server.js`
  - `package.json`
  - `package-lock.json`
  - controllers, routes, middlewares e models em JavaScript.
- Criada nova estrutura Flask em `backend/`:
  - `app.py`: aplicação principal Flask.
  - `config.py`: configuração de ambiente, MySQL e JWT.
  - `extensions.py`: inicialização de SQLAlchemy, Bcrypt e JWT.
  - `models/__init__.py`: models SQLAlchemy para pacientes, médicos, exames, especialidades, agendamentos e disponibilidade.
  - `routes/`: rotas REST separadas por módulo.
  - `services/`: seed inicial e regras de agendamento.
  - `utils/`: autenticação, validações e respostas padronizadas.
  - `requirements.txt`: dependências Python.
  - `.env.example`: exemplo de configuração.

### Banco de dados

- Mantido MySQL como banco principal.
- Criado `backend/database/schema_mysql.sql` atualizado para a stack Flask.
- Adicionado suporte à criação automática do banco e das tabelas quando configurado:
  - `AUTO_CREATE_DATABASE=true`
  - `AUTO_CREATE_TABLES=true`
  - `AUTO_SEED=true`
- Mantido seed inicial com:
  - especialidades;
  - procedimentos/exames;
  - médicos;
  - usuário administrador;
  - paciente de demonstração.

### Autenticação e segurança

- Substituído `jsonwebtoken` por `Flask-JWT-Extended`.
- Substituído `bcryptjs` por `Flask-Bcrypt`.
- Criados decorators de proteção:
  - `auth_required`
  - `admin_required`
- Senhas são armazenadas com hash bcrypt.
- Mantida compatibilidade com senhas antigas em texto puro, caso existam registros legados no banco.

### Front-end

- Atualizados os arquivos JavaScript do front-end que apontavam para:

```text
http://localhost:3000/api
```

Agora apontam para:

```text
http://localhost:5000/api
```

Arquivos ajustados incluem:

- `frontend/js/api.js`
- `frontend/js/auth.js`
- `frontend/js/admin-dashboard.js`
- `frontend/js/minhas-consultas.js`
- `frontend/js/perfil.js`
- `frontend/js/recuperar-senha.js`

## 3. Rotas mantidas na nova API

### Autenticação

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/validate`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `PUT /api/auth/change-password`
- `POST /api/auth/logout`

### Pacientes

- `GET /api/pacientes`
- `GET /api/pacientes/me`
- `GET /api/pacientes/:id`
- `POST /api/pacientes`
- `PUT /api/pacientes/:id`
- `DELETE /api/pacientes/:id`
- `GET /api/pacientes/:id/agendamentos`

### Médicos

- `GET /api/medicos`
- `POST /api/medicos`
- `GET /api/medicos/:id`
- `PUT /api/medicos/:id`
- `DELETE /api/medicos/:id`
- `GET /api/medicos/:id/exames`
- `PUT /api/medicos/:id/exames`
- `GET /api/medicos/:id/horarios`
- `POST /api/medicos/:id/horarios`

### Agendamentos

- `GET /api/agendamentos/disponibilidade`
- `POST /api/agendamentos`
- `GET /api/agendamentos`
- `GET /api/agendamentos/meus`
- `GET /api/agendamentos/paciente/:id`
- `GET /api/agendamentos/paciente/:id/futuras`
- `GET /api/agendamentos/paciente/:id/historico`
- `GET /api/agendamentos/medico/:id`
- `GET /api/agendamentos/:id`
- `PUT /api/agendamentos/:id`
- `PUT /api/agendamentos/:id/reagendar`
- `PUT /api/agendamentos/:id/confirmar`
- `PUT /api/agendamentos/:id/cancelar`
- `DELETE /api/agendamentos/:id`

### Procedimentos, exames e especialidades

- `GET /api/exames`
- `GET /api/exames/:id`
- `POST /api/exames`
- `PUT /api/exames/:id`
- `DELETE /api/exames/:id`
- `GET /api/procedimentos`
- `POST /api/procedimentos`
- `PUT /api/procedimentos/:id`
- `DELETE /api/procedimentos/:id`
- `GET /api/especialidades`
- `POST /api/especialidades`
- `PUT /api/especialidades/:id`
- `DELETE /api/especialidades/:id`

### Admin, notificações e unidades

- `GET /api/admin/dashboard`
- `GET /api/admin/consultas-hoje`
- `GET /api/admin/notificacoes`
- `GET /api/notificacoes`
- `POST /api/notificacoes`
- `GET /api/unidades`
- `GET /api/unidades/:id/horarios`

## 4. Como executar

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Depois, abra:

```text
http://localhost:5000
```

## 5. Observações importantes

- O projeto foi reestruturado para Flask e as rotas principais foram mantidas para não quebrar o front-end.
- Não foi possível validar conexão real com MySQL dentro deste ambiente, porque não há um servidor MySQL/XAMPP ativo aqui.
- Foi feita validação de sintaxe dos arquivos Python por compilação local.
- Ao rodar no seu computador, confirme se o MySQL está ligado no XAMPP e se o `.env` está com usuário, senha, porta e banco corretos.
