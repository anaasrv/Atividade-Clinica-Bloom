# Bloom Maternity — Sistema Integrado Flask

Projeto unificado com área pública, área do paciente, painel administrativo, API REST em **Python Flask** e banco de dados **MySQL**.

## Acessos de teste criados automaticamente pelo servidor

- Administrador: `admin@bloommaternity.com.br` / `admin123`
- Paciente: `paciente@bloommaternity.com.br` / `paciente123`

## Como rodar

1. Abra o XAMPP e inicie o serviço **MySQL**.
2. Entre na pasta `backend`.
3. Crie o ambiente virtual:

```bash
python -m venv venv
venv\Scripts\activate
```

4. Instale as dependências:

```bash
pip install -r requirements.txt
```

5. Copie `.env.example` para `.env` e ajuste usuário/senha do MySQL, se necessário.

6. Rode:

```bash
python app.py
```

7. Acesse:

- Site público: `http://localhost:5000`
- Painel admin: `http://localhost:5000/admin-painel.html`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

## Banco de dados

O backend cria o banco e as tabelas automaticamente quando estas variáveis estiverem ativas no `.env`:

```env
AUTO_CREATE_DATABASE=true
AUTO_CREATE_TABLES=true
AUTO_SEED=true
```

Se preferir criar manualmente pelo MySQL Workbench, execute:

```text
backend/database/schema_mysql.sql
```

Também foi mantido o alias:

```text
backend/database/script.sql
```

## Estrutura principal

```txt
frontend/
  assets/
  components/
  css/
  js/
  pages/
backend/
  app.py
  config.py
  extensions.py
  database/
  models/
  routes/
  services/
  utils/
  requirements.txt
```

## CRUDs integrados

- Usuários/pacientes: `/api/pacientes`
- Login/cadastro/perfil/senha: `/api/auth`
- Médicos: `/api/medicos`
- Horários: `/api/medicos/:id/horarios`
- Consultas/agendamentos: `/api/agendamentos`
- Especialidades: `/api/especialidades`
- Procedimentos/exames: `/api/procedimentos` ou `/api/exames`
- Dashboard admin: `/api/admin/dashboard`
