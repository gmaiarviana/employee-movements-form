# DATABASE ARCHITECTURE - EMPLOYEE MOVEMENTS SYSTEM

## VISÃO GERAL

Sistema de gestão de movimentações para consultoria, projetado para gerenciar **até 30 projetos simultâneos** com **máximo 10 funcionários por projeto**. Arquitetura multi-schema para modularidade e controle granular.

### Arquitetura de Schemas

```
employee_movements_db/
├── core/           # Usuários e funcionários (autenticação + dados pessoais)
├── projects/       # Projetos e gerentes (1 gerente por projeto)
├── allocations/    # Alocações ativas + histórico completo
└── reporting/      # Views agregadas para dashboards
```

---

## DIAGRAMA DE RELACIONAMENTOS

```
core.users
    │
    │ (auth)
    ▼
core.employees ──────┬─────────────┐
    │                │             │
    │                │             │ (manager)
    │ (team member)  │             ▼
    │                │    projects.project_managers
    │                │             │
    │                │             │ (project_id)
    │                │             ▼
    │                └────► projects.projects
    │                              │
    │ (employee_id)                │ (project_id)
    │                              │
    ▼                              │
allocations.current_allocations ◄──┘
    │
    │ (movement tracking)
    ▼
allocations.allocation_history
    │
    │ (aggregated data)
    ▼
reporting.* (views)
```

---

## SCHEMA: CORE

### Propósito
Autenticação JWT e dados básicos dos funcionários da consultoria.

### Tabelas Principais

#### `core.employees`
```sql
-- Funcionários da consultoria (limite: ~50 funcionários total)
id UUID PRIMARY KEY
name TEXT NOT NULL
role TEXT NOT NULL              -- 'Desenvolvedor', 'Analista', 'Gerente', etc.
department TEXT                 -- 'TI', 'Consultoria', 'Vendas'
status TEXT DEFAULT 'active'    -- 'active', 'inactive', 'terminated'
```

### Queries Específicas do Negócio

```sql
-- Funcionários disponíveis para nova alocação (não estão em 2+ projetos)
SELECT e.id, e.name, COUNT(ca.id) as current_projects
FROM core.employees e
LEFT JOIN allocations.current_allocations ca ON e.id = ca.employee_id AND ca.is_active = true
WHERE e.status = 'active'
GROUP BY e.id, e.name
HAVING COUNT(ca.id) < 2
ORDER BY current_projects, e.name;

-- Funcionários sobrecarregados (alocação > 100%)
SELECT e.name, SUM(ca.allocation_percentage) as total_allocation
FROM core.employees e
JOIN allocations.current_allocations ca ON e.id = ca.employee_id
WHERE ca.is_active = true
GROUP BY e.id, e.name
HAVING SUM(ca.allocation_percentage) > 100
ORDER BY total_allocation DESC;
```

---

## SCHEMA: PROJECTS

### Propósito
Gestão de projetos da consultoria (máximo 30 ativos simultâneos) e seus gerentes.

### Tabelas Principais

#### `projects.projects`
```sql
-- Projetos da consultoria (limite: 30 ativos)
id UUID PRIMARY KEY
name TEXT NOT NULL
status TEXT DEFAULT 'active'    -- 'active', 'completed', 'cancelled'
start_date DATE
end_date DATE
```

#### `projects.project_managers`
```sql
-- 1 gerente por projeto (regra de negócio)
project_id UUID REFERENCES projects.projects(id)
employee_id UUID REFERENCES core.employees(id)
is_active BOOLEAN DEFAULT true
```

### Queries Específicas do Negócio

```sql
-- Dashboard: projetos próximos do limite de equipe (8+ funcionários)
SELECT p.name, COUNT(ca.employee_id) as team_size
FROM projects.projects p
JOIN allocations.current_allocations ca ON p.id = ca.project_id
WHERE p.status = 'active' AND ca.is_active = true
GROUP BY p.id, p.name
HAVING COUNT(ca.employee_id) >= 8
ORDER BY team_size DESC;

-- Projetos órfãos (sem gerente ativo)
SELECT p.name, p.start_date
FROM projects.projects p
LEFT JOIN projects.project_managers pm ON p.id = pm.project_id AND pm.is_active = true
WHERE p.status = 'active' AND pm.project_id IS NULL;

-- Gerentes com múltiplos projetos (violação de regra de negócio)
SELECT e.name, COUNT(pm.project_id) as projects_managed
FROM core.employees e
JOIN projects.project_managers pm ON e.id = pm.employee_id
JOIN projects.projects p ON pm.project_id = p.id
WHERE pm.is_active = true AND p.status = 'active'
GROUP BY e.id, e.name
HAVING COUNT(pm.project_id) > 1;
```

