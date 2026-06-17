# Backend Flask - Bloom Maternity

Este backend substitui a versão antiga em Node.js/Express por Python + Flask.

## Como rodar

1. Abra o MySQL pelo XAMPP e deixe o serviço **MySQL** ligado.
2. Entre na pasta do backend:

```bash
cd backend
```

3. Crie e ative o ambiente virtual:

```bash
python -m venv venv
venv\Scripts\activate
```

4. Instale as dependências:

```bash
pip install -r requirements.txt
```

5. Copie `.env.example` para `.env` e ajuste usuário/senha do MySQL, se necessário.

6. Rode o servidor:

```bash
python app.py
```

A API ficará em:

```text
http://localhost:5000/api
```

O site também pode ser aberto pelo próprio Flask:

```text
http://localhost:5000
```

## Acessos de demonstração

Administrador:

```text
E-mail: admin@bloommaternity.com.br
Senha: admin123
```

Paciente:

```text
E-mail: paciente@bloommaternity.com.br
Senha: paciente123
```
