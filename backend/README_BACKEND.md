# Employee Movements Backend

API REST server para a aplicação de movimentação de funcionários.

## Visão Geral

Este serviço fornece endpoints para:
- **Autenticação JWT**: Registro e login de usuários
- **Consulta de informações de funcionários**
- **Dados de projetos e atribuições**
- **Histórico de movimentações (entradas e saídas)**
- **Health check**: Monitoramento do status do serviço

O backend utiliza PostgreSQL database com Docker para persistência de dados e autenticação JWT para proteção de rotas.

## Desenvolvimento

O backend roda via Docker junto com PostgreSQL.

```bash
# Na raiz do projeto - inicia backend + banco de dados
docker-compose up backend

# Para verificar se o banco está funcionando
docker-compose exec db psql -U app_user -d employee_movements
```

## Stack Técnico

- **Node.js 18** + **Express.js 4**
- **CORS** configurado para frontend
- **PostgreSQL 15** + **pg driver** para database
- **Nodemon** para hot reload em desenvolvimento
- **JWT (jsonwebtoken)** para autenticação
- **bcryptjs** para hash de senhas
- **dotenv** para gerenciamento de variáveis de ambiente
- **Arquitetura MVC parcial** com controllers separados

> **Database Schema**: Ver `DATABASE.md` para schema completo e queries detalhadas

### Estrutura do Banco (Resumo)

O banco utiliza PostgreSQL com 2 schemas principais:

- **`core.*`**: Usuários e funcionários (`users`, `employees`)
- **`hp_portfolio.*`**: Projetos e movimentações - apenas 3 tabelas: (`projects`, `project_managers`, `movements`)

**Tabela Principal:**
- `hp_portfolio.movements` - Fonte única para todas as movimentações (entradas e saídas)

**Campos Específicos HP:** `hp_employee_id`, `compliance_training`, `billable`, `project_type`, etc.

## Verificando o Database

Para verificar a estrutura do banco:

```bash
# Conectar ao PostgreSQL
docker exec employee-movements-form-db-1 psql -U app_user -d employee_movements

# Verificação básica das 3 tabelas principais
\dt core.*                             -- Tabelas do schema core (users, employees)
\dt hp_portfolio.*                     -- 3 tabelas: projects, project_managers, movements
SELECT COUNT(*) FROM hp_portfolio.movements;    -- Verificar dados da tabela principal
SELECT COUNT(*) FROM hp_portfolio.projects;     -- Verificar projetos cadastrados
SELECT COUNT(*) FROM hp_portfolio.project_managers;  -- Verificar gerentes atribuídos
\q                                     -- Sair do PostgreSQL
```

## API Endpoints

### Sistema
- `GET /api/health` - Status do serviço

### Autenticação
- `POST /api/register` - Registro de novos usuários
- `POST /api/login` - Login de usuários

### Funcionários (🔒 Protegidos por JWT)
- `GET /api/employees` - Lista todos os funcionários
- `GET /api/employees/:leaderId/team-members` - Membros da equipe
- `GET /api/employees/:id/details` - Detalhes do funcionário

### Movimentações (🔒 Protegidos por JWT)
- `GET /api/movements` - Histórico de movimentações
- `POST /api/entries` - Nova entrada
- `POST /api/exits` - Nova saída

**Nota**: 
- Endpoints marcados com 🔒 requerem autenticação JWT via header `Authorization: Bearer <token>`
- Todos os endpoints utilizam PostgreSQL para consulta e manipulação de dados
- O servidor valida automaticamente todas as variáveis de ambiente obrigatórias na inicialização
- Rotas não encontradas retornam lista de endpoints disponíveis

## Configurações

> **Environment Variables**: Ver `backend/.env.example` para todas as variáveis disponíveis

**Validação Automática**: O servidor valida automaticamente todas as variáveis obrigatórias na inicialização e interrompe a execução se alguma estiver ausente, mostrando quais variáveis estão faltando.

### Logs de Inicialização
O servidor exibe status da configuração, URLs de health check e configuração do CORS.

### CORS Setup
```js
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}))
```

### Autenticação JWT
Rotas protegidas requerem token JWT via header `Authorization: Bearer <token>`.

```js
fetch('/api/movements', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## Links Úteis

- **`DATABASE.md`** - Schema completo
- **`.env.example`** - Configurações  
- **`frontend/README_FRONTEND.md`** - Interface React