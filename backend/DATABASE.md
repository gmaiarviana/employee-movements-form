# DATABASE ARCHITECTURE - EMPLOYEE MOVEMENTS SYSTEM

Sistema de gestão de movimentações com separação por fonte de dados.

## SCHEMAS

**`core`** - Dados corporativos e autenticação  
**`hp_portfolio`** - Dados HP e movimentações (responsabilidade: time Portfolio HP)

## ESTRUTURA PRINCIPAL

### core.users (AUTENTICAÇÃO - APENAS CREDENCIAIS)
```sql
id UUID PK
email TEXT                     -- Deve existir em core.employees
password_hash TEXT
created_at TIMESTAMP
```

### core.employees (HUB PRINCIPAL - TODOS OS FUNCIONÁRIOS)
```sql
id VARCHAR(10) PK              -- Mesmo valor de matricula_ia
name VARCHAR(100)              -- Nome completo
email VARCHAR(100)             -- Email corporativo
funcao_atlantico VARCHAR(50)   -- Função/perfil
company VARCHAR(100)           -- Empresa (HP Portfolio, Instituto Atlântico, etc.)
cpf VARCHAR(14)                -- TOTVS (opcional)
rg VARCHAR(20)                 -- TOTVS (opcional)
data_nascimento DATE           -- Data nascimento (opcional)
nivel_escolaridade TEXT        -- Escolaridade (opcional)
formacao TEXT                  -- Formação (opcional)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### hp_portfolio.managers_mapping (ALIASES DE GESTORES)
```sql
id UUID PK
matricula_ia VARCHAR(10) FK     -- FK para hp_portfolio.employees.matricula_ia
alias VARCHAR(100)              -- Alias usado na coluna 'gerente' (ex: 'Ricardo Paiva')
created_at TIMESTAMP
```

### hp_portfolio.employees (FONTE: BDI - SINCRONIZAÇÃO)
```sql
matricula_ia VARCHAR(10) PK    -- Matrícula Instituto Atlântico
nome VARCHAR(100)              -- Nome completo  
email_ia VARCHAR(100)          -- Email @atlantico.com.br
perfil VARCHAR(50)             -- Função técnica (Fullstack, PM, QA, etc.)
is_manager BOOLEAN             -- Inferido: projeto='Gestão' OR perfil LIKE '%PM%'
projeto VARCHAR(100)           -- Projeto atual
gerente VARCHAR(100)           -- Gerente responsável
employee_id_hp VARCHAR(50)     -- Matrícula HP (quando aplicável)
situacao VARCHAR(50)           -- Status na planilha BDI
email_hp VARCHAR(100)          -- Email HP (quando aplicável)
data_nascimento DATE
escolaridade TEXT
graduacao TEXT
```

### hp_portfolio.hp_employee_profiles (DADOS FORMULÁRIOS UI)
```sql
id UUID PK
employee_id VARCHAR(10) FK     -- FK para hp_portfolio.employees.matricula_ia
has_previous_hp_experience BOOLEAN
previous_hp_account_id VARCHAR(50)
previous_hp_period_start VARCHAR(20)
previous_hp_period_end VARCHAR(20)
```

### hp_portfolio.movements (MOVIMENTAÇÕES)
```sql
id UUID PK
employee_id VARCHAR(10) FK     -- FK para hp_portfolio.employees.matricula_ia
project_id UUID FK             -- FK para hp_portfolio.projects
movement_type VARCHAR(10)      -- 'ENTRY' ou 'EXIT'
start_date DATE
end_date DATE                  -- Para EXIT
role VARCHAR(100)              -- Função no projeto
allocation_percentage NUMERIC(5,2)
is_billable BOOLEAN
compliance_training VARCHAR(10) -- 'sim' ou 'nao'
machine_type VARCHAR(50)       -- 'empresa', 'aws', 'disponivel'
bundle_aws VARCHAR(20)
change_reason VARCHAR(255)     -- Para EXIT
has_replacement BOOLEAN        -- Para EXIT
changed_by VARCHAR(10) FK      -- FK para hp_portfolio.employees.matricula_ia
```

### hp_portfolio.projects
```sql
id UUID PK
name VARCHAR(255)
sow_pt VARCHAR(255)            -- Statement of Work/Purchase Order (UNIQUE)
gerente_hp VARCHAR(100)        -- Gerente HP stakeholder
gerente_ia VARCHAR(100)        -- Email gerente Atlântico
project_type VARCHAR(255)     -- 'interno', 'externo', etc.
description TEXT
```

### hp_portfolio.roles_hp
```sql
id UUID PK
name VARCHAR(100)              -- Project Manager IV, Software Engineer III, etc.
category VARCHAR(50)           -- Management, Engineering, Junior
sort_order INTEGER
```

## RELACIONAMENTOS

```
hp_portfolio.employees (PK: matricula_ia)
    ├── core.employees (FK: matricula_ia)
    ├── hp_portfolio.movements (FK: employee_id)
    ├── hp_portfolio.hp_employee_profiles (FK: employee_id)
    └── hp_portfolio.movements (FK: changed_by)

