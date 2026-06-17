-- ==========================================================================
-- Banco de Dados Integrado - Bloom Maternity
-- Stack atual: Python + Flask + SQLAlchemy + MySQL
-- Execute este arquivo no MySQL Workbench caso queira criar o banco manualmente.
-- O Flask também cria as tabelas automaticamente quando AUTO_CREATE_TABLES=true.
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS bloom_maternity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloom_maternity;

CREATE TABLE IF NOT EXISTS pacientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  data_nascimento DATE,
  genero VARCHAR(40) DEFAULT 'Prefiro não informar',
  telefone VARCHAR(20),
  endereco TEXT,
  cep VARCHAR(10),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_login DATETIME,
  token_recuperacao VARCHAR(255),
  token_recuperacao_expira DATETIME,
  aceita_comunicacoes BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  tipo_usuario VARCHAR(20) DEFAULT 'paciente',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS especialidades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS exames (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco DECIMAL(10,2) DEFAULT 0,
  duracao INT DEFAULT 30,
  preparo TEXT,
  resultado_entrega VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  ordem_exibicao INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS medicos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(200) NOT NULL,
  especialidade_id INT NOT NULL,
  crm VARCHAR(20) NOT NULL UNIQUE,
  foto VARCHAR(500),
  email VARCHAR(100),
  telefone VARCHAR(20),
  resumo TEXT,
  descricao TEXT,
  formacao TEXT,
  experiencia TEXT,
  premios TEXT,
  experiencia_anos INT DEFAULT 0,
  avaliacao DECIMAL(3,2) DEFAULT 5.0,
  total_avaliacoes INT DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  disponivel BOOLEAN DEFAULT TRUE,
  horario_inicio TIME DEFAULT '08:00:00',
  horario_fim TIME DEFAULT '18:00:00',
  intervalo_consulta INT DEFAULT 30,
  dias_atendimento VARCHAR(50) DEFAULT '1,2,3,4,5',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
);

CREATE TABLE IF NOT EXISTS medico_exames (
  medico_id INT NOT NULL,
  exame_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (medico_id, exame_id),
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE,
  FOREIGN KEY (exame_id) REFERENCES exames(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  paciente_id INT NOT NULL,
  medico_id INT NOT NULL,
  exame_id INT NOT NULL,
  especialidade_id INT NULL,
  convenio VARCHAR(120) DEFAULT 'Particular',
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'agendado',
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  data_agendamento DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_confirmacao DATETIME,
  data_cancelamento DATETIME,
  motivo_cancelamento TEXT,
  link_telemedicina VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (medico_id) REFERENCES medicos(id),
  FOREIGN KEY (exame_id) REFERENCES exames(id),
  FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
);

CREATE TABLE IF NOT EXISTS disponibilidade_medicos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medico_id INT NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_disp_medico_data_horario (medico_id, data, horario)
);
