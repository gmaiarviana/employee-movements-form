# Employee Movements Backend

API REST server para a aplicação de movimentação de funcionários.

## Visão Geral

Este serviço fornece endpoints para:
- Consulta de informações de funcionários
- Dados de projetos e atribuições
- Histórico de movimentações (entradas e saídas)

O backend utiliza PostgreSQL database com Docker para persistência de dados.

## Desenvolvimento

O backend roda via Docker junto com PostgreSQL.

```bash
# Na raiz do projeto - inicia backend + banco de dados
docker-compose up backend

# Para configurar o banco de dados pela primeira vez
docker-compose exec backend node migrate.js
```

## Stack Técnico

- **Node.js 18** + **Express.js 4**
- **CORS** configurado para frontend
- **PostgreSQL 15** + **pg driver** para database
- **Nodemon** para hot reload em desenvolvimento

## Database Schema

### Tabela: employees
```sql
CREATE TABLE employees (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_leader BOOLEAN DEFAULT FALSE,
    company VARCHAR(100) NOT NULL
);
```

### Tabela: projects
```sql
CREATE TABLE projects (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    sow VARCHAR(50),
    leader_id VARCHAR(10),
    FOREIGN KEY (leader_id) REFERENCES employees(id)
);
```

### Tabela: employee_projects
```sql
CREATE TABLE employee_projects (
    employee_id VARCHAR(10),
    project_id VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Tabela: entries
```sql
CREATE TABLE entries (
    id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(10) NOT NULL,
    project_id VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    role VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Tabela: exits
```sql
CREATE TABLE exits (
    id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(10) NOT NULL,
    project_id VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    exit_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

## Database Migration

Para configurar o banco de dados, execute o script de migração:

```bash
# Na raiz do projeto, após docker-compose up
docker-compose exec backend node migrate.js
```

Este comando criará todas as tabelas e inserirá dados de exemplo necessários para o funcionamento da aplicação.

## API Endpoints

- `GET /api/health` - Status do serviço
- `GET /api/employees/:leaderId/team-members` - Membros da equipe
- `GET /api/employees/:id/details` - Detalhes do funcionário
- `GET /api/movements` - Histórico de movimentações

Todos os endpoints agora utilizam PostgreSQL para consulta e manipulação de dados.

### GET /api/employees/:leaderId/team-members
**Lógica**:
1. Consulta projetos liderados pelo `leaderId` na tabela projects
2. Encontra atribuições ativas para estes projetos na tabela employee_projects
3. Retorna dados consolidados funcionário + projeto via JOIN

### GET /api/employees/:id/details  
**Lógica**:
1. Busca dados do funcionário por ID na tabela employees
2. Encontra projeto ativo do funcionário via JOIN com employee_projects e projects
3. Retorna dados consolidados

### GET /api/movements
**Lógica**:
1. Consulta tabelas entries e exits com JOIN para dados de funcionários e projetos
2. Consolida em formato único ordenado cronologicamente
3. Retorna histórico completo de movimentações

## Configurações

### Environment Variables
```bash
PORT=3000                           # Porta do servidor
FRONTEND_URL=http://localhost:3001  # URL do frontend para CORS
NODE_ENV=development                # Ambiente
DB_HOST=localhost                   # Host do banco PostgreSQL
DB_PORT=5432                        # Porta do banco PostgreSQL
DB_NAME=employee_movements          # Nome do banco de dados
DB_USER=postgres                    # Usuário do banco de dados
DB_PASSWORD=postgres                # Senha do banco de dados
```

### CORS Setup
```js
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}))
```