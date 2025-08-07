# Employee Movements Frontend

Interface React para a aplicação de movimentação de funcionários.

## Visão Geral

Interface moderna desenvolvida em React com:
- Design System próprio com dark mode automático
- Navegação por React Router
- Responsividade mobile-first
- Comunicação com backend via APIs REST

## Desenvolvimento

O frontend roda exclusivamente via Docker.

```bash
# Na raiz do projeto
docker-compose up frontend
```

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
└── components/
    ├── Home.jsx               # Página inicial (navegação)
    ├── SelectEmployee.jsx     # Seleção funcionário (saída)
    ├── EntryForm.jsx         # Formulário entrada
    ├── ExitForm.jsx          # Formulário saída  
    ├── Summary.jsx           # Resumo saída
    ├── SummaryEntry.jsx      # Resumo entrada
    └── AdminDashboard.jsx    # Dashboard administrativo
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

### Arquivo único: design-system.css (7.6KB)
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

| Endpoint | Componente | Uso |
|----------|------------|-----|
| `GET /api/employees/EMP001/team-members` | SelectEmployee | Lista funcionários |
| `GET /api/employees/:id/details` | ExitForm, Summary | Dados do funcionário |
| `GET /api/movements` | AdminDashboard | Histórico movimentações |

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