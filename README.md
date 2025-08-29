# Employee Movements System

Sistema web para registro de movimentações de funcionários (entradas e saídas) com PostgreSQL.

## 🚀 Funcionalidades

- **Autenticação JWT**: Sistema de login/registro seguro
- **Registro de Saída**: Formulário para registrar saída de funcionários
- **Registro de Entrada**: Formulário para registrar entrada de novos funcionários  
- **Dashboard Admin**: Visualização de todas as movimentações registradas
- **Interface Responsiva**: Design adaptativo para diferentes dispositivos
- **Persistência PostgreSQL**: Banco de dados robusto com autenticação

## 🚀 Como executar

### Pré-requisitos
- Docker Desktop instalado

### Iniciar o sistema
```bash
git clone https://guilherme_viana1@bitbucket.org/institutoatlantico/employee-movements-form.git
cd employee-movements-form

# Copiar arquivos de configuração
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Iniciar os containers
docker-compose up -d --build
```

**Acesse**: http://localhost:3001

### Verificar se está funcionando

```bash
# Verificar se os containers estão rodando
docker-compose ps

# Testar a API
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Verificar dados no banco
docker-compose exec db psql -U app_user -d employee_movements -c "SELECT COUNT(*) FROM core.employees;"

# Testar autenticação
Invoke-WebRequest -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"username":"test","email":"test@email.com","password":"123456"}'
```

## 📖 Documentação Técnica

- `backend/README_BACKEND.md` - API, banco PostgreSQL, endpoints
- `frontend/README_FRONTEND.md` - React, componentes, design system
- `DEVELOPMENT_GUIDELINES.md` - Diretrizes de desenvolvimento
- `ROADMAP.md` - Roadmap e features do projeto

## 🛑 Como parar

```bash
docker-compose down
```