core.employees 
    └── core.users (FK: user_id)

hp_portfolio.projects
    └── hp_portfolio.movements (FK: project_id)
```

## FLUXO DE DADOS

**BDI Planilha → hp_portfolio.employees** (full sync - substitui todos os dados)  
**hp_portfolio.employees → core.employees** (UPSERT - preserva dados de outras fontes)  
**TOTVS → core.employees** (CPF/RG sob demanda - preservados)  
**UI Formulários → hp_portfolio.hp_employee_profiles**  
**Sistema → hp_portfolio.movements** (entradas/saídas manuais)

## CREDENCIAIS

**PostgreSQL:**
- Host: localhost:5433
- Database: employee_movements  
- User: app_user
- Password: app_password

**Autenticação Sistema:**
- Email: guilherme_viana@atlantico.com.br
- Senha: admin123

## COMANDOS ESSENCIAIS

```bash
# Conectar ao banco
docker-compose exec db psql -U app_user -d employee_movements

# Verificar tabelas principais
docker-compose exec db psql -U app_user -d employee_movements -c "SELECT 'hp_portfolio.employees' as tabela, COUNT(*) FROM hp_portfolio.employees;"

docker-compose exec db psql -U app_user -d employee_movements -c "SELECT 'core.employees' as tabela, COUNT(*) FROM core.employees;"

# Funcionário completo (todas as fontes)
docker-compose exec db psql -U app_user -d employee_movements -c "
SELECT hpe.matricula_ia, hpe.nome, hpe.perfil, hpe.is_manager, 
       ce.cpf, ce.rg, hep.has_previous_hp_experience
FROM hp_portfolio.employees hpe
LEFT JOIN core.employees ce ON hpe.matricula_ia = ce.matricula_ia
LEFT JOIN hp_portfolio.hp_employee_profiles hep ON hpe.matricula_ia = hep.employee_id
LIMIT 5;"

# Verificar managers
docker-compose exec db psql -U app_user -d employee_movements -c "SELECT COUNT(*) as managers FROM hp_portfolio.employees WHERE is_manager = TRUE;"

# Ver estrutura de uma tabela
docker-compose exec db psql -U app_user -d employee_movements -c "\d hp_portfolio.employees"
```

## REGRAS DE NEGÓCIO

- **Autenticação:** users.email deve existir em hp_portfolio.employees.email_ia
- **is_manager:** Inferido de projeto='Gestão' OR perfil contém 'PM', 'GP', 'TPM', 'PGM'
- **employee_id:** movements e hp_employee_profiles referenciam hp_portfolio.employees.matricula_ia
- **CPF/RG:** Campos opcionais preenchidos sob demanda via TOTVS
- **Sync BDI:** Full sync substitui todos os dados em hp_portfolio.employees