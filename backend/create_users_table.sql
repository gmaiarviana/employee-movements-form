-- Script SQL para criação da tabela users para sistema de autenticação JWT
-- Database: employee_movements (PostgreSQL 15)

-- Extensão para usar UUID (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação da tabela users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Inserção do usuário padrão para ambiente de testes
-- Senha fictícia: 'admin123' (hash fictício para demonstração)
INSERT INTO users (email, password_hash, name, role) VALUES (
    'admin@example.com',
    '$2b$10$rOOjXYZ9k8qNZx5nZxYqPe5vHXqNzqjYqZqNzqjYqZqNzqjYqZqNz',
    'Administrator',
    'admin'
);

-- Verificação dos dados inseridos
SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM users;

-- Comentários sobre o schema:
-- 1. id: UUID como chave primária com geração automática
-- 2. email: TEXT com restrição UNIQUE e NOT NULL
-- 3. password_hash: TEXT NOT NULL para armazenar hash da senha (bcrypt/argon2)
-- 4. name: TEXT opcional para nome do usuário
-- 5. role: TEXT com CHECK constraint limitando valores a 'admin' ou 'user'
-- 6. created_at: TIMESTAMP WITH TIME ZONE com valor padrão atual

-- Para usar este script:
-- 1. Conecte ao banco: docker-compose exec db psql -U app_user -d employee_movements
-- 2. Execute: \i /path/to/create_users_table.sql
-- 3. Ou copie e cole o conteúdo no terminal PostgreSQL
