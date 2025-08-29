# DATABASE ARCHITECTURE - EMPLOYEE MOVEMENTS SYSTEM

## VISÃO GERAL

Sistema de gestão de movimentações para consultoria, projetado para gerenciar **até 30 projetos simultâneos** com **máximo 10 funcionários por projeto**. Arquitetura multi-schema com tabela centralizada para movimentações.

### Arquitetura de Schemas

```
employee_movements_db/
├── core/           # Usuários e funcionários (autenticação + dados pessoais)
├── hp_portfolio/   # Projetos e movimentações (4 tabelas: projects, hp_employee_profiles, movements, roles_hp)
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
│     password_hash   │       │     name, email     │
│     funcao_atlantico│       │     cpf, rg         │
│     created_at      │       │     data_nascimento │
└─────────────────────┘       │     escolaridade    │
                              └─────────────────────┘
```

### SCHEMA HP_PORTFOLIO - Projetos e Movimentações
```
┌─────────────────────┐       ┌─────────────────────┐
│hp_portfolio.projects│       │hp_employee_profiles │
├─────────────────────┤       ├─────────────────────┤
│ PK: project_id (uuid)│       │ PK: id              │
│     name            │       │ FK: employee_id     │
│     sow_pt (UNIQUE) │       │     hp_employee_id  │
│     gerente_hp      │       │     is_manager      │
│     description     │       │     has_previous... │
│     project_type    │       └─────────────────────┘
└─────────────────────┘                 │ 1:N
         │ N:1                          ▼
         ▼                    ┌─────────────────────┐
┌─────────────────────┐       │hp_portfolio.movements│
│hp_portfolio.roles_hp│       ├─────────────────────┤
├─────────────────────┤       │ PK: id              │
│ PK: id              │       │ FK: employee_id     │
│ FK: employee_id     │ ──┐   │     hp_employee_id  │
│ FK: project_id      │   │   │     created_at      │
│     movement_type   │       └─────────────────────┘
│     start_date      │   │             │ 1:1
│     end_date        │   │             ▼
│     role            │   │   ┌─────────────────────┐
│     bundle_aws      │   └──►│   core.employees    │
│     machine_type    │       │ (referência cruzada)│
│     compliance_training │    └─────────────────────┘
│     is_billable     │
│     created_at      │
└─────────────────────┘
```

### FLUXO LÓGICO PRINCIPAL
```
User ──1:1──► Employee ──1:1──► HP_Employee_Profile ──1:N──► HP_Portfolio.Movements ──N:1──► HP_Portfolio.Projects
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
# Testar API (PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Conectar ao banco
docker exec employee-movements-form-db-1 psql -U app_user -d employee_movements

# Ver tabelas por schema
\dt core.*
\dt hp_portfolio.*

# Ver funções e triggers
\df hp_portfolio.*
```

---

### Notas de Desenvolvimento

- **Schemas**: `core` (usuários/funcionários) e `hp_portfolio` (projetos/movimentações)
- **Relacionamentos**: Foreign keys garantem integridade referencial
- **Triggers**: 3 triggers automáticos para updated_at (`update_movements_updated_at`, `update_hp_profiles_updated_at`, `update_updated_at_column`)
- **Campos HP**: `compliance_training`, `billable`, `project_type`, `bundle_aws` (em movements); `hp_employee_id`, `has_previous_hp_experience` (em hp_employee_profiles)
- **Novos Campos**: `machine_reuse`, `changed_by`, `notes` para auditoria
- **Dados Pessoais**: `cpf`, `rg`, `data_nascimento`, `nivel_escolaridade`, `formacao`
- **Projetos**: `sow_pt` (Statement of Work/Purchase Order), `gerente_hp`, `gerente_ia` (email do gerente responsável)
- **Auditoria**: Histórico completo mantido na tabela `movements`

Para explorar estruturas detalhadas das tabelas, conecte ao banco e use comandos SQL descritivos como `\d schema.table`.

---

## ESTRUTURA DETALHADA DO BANCO

### TABELAS EXISTENTES

#### SCHEMA CORE
```sql
-- core.users (autenticação)
-- core.employees (dados pessoais + profissionais + cpf/rg/nascimento/escolaridade)
```

