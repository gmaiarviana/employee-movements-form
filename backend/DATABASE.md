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