---

## SCHEMA: ALLOCATIONS

### Propósito
Controla alocações atuais (máximo 10 por projeto) e mantém histórico completo de movimentações para relatórios de consultoria.

### Tabelas Principais

#### `allocations.current_allocations`
```sql
-- Alocações ativas (regra: máximo 10 funcionários por projeto)
employee_id UUID REFERENCES core.employees(id)
project_id UUID REFERENCES projects.projects(id)
role TEXT NOT NULL                          -- Papel específico no projeto
allocation_percentage DECIMAL(5,2) DEFAULT 100.00  -- % dedicação (0-200%)
is_active BOOLEAN DEFAULT true             -- Para soft-delete
start_date DATE NOT NULL
end_date DATE                              -- NULL = alocação indefinida
```

#### `allocations.allocation_history`
```sql
-- Histórico completo de movimentações (audit trail)
employee_id UUID REFERENCES core.employees(id)
project_id UUID REFERENCES projects.projects(id)
movement_type TEXT NOT NULL                -- 'entry', 'exit', 'transfer'
movement_date DATE NOT NULL
reason TEXT                                -- Motivo da movimentação
allocation_percentage DECIMAL(5,2)        -- % na época da movimentação
```

### Queries Específicas do Negócio

```sql
-- Validar limite de 10 funcionários por projeto
SELECT p.name, COUNT(ca.employee_id) as team_size
FROM projects.projects p
JOIN allocations.current_allocations ca ON p.id = ca.project_id
WHERE p.status = 'active' AND ca.is_active = true
GROUP BY p.id, p.name
HAVING COUNT(ca.employee_id) > 10;

-- Relatório de utilização por funcionário (consultoria billing)
SELECT 
    e.name,
    SUM(ca.allocation_percentage) as total_allocation,
    COUNT(ca.project_id) as active_projects,
    CASE 
        WHEN SUM(ca.allocation_percentage) < 80 THEN 'Subutilizado'
        WHEN SUM(ca.allocation_percentage) > 120 THEN 'Sobrecarregado'
        ELSE 'Normal'
    END as status
FROM core.employees e
JOIN allocations.current_allocations ca ON e.id = ca.employee_id
WHERE e.status = 'active' AND ca.is_active = true
GROUP BY e.id, e.name
ORDER BY total_allocation DESC;

-- Movimentações recentes (últimos 30 dias)
SELECT 
    e.name as employee_name,
    p.name as project_name,
    ah.movement_type,
    ah.movement_date,
    ah.reason
FROM allocations.allocation_history ah
JOIN core.employees e ON ah.employee_id = e.id
LEFT JOIN projects.projects p ON ah.project_id = p.id
WHERE ah.movement_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY ah.movement_date DESC;

-- Projetos com baixa alocação de equipe (< 5 funcionários ativos)
SELECT p.name, COUNT(ca.employee_id) as team_size
FROM projects.projects p
LEFT JOIN allocations.current_allocations ca ON p.id = ca.project_id AND ca.is_active = true
WHERE p.status = 'active'
GROUP BY p.id, p.name
HAVING COUNT(ca.employee_id) < 5
ORDER BY team_size;
```

---

## SCHEMA: REPORTING

### Propósito
Views otimizadas para dashboards executivos e relatórios de billing da consultoria.

### Views Principais

