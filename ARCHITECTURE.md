# Architecture Document - Employee Movements System

## 🏗️ Arquitetura Geral

### Tech Stack
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express.js + CORS
- **Dados**: Arquivos JSON (simulação de banco de dados)
- **Infraestrutura**: Docker multi-serviço
- **Portas**: Frontend (3001), Backend (3000)
- **Styling**: Design System CSS próprio com dark mode automático

### Estrutura Organizacional
```
/
├── frontend/              # Aplicação React independente
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── backend/               # API server independente
│   ├── data/             # Arquivos JSON
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml     # Orquestração dos serviços
├── ARCHITECTURE.md        # Documentação técnica completa
└── README.md             # Guia do usuário
```

## 🐳 Configuração Docker

### Arquitetura de Serviços Separados

Cada serviço tem seu próprio Dockerfile e configuração independente:

#### Frontend Service (Port 3001)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

#### Backend Service (Port 3000)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

#### docker-compose.yml
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - FRONTEND_URL=http://localhost:3001

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend
```

### Comandos de Desenvolvimento

**SEMPRE use Docker, nunca npm diretamente:**

```bash
# Subir todos os serviços
docker-compose up -d --build

# Subir apenas um serviço
docker-compose up backend
docker-compose up frontend

# Ver logs
docker-compose logs backend
docker-compose logs frontend

# Parar serviços
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build
```

### Variáveis de Ambiente

#### Backend
- `PORT`: Porta do servidor (default: 3000)
- `FRONTEND_URL`: URL do frontend para CORS (default: http://localhost:3001)
- `NODE_ENV`: Ambiente (development/production)

#### Frontend
- `VITE_API_URL`: URL do backend (default: http://localhost:3000)
- `NODE_ENV`: Ambiente (development/production)

## Component Structure

### React Components Overview
- **App.jsx**: Main application component with React Router setup
- **Home.jsx**: Central navigation hub with navigation options
- **SelectEmployee.jsx**: Employee selection interface with team member cards
- **EntryForm.jsx**: New employee entry form component
- **ExitForm.jsx**: Employee exit form component  
- **Summary.jsx**: Exit process summary and confirmation
- **SummaryEntry.jsx**: Entry process summary and confirmation
- **AdminDashboard.jsx**: Administrative dashboard for viewing all movements

### UI Styling Approach
- **design-system.css**: Unified CSS design system focused on desktop web usage
- **Inline styles**: Used for critical styling (header contrast) to override CSS conflicts
- **Class-based styling**: Form fields, buttons, and layout components use consistent CSS classes

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
      "isLeader": true,
      "company": "Instituto Atlântico"
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

### entries.json
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

### exits.json
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

### GET /api/employees/:leaderId/team-members
Retorna membros da equipe do usuário logado
```json
{
  "teamMembers": [
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
    "role": "Desenvolvedor Senior",
    "company": "Instituto Atlântico"
  },
  "project": {
    "name": "Sistema ERP",
    "type": "Desenvolvimento", 
    "sow": "SOW-2024-001"
  }
}
```

### GET /api/movements
Retorna histórico consolidado de movimentações
```json
[
  {
    "type": "entrada",
    "date": "2025-01-15",
    "employeeName": "João Silva",
    "details": "Entrada como Desenvolvedor Senior no Projeto Sistema ERP"
  }
]
```

## File Structure
```
/
├── package.json
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── design-system.css
│   │   └── components/
│   │       ├── Home.jsx
│   │       ├── SelectEmployee.jsx
│   │       ├── EntryForm.jsx
│   │       ├── ExitForm.jsx
│   │       ├── Summary.jsx
│   │       ├── SummaryEntry.jsx
│   │       └── AdminDashboard.jsx
└── backend/
    ├── package.json
    ├── server.js
    ├── Dockerfile
    └── data/
        ├── employees.json
        ├── entries.json
        ├── exits.json
        ├── projects.json
        └── employee_projects.json
```

## Data Flow Between Components

### React Router Navigation
- Uses React Router for client-side routing
- Navigation handled via useNavigate hook
- URL parameters managed with useSearchParams hook

1. **Home → SelectEmployee**: Direct navigation (for new exit)
2. **Home → EntryForm**: Direct navigation (for new entry)  
3. **Home → AdminDashboard**: Direct navigation (for admin area)
4. **SelectEmployee → ExitForm**: `?employeeId=EMP002`
5. **ExitForm → Summary**: State passed via useNavigate state or URL params
6. **Summary → Home**: Direct navigation after confirmation
7. **EntryForm → SummaryEntry**: State passed via useNavigate state or URL params
8. **SummaryEntry → Home**: Direct navigation after confirmation

## Docker Configuration

### Multi-Service Architecture
- **Frontend Service**: Vite development server (port 3001)
- **Backend Service**: Express.js API server (port 3000)
- **Proxy Configuration**: Vite proxy redirects API calls to backend

### Development Workflow
- **Start Services**: `docker-compose up -d --build`
- **Frontend URL**: `http://localhost:3001`
- **Backend APIs**: `http://localhost:3000/api/*`
- **Hot Reload**: Vite provides automatic hot reload for React components
- **API Proxy**: Vite automatically proxies `/api/*` requests to backend service

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