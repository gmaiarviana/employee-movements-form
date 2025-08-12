# DATABASE ARCHITECTURE - EMPLOYEE MOVEMENTS SYSTEM

## VISÃO GERAL

Sistema de gestão de movimentações para consultoria, projetado para gerenciar **até 30 projetos simultâneos** com **máximo 10 funcionários por projeto**. Arquitetura multi-schema para modularidade e controle granular.

### Arquitetura de Schemas

```
employee_movements_db/
├── core/           # Usuários e funcionários (autenticação + dados pessoais)
├── hp_portfolio/   # Projetos, alocações, histórico e views (estrutura HP específica)
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

### SCHEMA PROJECTS - Projetos e Gerência
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
                               │ (referência cruzada)│
                               └─────────────────────┘
```
```
┌─────────────────────┐       ┌─────────────────────┐
│  projects.projects  │       │project_managers     │
├─────────────────────┤       ├─────────────────────┤
│ PK: project_id      │ 1:1   │ PK: manager_id      │
│     name            │ ◄───► │ FK: project_id      │
│     description     │       │ FK: employee_id     │
│     start_date      │       │     assigned_at     │
│     end_date        │       └─────────────────────┘
│     status          │                 │
└─────────────────────┘                 │
                                        │ 1:N
                                        ▼
                               ┌─────────────────────┐
                               │   core.employees    │
                               │ (referência cruzada)│
                               └─────────────────────┘
```

### SCHEMA ALLOCATIONS - Alocações e Histórico
```
┌─────────────────────┐       ┌─────────────────────┐
│current_allocations  │       │ allocation_history  │
├─────────────────────┤       ├─────────────────────┤
│ PK: allocation_id   │ 1:N   │ PK: history_id      │
│ FK: employee_id     │ ────► │ FK: allocation_id   │
│ FK: project_id      │       │     movement_type   │
│     allocated_hours │       │     timestamp       │
│     start_date      │       │     hours_changed   │
│     is_active       │       │     notes           │
└─────────────────────┘       │     hp_employee_id  │
         │                    │     project_type    │
         │ N:1                │     compliance_training │
         ▼                    │     billable        │
┌─────────────────────┐       │     has_replacement │
│   core.employees    │       │     machine_type    │
│ (referência cruzada)│       │     machine_reuse   │
└─────────────────────┘       └─────────────────────┘
                                       │ N:1
                                       ▼
                               ┌─────────────────────┐
                               │hp_portfolio.projects│
                               │ (referência cruzada)│
                               └─────────────────────┘
```

### FLUXO LÓGICO PRINCIPAL
```
User ──1:1──► Employee ──1:N──► HP_Portfolio.Current_Allocations ──N:1──► HP_Portfolio.Projects
  │                                      │
  │                                      │ 1:N
  │                                      ▼
  └──► Authentication            HP_Portfolio.Allocation_History
                                          │
                                          │ (agregação)
                                          ▼
                            employee_movements_consolidated (VIEW)
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

- **Schemas**: `core` (usuários/funcionários) e `hp_portfolio` (projetos/alocações)
- **Relacionamentos**: Foreign keys garantem integridade referencial
- **Auditoria**: Histórico completo mantido em `hp_portfolio.allocation_history`
- **Views**: `employee_movements_consolidated` centraliza dados para dashboards
- **Campos HP**: `hp_employee_id`, `compliance_training`, `billable`, `machine_type`

**Views Disponíveis:**
- `employee_movements_consolidated` - Dados consolidados de movimentações
- `v_active_projects_with_managers` - Projetos ativos com gerentes
- `v_current_resource_utilization` - Utilização atual de recursos

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
-- hp_portfolio.current_allocations (alocações ativas)
-- hp_portfolio.allocation_history (histórico completo)
```

#### VIEWS CONSOLIDADAS
```sql
-- hp_portfolio.employee_movements_consolidated (dados para API /api/movements)
-- hp_portfolio.v_active_projects_with_managers  
-- hp_portfolio.v_current_resource_utilization
```
