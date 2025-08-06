# Architecture Document - Employee Exit Process POC

## Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Vite + React + React Router
- **Data**: JSON files (mock database)
- **Infrastructure**: Docker (multi-service)
- **Ports**: Frontend (3001), Backend APIs (3000)

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │───▶│   Vite + React  │───▶│   Express.js    │───▶│   JSON Files    │
│   (Port 3001)   │    │   Frontend      │    │   API Server    │    │   (Mock DB)     │
│                 │    │   (Port 3001)   │    │   (Port 3000)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

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

### UI Design System Components
- **Button.jsx**: Reusable button component with variants (primary, secondary, danger)
- **Input.jsx**: Form input component with consistent styling and validation states
- **Card.jsx**: Container component with CardHeader, CardContent, and CardFooter sub-components
- **Container.jsx**: Layout wrapper component for consistent spacing and max-width
- **Header.jsx**: Page header component with title and variant support
- **FormGroup.jsx**: Form field wrapper with label, input, and error message support

### Component Usage Pattern
All UI components are centrally exported from `components/ui/index.js` and imported as:
```jsx
import { Button, Input, Card, Container, Header, FormGroup } from '../components/ui'
```

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
│   ├── App.css
│   ├── index.css
│   ├── styles.css
│   ├── design-tokens.css
│   ├── components/
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── SelectEmployee.jsx
│   │   ├── EntryForm.jsx
│   │   ├── ExitForm.jsx
│   │   ├── Summary.jsx
│   │   ├── SummaryEntry.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ui/
│   │       ├── index.js
│   │       ├── Button.jsx
│   │       ├── Button.css
│   │       ├── ButtonExamples.jsx
│   │       ├── Input.jsx
│   │       ├── Input.css
│   │       ├── InputExamples.jsx
│   │       ├── Card.jsx
│   │       ├── Card.css
│   │       ├── CardExamples.jsx
│   │       ├── Container.jsx
│   │       ├── Container.css
│   │       ├── Header.jsx
│   │       ├── Header.css
│   │       ├── FormGroup.jsx
│   │       ├── FormGroup.css
│   │       └── UIComponentsExamples.jsx
│   └── data/
│       ├── employees.json
│       ├── entries.json
│       ├── exits.json
│       ├── projects.json
│       └── employee_projects.json
```

## Design System Architecture

### Design Tokens (`design-tokens.css`)
Sistema centralizado de variáveis CSS para consistência visual:
- **Colors**: Paletas completas (50-950) + aliases semânticos
- **Typography**: Famílias, tamanhos, pesos e line-heights
- **Spacing**: Grid 4px com aliases semânticos
- **Breakpoints**: Mobile (480px), tablet (768px), desktop (1024px), wide (1440px)
- **Shadows**: 6 níveis de elevação + focus shadow
- **Transitions**: Durações, easing e padrões comuns
- **Dark mode**: Suporte automático via prefers-color-scheme

### UI Component System
Reusable components following atomic design:
- **Atoms**: Button, Input
- **Molecules**: FormGroup, Card
- **Organisms**: Header, Container

### CSS Architecture
- **Global Styles**: Base styles in `index.css` and `styles.css`
- **Component Styles**: Scoped CSS files for each UI component
- **Design Tokens**: CSS custom properties via `design-tokens.css`
- **Responsive**: Mobile-first with breakpoints (320px to 1920px+)
- **Modern Features**: Dark mode, focus management, smooth transitions

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