#### SCHEMA HP_PORTFOLIO
```sql
-- hp_portfolio.projects (projetos, clientes + sow_pt + gerente_hp)
-- hp_portfolio.hp_employee_profiles (dados HP específicos + is_manager flag)
-- hp_portfolio.movements (todas as movimentações)
-- hp_portfolio.roles_hp (papéis/funções HP disponíveis)
```

#### TABELA: hp_portfolio.movements

**Campos da tabela movements:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `employee_id` | VARCHAR(10) | FK para core.employees |
| `project_id` | UUID | FK para hp_portfolio.projects |
| `movement_type` | VARCHAR | 'ENTRY' ou 'EXIT' |
| `start_date` | DATE | Data de início (para ENTRY) |
| `end_date` | DATE | Data de fim (para EXIT) |
| `role` | VARCHAR | Função do funcionário |
| `project_type` | VARCHAR | Tipo do projeto |
| `compliance_training` | VARCHAR | 'sim' ou 'nao' |
| `billable` | VARCHAR | 'sim' ou 'nao' |
| `is_billable` | BOOLEAN | Versão booleana de billable |
| `change_reason` | TEXT | Motivo da mudança (para EXIT) |
| `allocation_percentage` | INTEGER | Percentual de alocação |
| `has_replacement` | BOOLEAN | Se haverá replacement na saída |
| `machine_type` | VARCHAR(50) | 'empresa', 'aws' ou 'disponivel' |
| `machine_reuse` | BOOLEAN | Se a máquina será reutilizada |
| `bundle_aws` | VARCHAR(20) | Bundle necessário (quando machine_type='aws') |
| `changed_by` | VARCHAR(10) | FK para core.employees (quem fez a alteração) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

#### TABELA: hp_portfolio.hp_employee_profiles

**Dados HP específicos por funcionário:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `employee_id` | VARCHAR(10) | FK para core.employees (UNIQUE) |
| `hp_employee_id` | VARCHAR(50) | ID específico do funcionário na HP |
| `has_previous_hp_experience` | BOOLEAN | Se funcionário já atuou em projetos HP antes |
| `previous_hp_account_id` | VARCHAR(50) | ID HP anterior (se já atuou) |
| `previous_hp_period_start` | VARCHAR(20) | Início período anterior (MM/AAAA) |
| `previous_hp_period_end` | VARCHAR(20) | Fim período anterior (MM/AAAA) |
| `is_manager` | BOOLEAN | Se funcionário é gerente de projetos |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

#### TABELA: hp_portfolio.roles_hp

**Papéis/funções disponíveis:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `name` | VARCHAR(100) | Nome do papel/função (UNIQUE) |
| `category` | VARCHAR(50) | Categoria (Management, Engineering, etc.) |
| `sort_order` | INTEGER | Ordem de exibição |
| `created_at` | TIMESTAMP | Data de criação |

#### CAMPOS ATUALIZADOS: core.employees

**Campos de função e dados pessoais:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `funcao_atlantico` | VARCHAR(50) | Função contratada no Atlântico (renomeado de 'role') |
| `cpf` | VARCHAR(14) | CPF no formato ###.###.###-## |
| `rg` | VARCHAR(20) | RG (formato variável) |
| `data_nascimento` | DATE | Data de nascimento |
| `nivel_escolaridade` | TEXT | Nível de escolaridade (texto livre) |
| `formacao` | TEXT | Formação acadêmica (texto livre) |

#### CAMPOS: hp_portfolio.projects

**Campos específicos de projeto:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `sow_pt` | VARCHAR(50) | Statement of Work/Purchase Order (UNIQUE) |
| `gerente_hp` | VARCHAR(100) | Gerente HP stakeholder externo |
| `gerente_ia` | VARCHAR(100) | Email do gerente responsável (Atlântico) |
| `project_type` | VARCHAR(50) | Tipo do projeto (interno/externo/misto) |

---

## MUDANÇAS ESTRUTURAIS IMPLEMENTADAS

### ❌ REMOVIDO:
- Tabela `hp_portfolio.project_managers` (overhead desnecessário)

### ✅ ADICIONADO:
- Campo `is_manager` em `hp_employee_profiles` (identifica gestores)
- Campo `funcao_atlantico` em `employees` (renomeado de 'role')
- Campo `gerente_ia` em `projects` (email do gerente responsável do Atlântico)

### 🔄 RENOMEADO:
- `hp_portfolio.roles` → `hp_portfolio.roles_hp` (clareza de propósito)
| `gerente_hp` | VARCHAR(100) | Gerente HP stakeholder externo |