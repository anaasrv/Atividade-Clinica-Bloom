# Bloom Maternity — versão final corrigida

## Principais correções aplicadas

- Carrossel de médicos corrigido: agora os botões laterais movem os cards horizontalmente.
- Perfil do médico corrigido: cada card abre o perfil correto pelo parâmetro `id`.
- Dados oficiais dos médicos incluídos em `frontend/js/bloom-data.js` como fallback quando o back-end não estiver rodando.
- Fotos e logo adicionadas em `frontend/assets/images/`.
- Navbar reduzida e com logo visual.
- Seção “Como Chegar” da página de unidades corrigida: HTML quebrado, cards desalinhados e texto incompleto.
- Modo noturno reforçado: cards, textos, dropdowns, tabelas e fundos não somem mais.
- Perfil admin adicionado em `frontend/pages/admin.html`.
- Banco de dados atualizado com campos `tipo_usuario` e `is_admin` na tabela `pacientes`.
- Back-end migrado para Flask com models SQLAlchemy, rotas REST e serviços de agendamento.
- Cadastro corrigido para não aplicar hash duplo na senha.

## Como rodar

### Back-end Flask

Entre na pasta `backend` e rode:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

A API e o site rodam por padrão em `http://localhost:5000`.

### Banco de dados

O Flask cria o banco/tabelas automaticamente se `AUTO_CREATE_DATABASE=true` e `AUTO_CREATE_TABLES=true`.
Se preferir executar manualmente, use:

```text
backend/database/schema_mysql.sql
```

Variáveis principais do `.env`:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=bloom_maternity
MYSQL_USER=root
MYSQL_PASSWORD=
PORT=5000
FRONTEND_URL=http://localhost:5000
```

## Perfil admin
Para liberar acesso administrativo real no back-end, marque um usuário no banco:

```sql
UPDATE pacientes
SET tipo_usuario = 'admin', is_admin = TRUE
WHERE email = 'email-do-admin@exemplo.com';
```


## Correções finais 2
- Logo aumentada sem criar faixa branca extra no topo.
- Removido o espaço branco antes do hero/carrossel principal.
- Cards dos médicos harmonizados com mesma largura, altura mínima, imagem padronizada e botão alinhado no rodapé.
- Carrossel dos médicos com cálculo dinâmico de avanço, reset de posição e botões anterior/próximo atualizados.
- Página de detalhe do médico agora renderiza primeiro os dados locais corretos pelo ID da URL, evitando aparecer Dra. Ana antes de trocar para o médico certo.
- A resposta da API só atualiza o perfil se o ID retornado for o mesmo da URL.
- Botão “Ver mais avaliações” agora executa ação no front-end e não fica inativo.
- Validação de sintaxe Python executada com `compileall`.


## Correção v3
- Navbar e footer foram inseridos diretamente nas páginas para não depender de jQuery `.load()`, que pode falhar ao abrir pelo Live Server/arquivo local.
- Carrossel dos médicos corrigido para rolar o container correto, não o track interno.
- Cards dos médicos padronizados com largura, altura, imagem e botão alinhados.
- Carrossel renderiza primeiro os dados locais oficiais e só depois tenta API, evitando atraso visual ou cards vazios.
