# Architecture Document - Employee Movements System

## 🏗️ Arquitetura Geral

### Tech Stack
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express.js + CORS
- **Dados**: Arquivos JSON (simulação de banco de dados)
- **Infraestrutura**: Docker multi-serviço
- **Portas**: Frontend (3001), Backend APIs (3000)
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

### Current Styling Pattern
Components use direct CSS classes from design-system.css:
- `.btn`, `.btn--primary`, `.btn--secondary` for buttons
- `.form-field`, `.form-label`, `.form-group` for forms  
- `.header`, `.container`, `.main-content` for layout
- `.radio-group`, `.radio-item` for radio button styling

### 1. Home Component (`/`)
- Central navigation hub post-login (simulated)
- Navigation options using useNavigate:
  - "Nova Entrada" → `/entry-form`
  - "Nova Saída" → `/select-employee`
  - "Administrador" → `/admin-dashboard`

### 2. SelectEmployee Component (`/select-employee`)
- Displays team members for logged user (Maria Santos)
- Employee cards with: Name, Project, Role
- "Selecionar" button for each employee
- Navigation: `/exit-form?employeeId=XXX` using useNavigate and useSearchParams

### 3. ExitForm Component (`/exit-form`)
- Receives employeeId via useSearchParams
- Form fields:
  - Exit date (date input)
  - Exit reason (textarea)
  - Will there be replacement? (radio: yes/no)
  - Machine ID (text input)
- Navigation: "Voltar" | "Continuar" → `/summary` with form data

### 4. Summary Component (`/summary`)
- Displays complete summary of 8 mandatory fields
- Combined data: employee + project + form
- Navigation: "Voltar" | "Confirmar Saída" → back to home after confirmation

### 5. EntryForm Component (`/entry-form`)
- New employee entry form with fields:
    - Full Name (text input)
    - CPF (text input)
    - Email (text input)
    - Institute Name (text input)
    - HP Compliance Training completed? (radio: yes/no)
    - Is billable? (radio: yes/no)
    - Start Date (date input)
    - Professional Role (text input)
    - HP Project Name (text input)
- Navigation: "Voltar" | "Continuar" → `/summary-entry` with form data

### 6. SummaryEntry Component (`/summary-entry`)
- Displays summary of all collected entry fields
- Navigation: "Voltar" | "Confirmar Entrada" → back to home after confirmation

### 7. AdminDashboard Component (`/admin-dashboard`)
- Administrative interface for viewing all system movements
- Displays table with employee entries and exits ordered by date
- Features:
  - Period filter (start and end date)
  - "Export" button (simulated)
  - Navigation to forms: "Nova Entrada" and "Nova Saída"
- Table columns: Date, Type, Employee, Details
- Navigation: `/entry-form` or `/select-employee`

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

### entries.json
```json
[
  {
    "fullName": "Novo Funcionario Exemplo",
    "cpf": "123.456.789-00",
    "email": "novo.exemplo@company.com",
    "instituteName": "Instituto XYZ",
    "complianceTraining": "sim",
    "billable": "sim",
    "startDate": "2025-01-01",
    "role": "Desenvolvedor Júnior",
    "projectName": "Projeto Novo HP"
  }
]

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
├── vite.config.js
├── docker-compose.yml
├── Dockerfile
├── server.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── design-system.css
│   ├── components/
│   │   ├── Home.jsx
│   │   ├── SelectEmployee.jsx
│   │   ├── EntryForm.jsx
│   │   ├── ExitForm.jsx
│   │   ├── Summary.jsx
│   │   ├── SummaryEntry.jsx
│   │   └── AdminDashboard.jsx
│   └── data/
│       ├── employees.json
│       ├── entries.json
│       ├── exits.json
│       ├── projects.json
│       └── employee_projects.json
```

## Design System Architecture

### Design System (`design-system.css`) - 7.6KB
Unified CSS file focused on desktop web usage:
- **Colors**: Primary blue, secondary gray, success green, danger red
- **Typography**: 4 font sizes (sm, base, lg, xl) with consistent weights
- **Spacing**: 5-level system (xs, sm, md, lg, xl) based on 4px grid  
- **Components**: Button variants, form styling, layout containers, radio buttons
- **Responsive**: Essential mobile breakpoints for core functionality

### Styling Philosophy
- **Function over form**: Prioritizes usability over visual complexity
- **Desktop-first**: Optimized for desktop web usage
- **Single CSS file**: Unified system for consistency and performance
- **Predictable naming**: btn--primary, form-field, radio-group, etc.

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

### Dockerfile (Backend)
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
  backend:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src/data:/app/src/data
    environment:
      - NODE_ENV=development
  
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - backend
```

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