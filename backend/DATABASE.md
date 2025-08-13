# DATABASE ARCHITECTURE - EMPLOYEE MOVEMENTS SYSTEM

## VISÃO GERAL

Sistema de gestão de movimentações para consultoria, projetado para gerenciar **até 30 projetos simultâneos** com **máximo 10 funcionários por projeto**. Arquitetura multi-schema com tabela centralizada para movimentações.

### Arquitetura de Schemas

```
employee_movements_db/
├── core/           # Usuários e funcionários (autenticação + dados pessoais)
├── hp_portfolio/   # Projetos e movimentações (apenas 3 tabelas: projects, project_managers, movements)
└── public/         # Schema padrão PostgreSQL
```

---

## DIAGRAMA DE RELACIONAMENTOS

### SCHEMA CORE - Usuários e Funcionários
```
┌─────────────────────┐       ┌─────────────────────┐
│     core.users      │       │   core.employees    │
├─────────────────────┤       ├─────────────────────┤
│ PK: user_id         │ 1:1   │ PK: employee_id     │
│     email           │ ◄───► │ FK: user_id         │
│     password_hash   │       │     name            │
│     role            │       │     department      │
│     created_at      │       │     status          │
└─────────────────────┘       └─────────────────────┘
```

### SCHEMA HP_PORTFOLIO - Projetos e Movimentações
```
┌─────────────────────┐       ┌─────────────────────┐
│hp_portfolio.projects│       │project_managers     │
├─────────────────────┤       ├─────────────────────┤
│ PK: project_id (uuid)│ 1:1   │ PK: manager_id      │
│     name            │ ◄───► │ FK: project_id      │
│     description     │       │ FK: employee_id     │
│     start_date      │       │     assigned_at     │
│     end_date        │       └─────────────────────┘
│     status          │                 │
│     client_name     │                 │ 1:N
│     budget          │                 ▼
│     priority        │       ┌─────────────────────┐
└─────────────────────┘       │   core.employees    │
         │ N:1                │ (referência cruzada)│
         ▼                    └─────────────────────┘
┌─────────────────────┐                 │ 1:N
│hp_portfolio.movements│                │
├─────────────────────┤◄────────────────┘
│ PK: id              │
│ FK: employee_id     │
│ FK: project_id      │
│     movement_type   │
│     start_date      │
│     end_date        │
│     role            │
│     hp_employee_id  │
│     project_type    │
│     compliance_training │
│     billable        │
│     change_reason   │
│     allocation_percentage │
│     is_billable     │
│     created_at      │
│     updated_at      │
└─────────────────────┘
```

### FLUXO LÓGICO PRINCIPAL
```
User ──1:1──► Employee ──1:N──► HP_Portfolio.Movements ──N:1──► HP_Portfolio.Projects
  │                                      │
  │                                      │
  │                                      ▼
  └──► Authentication                API Endpoints
```

### LEGENDA
- **PK** = Primary Key (Chave Primária)
- **FK** = Foreign Key (Chave Estrangeira)  
- **1:1** = Relacionamento um para um
- **1:N** = Relacionamento um para muitos
- **N:1** = Relacionamento muitos para um
- **◄─►** = Relacionamento bidirecional
- **────►** = Relacionamento unidirecional

---

## CREDENCIAIS PADRÃO

**Sistema de Autenticação:**
- Email: admin@admin.com  
- Senha: admin123

**Banco PostgreSQL:**
- Host: localhost:5433
- Database: employee_movements
- User: app_user
- Password: app_password

---

## COMANDOS ÚTEIS

### Verificação Rápida do Sistema
```bash
# Testar API
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Conectar ao banco
docker exec employee-movements-form-db-1 psql -U app_user -d employee_movements

# Ver tabelas por schema
\dt core.*
\dt hp_portfolio.*

# Ver views importantes
\dv hp_portfolio.*
```

---

### Notas de Desenvolvimento

- **Schemas**: `core` (usuários/funcionários) e `hp_portfolio` (projetos/movimentações)
- **Relacionamentos**: Foreign keys garantem integridade referencial
- **Campos HP**: `hp_employee_id`, `compliance_training`, `billable`, `project_type`
- **Auditoria**: Histórico completo mantido na tabela `movements`

Para explorar estruturas detalhadas das tabelas, conecte ao banco e use comandos SQL descritivos como `\d schema.table`.

---

## ESTRUTURA DETALHADA DO BANCO

### TABELAS EXISTENTES

#### SCHEMA CORE
```sql
-- core.users (autenticação)
-- core.employees (dados pessoais + profissionais)
```

#### SCHEMA HP_PORTFOLIO
```sql
-- hp_portfolio.projects (projetos e clientes)
-- hp_portfolio.project_managers (1 gerente por projeto)  
-- hp_portfolio.movements (tabela única para todas as movimentações - FONTE ÚNICA DE VERDADE)
```

#### TABELA PRINCIPAL: hp_portfolio.movements

**Campos da tabela movements:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `employee_id` | INTEGER | FK para core.employees |
| `project_id` | UUID | FK para hp_portfolio.projects |
| `movement_type` | VARCHAR | 'ENTRY' ou 'EXIT' |
| `start_date` | DATE | Data de início (para ENTRY) |
| `end_date` | DATE | Data de fim (para EXIT) |
| `role` | VARCHAR | Função do funcionário |
| `hp_employee_id` | VARCHAR | ID específico HP |
| `project_type` | VARCHAR | Tipo do projeto |
| `compliance_training` | VARCHAR | 'sim' ou 'nao' |
| `billable` | VARCHAR | 'sim' ou 'nao' |
| `is_billable` | BOOLEAN | Versão booleana de billable |
| `change_reason` | TEXT | Motivo da mudança (para EXIT) |
| `allocation_percentage` | INTEGER | Percentual de alocação |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |
