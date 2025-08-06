# Employee Movements Backend

API REST server para a aplicação de movimentação de funcionários.

## Visão Geral

Este serviço fornece endpoints para:
- Consulta de informações de funcionários
- Dados de projetos e atribuições
- Histórico de movimentações (entradas e saídas)

## Desenvolvimento

O backend roda exclusivamente via Docker. Para detalhes técnicos completos, consulte `ARCHITECTURE.md` na raiz do projeto.

```bash
# Na raiz do projeto
docker-compose up backend
```

## Stack Técnico

- **Node.js 18** + **Express.js 4**
- **CORS** configurado para frontend
- **JSON files** como database (MVP)
- **Nodemon** para hot reload em desenvolvimento

## Estrutura de Dados

### employees.json - Dados dos funcionários
```json
{
  "employees": [
    {
      "id": "EMP001",
      "name": "Maria Santos", 
      "email": "maria.santos@company.com",
      "role": "Tech Lead",
      "isLeader": true,
      "company": "Instituto Atlântico"
    }
  ]
}
```

### projects.json - Projetos disponíveis
```json
{
  "projects": [
    {
      "id": "PROJ001",
      "name": "Sistema ERP",
      "type": "Desenvolvimento", 
      "sow": "SOW-2024-001",
      "leaderId": "EMP001"
    }
  ]
}
```

### employee_projects.json - Atribuições ativo/inativo
```json
{
  "assignments": [
    {
      "employeeId": "EMP002",
      "projectId": "PROJ001", 
      "isActive": true
    }
  ]
}
```

### entries.json - Histórico de entradas
```json
[
  {
    "id": "ENTRY001",
    "employeeId": "EMP002",
    "projectId": "PROJ001", 
    "date": "2025-01-15",
    "role": "Desenvolvedor Senior",
    "startDate": "2025-01-15"
  }
]
```

### exits.json - Histórico de saídas
```json
[
  {
    "id": "EXIT001", 
    "employeeId": "EMP002",
    "projectId": "PROJ001",
    "date": "2025-07-30",
    "reason": "Fim de contrato",
    "exitDate": "2025-07-30"
  }
]
```

## API Endpoints

- `GET /api/health` - Status do serviço
- `GET /api/employees/:leaderId/team-members` - Membros da equipe
- `GET /api/employees/:id/details` - Detalhes do funcionário
- `GET /api/movements` - Histórico de movimentações

### GET /api/employees/:leaderId/team-members
**Lógica**:
1. Busca projetos liderados pelo `leaderId`
2. Encontra atribuições ativas para estes projetos  
3. Retorna dados consolidados funcionário + projeto

### GET /api/employees/:id/details  
**Lógica**:
1. Busca dados do funcionário por ID
2. Encontra projeto ativo do funcionário
3. Retorna dados consolidados

### GET /api/movements
**Lógica**:
1. Lê `entries.json` e `exits.json`
2. Para cada entrada/saída, busca dados do funcionário e projeto
3. Consolida em formato único ordenado cronologicamente

## Configurações

### Environment Variables
```bash
PORT=3000                           # Porta do servidor
FRONTEND_URL=http://localhost:3001  # URL do frontend para CORS
NODE_ENV=development                # Ambiente
```

### CORS Setup
```js
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}))
```

## Preparação para Produção

### Migração para PostgreSQL
A arquitetura atual facilita esta migração - APIs mantêm mesma interface, apenas implementação interna muda de arquivos JSON para queries SQL.

### Melhorias Sugeridas
1. **Validação**: Express Validator para input validation
2. **Logging**: Winston para logs estruturados  
3. **Rate Limiting**: Express-rate-limit
4. **Authentication**: JWT middleware
5. **Testing**: Jest + Supertest para testes de API