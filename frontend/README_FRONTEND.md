# Employee Movements Frontend

Interface React para a aplicação de movimentação de funcionários.

## Visão Geral

Interface moderna desenvolvida em React com:
- Design System próprio com dark mode automático
- Navegação por React Router
- Responsividade mobile-first
- Comunicação com backend via APIs REST

## Desenvolvimento

O frontend roda via Docker junto com o backend.

```bash
# Na raiz do projeto - inicia frontend + backend + PostgreSQL
docker-compose up frontend

# Ou apenas o frontend (requer backend rodando separadamente)
docker-compose up frontend
```

### Configuração da API
A URL da API é configurada via `VITE_API_URL=http://localhost:3000` no docker-compose.yml para conectar ao backend.

## Stack Técnico

- **React 18** + **Vite** (desenvolvimento)
- **React Router v6** (navegação SPA)
- **Design System CSS** próprio (sem framework externo)
- **Fetch API** nativa (comunicação backend)

## Estrutura de Componentes

```
src/
├── main.jsx                    # Entry point React
├── App.jsx                     # Router principal + rotas
├── design-system.css          # Sistema de design unificado
├── services/
│   └── api.js                 # Service centralizado para APIs
└── components/
    ├── pages/                 # Home, Login, Register, AdminDashboard
    ├── forms/
    │   ├── EntryForm.jsx                    # Orquestrador + dropdown funcionários
    │   ├── entry/                           # Componentes modulares
    │   │   ├── EmployeeSelector.jsx         # Dropdown + campos automáticos
    │   │   ├── ProjectSelector.jsx          # Dropdown projetos + auto-fill
    │   │   ├── HPExperienceFields.jsx       # Campos condicionais experiência HP
    │   │   ├── HPSpecificFields.jsx         # Campos HP editáveis + roles
    │   │   └── hooks/
    │   │       ├── useEmployeeSelection.js
    │   │       └── useProjectSelection.js
    ├── summary/               # SummaryEntry, SummaryExit
    └── common/                # ProtectedRoute, componentes reutilizáveis
```

## Fluxos de Navegação

**Fluxo de Entrada:**
```
Home → EntryForm → SummaryEntry → Home
```

**Fluxo de Saída:**
```
Home → SelectEmployee → ExitForm → Summary → Home
```

## Design System

### Arquivo único: design-system.css
- CSS Vanilla com variáveis CSS (custom properties)
- Mobile-first responsive design
- Dark mode automático via `prefers-color-scheme`
- Sistema de tokens: cores, espaçamentos, tipografia

### Componentes UI Disponíveis

- `.btn`, `.btn--primary`, `.btn--secondary` - Botões
- `.form-field`, `.form-label`, `.form-group` - Formulários  
- `.header`, `.container`, `.main-content` - Layout
- `.radio-group`, `.radio-item` - Radio buttons
- `.card` - Containers de conteúdo

## APIs Consumidas

- Todas as APIs agora consumidas via `services/api.js`
- Autenticação JWT automática
- Tratamento centralizado de erros

**Base URL**: `http://localhost:3000/api`

**Endpoints utilizados:**
- `/api/movements/roles` - Lista de papéis/funções disponíveis

## Gerenciamento de Estado

**Estratégia**: React state local + URL parameters
- **Forms**: `useState` para campos
- **API Data**: `useState` + `useEffect` 
- **Navigation**: `useNavigate` + `useSearchParams`

## Features

- Employee selection interface
- Entry and exit forms
- Administrative dashboard
- Responsive design with dark mode support

## Credenciais de Teste

- **Email:** admin@admin.com
- **Senha:** admin123