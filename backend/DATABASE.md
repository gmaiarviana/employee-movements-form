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
└─────────────────────┘       └─────────────────────┘
         │                            │
         │ N:1                        │ N:1
         ▼                            ▼
┌─────────────────────┐       ┌─────────────────────┐
│   core.employees    │       │  projects.projects  │
│ (referência cruzada)│       │ (referência cruzada)│
└─────────────────────┘       └─────────────────────┘
```

### FLUXO LÓGICO PRINCIPAL
```
User ──1:1──► Employee ──1:N──► Current_Allocations ──N:1──► Projects
  │                                      │
  │                                      │ 1:N
  │                                      ▼
  └──► Authentication                Allocation_History
                                          │
                                          │ (agregação)
                                          ▼
                                    reporting.views
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
docker-compose exec db psql -U app_user -d employee_movements

# Ver tabelas por schema
\dt core.*
\dt projects.*
\dt allocations.*
```

---

### Notas de Desenvolvimento

- **Schemas**: Estrutura modular permite controle granular de permissões
- **Relacionamentos**: Foreign keys garantem integridade referencial
- **Performance**: Indexes otimizados para queries de movimentação frequentes
- **Auditoria**: Histórico completo mantido em `allocations.allocation_history`

Para explorar estruturas detalhadas das tabelas, conecte ao banco e use comandos SQL descritivos como `\d schema.table`.
