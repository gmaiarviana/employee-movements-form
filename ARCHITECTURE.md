# Architecture Document - Employee Exit Process POC

## Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript (páginas separadas)
- **Data**: JSON files (mock database)
- **Infrastructure**: Docker (single container)
- **Port**: 3000

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │───▶│   Express.js    │───▶│   JSON Files    │
│   (4 pages)     │    │   Server        │    │   (Mock DB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Page Structure

### 1. Home Page (`/`)
- Welcome message
- Single button: "Saída de Funcionário"
- Redirects to: `/select-employee`

### 2. Select Employee (`/select-employee`)
- Lista dos liderados do usuário logado (Maria Santos)
- Cards com: Nome, Projeto, Função
- Botão "Selecionar" para cada funcionário
- Redirects to: `/exit-form?employeeId=XXX`

### 3. Exit Form (`/exit-form`)
- Recebe employeeId via URL param
- Campos do formulário:
  - Data de saída (date input)
  - Motivo da saída (textarea)
  - Haverá replacement? (radio: sim/não)
  - Tombo da máquina (text input)
- Botões: "Voltar" | "Continuar"
- Redirects to: `/summary` com dados

### 4. Summary (`/summary`)
- Exibe resumo completo dos 8 campos obrigatórios
- Dados combinados: funcionário + projeto + formulário
- Botões: "Voltar" | "Confirmar Saída"
- Após confirmação: volta para home

## Data Schema

### employees.json
```json
{
  "employees": [
    {
      "id": "EMP001",
      "name": "Maria Santos",
      "email": "maria.santos@company.com",
      "role": "Tech Lead",
      "isLeader": true
    },
    {
      "id": "EMP002", 
      "name": "João Silva",
      "email": "joao.silva@company.com",
      "role": "Desenvolvedor Senior",
      "isLeader": false
    }
  ]
}
```

### projects.json
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

### employee_projects.json
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

## API Endpoints

### GET /api/employees/:leaderId/subordinates
Retorna liderados do usuário logado
```json
{
  "subordinates": [
    {
      "id": "EMP002",
      "name": "João Silva", 
      "project": "Sistema ERP",
      "role": "Desenvolvedor Senior"
    }
  ]
}
```

### GET /api/employees/:id/details
Retorna dados completos para o resumo
```json
{
  "employee": {
    "id": "EMP002",
    "name": "João Silva",
    "email": "joao.silva@company.com",
    "role": "Desenvolvedor Senior"
  },
  "project": {
    "name": "Sistema ERP",
    "type": "Desenvolvimento", 
    "sow": "SOW-2024-001"
  }
}
```

## File Structure
```
/
├── package.json
├── docker-compose.yml
├── Dockerfile
├── server.js
├── src/
│   ├── data/
│   │   ├── employees.json
│   │   ├── projects.json
│   │   └── employee_projects.json  
│   └── public/
│       ├── index.html
│       ├── select-employee.html
│       ├── exit-form.html
│       ├── summary.html
│       ├── css/
│       │   └── styles.css
│       └── js/
│           ├── home.js
│           ├── select-employee.js
│           ├── exit-form.js
│           └── summary.js
```

## Data Flow Between Pages

1. **Home → Select Employee**: Nenhum parâmetro
2. **Select Employee → Exit Form**: `?employeeId=EMP002`
3. **Exit Form → Summary**: `?employeeId=EMP002&exitDate=2025-08-15&reason=Nova%20oportunidade&replacement=sim&machineId=TOMB001`
4. **Summary → Home**: Reset após confirmação

## Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src/data:/app/src/data
```

## Security & Validation
- **POC**: Happy path apenas
- **User simulation**: Hardcoded leaderId = "EMP001"
- **Data validation**: Basic client-side only
- **Error handling**: Minimal

## Scalability Notes
- **MVP**: Replace JSON files with PostgreSQL
- **Authentication**: Add login before select-employee
- **API**: Same endpoints, different data source
- **Frontend**: Same structure, enhanced validations