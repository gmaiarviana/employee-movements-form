# Google Sheets Sync Service (Service Account)

Serviço Docker para sincronizar dados do Google Sheets para PostgreSQL usando **Service Account** (zero setup manual).

## 🚀 Setup Inicial (5 minutos)

### 1. Criar Service Account

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie ou selecione um projeto
3. Vá em **APIs & Services → Library**
4. Ative a **Google Sheets API**
5. Vá em **APIs & Services → Credentials**
6. Clique **+ CREATE CREDENTIALS → Service Account**
7. Configure:
   - **Name**: `sheets-sync`
   - **Description**: `Sync service for employee movements`
8. Na tela seguinte, pule as permissões (clique **DONE**)
9. Na lista de Service Accounts, clique no email criado
10. Vá na aba **Keys**
11. Clique **ADD KEY → Create new key**
12. Escolha **JSON** e clique **CREATE**
13. **Baixa automaticamente** o arquivo JSON

### 2. Configurar credenciais

```powershell
# Copiar arquivo JSON para local correto
# Renomeie o arquivo baixado para: service-account-key.json
Copy-Item "caminho\para\arquivo-baixado.json" "sync-service\credentials\service-account-key.json"

# Configurar variáveis
Copy-Item "sync-service\.env.example" "sync-service\.env"
```

**Edite `sync-service/.env`:**
```env
GOOGLE_SPREADSHEET_ID=SEU_ID_DA_PLANILHA_AQUI
GOOGLE_SHEET_RANGE=A:Q
```

**Como pegar ID da planilha:**
- URL: `https://docs.google.com/spreadsheets/d/1ABC123xyz_exemplo/edit`
- ID: `1ABC123xyz_exemplo`

### 3. Compartilhar planilha

1. **Abra sua planilha** no Google Sheets
2. Clique **Share** (botão azul no canto superior direito)
3. **Adicione o email da Service Account**:
   - Copie o email do arquivo JSON (campo `"client_email"`)
   - Cole no campo de compartilhamento
   - Escolha **Viewer** (só leitura)
   - Clique **Send**

## ⚡ Executar sincronização

```powershell
# Sincronizar dados (automático)
docker-compose run --rm sync

# Ver logs detalhados
docker-compose run --rm sync
```

## 📊 Estrutura esperada da planilha

**Campos obrigatórios para sincronização:**

- **projeto**: Nome do projeto
- **sow/pt**: Código SOW/PT (único)
- **ano base**: Deve ser "2025" para sincronizar
- **gerente hp**: Nome do gerente HP (opcional)
- **tipo de projeto**: Tipo do projeto (opcional)

*Nota: A planilha possui múltiplas colunas, mas apenas estes campos são processados.*

## 🔧 Configurações avançadas

**No arquivo `.env`:**

```env
# Backup automático antes de sync
BACKUP_BEFORE_SYNC=true

# Validação de integridade
VALIDATE_INTEGRITY=true

# Range personalizado da planilha
GOOGLE_SHEET_RANGE=A:Q  # Default para 17 colunas (todas as colunas da planilha)
```

## 🛠️ Resolução de problemas

**"Service Account key file not found":**
```powershell
# Verificar se arquivo existe
Test-Path "sync-service\credentials\service-account-key.json"
```

**"Permission denied" ou "Spreadsheet not found":**
- Verifique se compartilhou a planilha com o email da Service Account
- Confirme se o `GOOGLE_SPREADSHEET_ID` está correto

**"Headers obrigatórios ausentes":**
- Certifique-se que a primeira linha da planilha contém: `projeto`, `sow/pt`, `gerente hp`, `tipo de projeto`, `ano base`

**Ver relacionamentos após sync:**
```powershell
# Verificar se não quebrou relacionamentos
docker exec employee-movements-form-db-1 psql -U app_user -d employee_movements -c "
SELECT 
  (SELECT COUNT(*) FROM hp_portfolio.projects) as projetos,
  (SELECT COUNT(*) FROM hp_portfolio.hp_employee_profiles WHERE is_manager = true) as gestores,
  (SELECT COUNT(*) FROM hp_portfolio.movements) as movimentacoes
"
```

## 📁 Estrutura final

```
sync-service/
├── credentials/
│   └── service-account-key.json  ← Arquivo JSON baixado
├── sync.js                       ← Script principal
├── .env                          ← Configurações
└── README.md                     ← Este arquivo
```

**Vantagens do Service Account:**
✅ Zero setup após configuração inicial  
✅ Sem autorização manual  
✅ Token nunca expira  
✅ Ideal para automação