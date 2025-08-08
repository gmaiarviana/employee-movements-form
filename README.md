# Employee Movements System

Sistema web para registro de movimentações de funcionários (entradas e saídas) com PostgreSQL.

## 🚀 Funcionalidades

- **Registro de Saída**: Formulário para registrar saída de funcionários
- **Registro de Entrada**: Formulário para registrar entrada de novos funcionários  
- **Dashboard Admin**: Visualização de todas as movimentações registradas
- **Interface Responsiva**: Design adaptativo para diferentes dispositivos
- **Persistência PostgreSQL**: Banco de dados robusto com migração automatizada

## 🚀 Como executar

### Pré-requisitos
- Docker Desktop instalado

### Iniciar o sistema
```bash
git clone <repository-url>
cd employee-movements-form
docker-compose up -d --build

# Configurar banco de dados na primeira execução
docker-compose exec backend node migrate.js
```

**Acesse**: http://localhost:3001

## � Documentação Técnica

- `backend/README_BACKEND.md` - API, banco PostgreSQL, endpoints
- `frontend/README_FRONTEND.md` - React, componentes, design system
- `DEVELOPMENT_GUIDELINES.md` - Diretrizes de desenvolvimento
- `ROADMAP.md` - Roadmap e features do projeto

## 🛑 Como parar

```bash
docker-compose down
```