#### `reporting.project_utilization`
```sql
-- Utilização por projeto (para billing clients)
SELECT 
    p.name as project_name,
    COUNT(ca.employee_id) as team_size,
    AVG(ca.allocation_percentage) as avg_allocation,
    SUM(ca.allocation_percentage) as total_capacity_used,
    pm_emp.name as project_manager
FROM projects.projects p
LEFT JOIN allocations.current_allocations ca ON p.id = ca.project_id AND ca.is_active = true
LEFT JOIN projects.project_managers pm ON p.id = pm.project_id AND pm.is_active = true
LEFT JOIN core.employees pm_emp ON pm.employee_id = pm_emp.id
WHERE p.status = 'active'
GROUP BY p.id, p.name, pm_emp.name;
```

#### `reporting.employee_workload`
```sql
-- Carga de trabalho por funcionário (para resource planning)
SELECT 
    e.name as employee_name,
    e.department,
    COUNT(ca.id) as active_projects,
    SUM(ca.allocation_percentage) as total_allocation,
    CASE 
        WHEN SUM(ca.allocation_percentage) > 120 THEN 'Sobrecarregado'
        WHEN SUM(ca.allocation_percentage) < 60 THEN 'Disponível'
        ELSE 'Normal'
    END as workload_status
FROM core.employees e
LEFT JOIN allocations.current_allocations ca ON e.id = ca.employee_id AND ca.is_active = true
WHERE e.status = 'active'
GROUP BY e.id, e.name, e.department;
```

### Queries para Dashboard Executivo

```sql
-- KPIs principais da consultoria
SELECT 
    (SELECT COUNT(*) FROM core.employees WHERE status = 'active') as total_employees,
    (SELECT COUNT(*) FROM projects.projects WHERE status = 'active') as active_projects,
    (SELECT COUNT(*) FROM allocations.current_allocations WHERE is_active = true) as active_allocations,
    (SELECT ROUND(AVG(team_size), 1) 
     FROM (SELECT COUNT(ca.employee_id) as team_size 
           FROM projects.projects p 
           JOIN allocations.current_allocations ca ON p.id = ca.project_id 
           WHERE p.status = 'active' AND ca.is_active = true 
           GROUP BY p.id) as project_sizes) as avg_team_size;

-- Alertas de negócio
SELECT 
    'Projetos próximos do limite' as alert_type,
    COUNT(*) as count
FROM (
    SELECT p.id
    FROM projects.projects p
    JOIN allocations.current_allocations ca ON p.id = ca.project_id
    WHERE p.status = 'active' AND ca.is_active = true
    GROUP BY p.id
    HAVING COUNT(ca.employee_id) >= 9
) as overcrowded_projects

UNION ALL

SELECT 
    'Funcionários sobrecarregados' as alert_type,
    COUNT(*) as count
FROM (
    SELECT e.id
    FROM core.employees e
    JOIN allocations.current_allocations ca ON e.id = ca.employee_id
    WHERE e.status = 'active' AND ca.is_active = true
    GROUP BY e.id
    HAVING SUM(ca.allocation_percentage) > 150
) as overloaded_employees;
```

---

## VALIDAÇÃO DE INTEGRIDADE

### Usando validate.js

O sistema inclui validação automática de integridade via `backend/database/validate.js`:

```javascript
// Validação completa
const { validateDataIntegrity } = require('./database/validate');
validateDataIntegrity().then(result => {
    console.log('Integridade:', result.success ? 'OK' : 'FALHOU');
    if (!result.success) {
        console.log('Erros:', result.foreignKeys.errors);
    }
});

// Validação específica de foreign keys
const { validateForeignKeys } = require('./database/validate');
validateForeignKeys().then(result => {
    if (!result.isValid) {
        console.log('IDs órfãos:', result.details);
    }
});
```

### Regras de Negócio Validadas

1. **Foreign Key Integrity**: Todos os employee_id e project_id devem existir
2. **Project Team Limits**: Máximo 10 funcionários por projeto ativo
3. **Manager Assignment**: 1 gerente ativo por projeto
4. **Allocation Consistency**: Percentuais entre 0-200%

### Comandos de Validação

```bash
# Validação completa via Node.js
node -e "require('./database/validate').validateDataIntegrity().then(console.log)"

# Apenas foreign keys
node -e "require('./database/validate').validateForeignKeys().then(r => console.log(r.isValid ? 'OK' : r.errors))"

# Contagem de registros
node -e "require('./database/validate').getDataCounts().then(r => console.log(r.data))"
```
