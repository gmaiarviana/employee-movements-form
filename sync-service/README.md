# Google Sheets Sync Service

Serviço Docker para sincronizar dados do Google Sheets para PostgreSQL usando **OAuth** (bem mais fácil!).

## 🚀 Setup Rápido (5 minutos)

### 1. Criar OAuth Credentials

1. Vá em [Google Cloud Console](https://console.cloud.google.com)
2. Crie ou selecione um projeto
3. Vá em **APIs & Services → Credentials**
4. Clique **+ CREATE CREDENTIALS → OAuth 2.0 Client IDs**
5. Configure:
   - **Application type**: `Desktop application`
   - **Name**: `Sheets Sync`
6. **DOWNLOAD JSON** (vai baixar algo como `client_secret_123.json`)

### 2. Configurar variáveis

```bash
# Na pasta sync-service/
cp .env.example .env
```

Edite `sync-service/.env`:

```env
# ID da sua planilha (pegar da URL)
GOOGLE_SPREADSHEET_ID=1ABC123xyz_exemplo

# OAuth credentials (do arquivo JSON baixado)
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
```

**Como pegar as credenciais do arquivo JSON:**
```json
{
  "installed": {
    "client_id": "123456789.apps.googleusercontent.com",    ← GOOGLE_CLIENT_ID
    "client_secret": "GOCSPX-abc123xyz"                     ← GOOGLE_CLIENT_SECRET
  }
}
```

**Como pegar ID da planilha:**
- URL: `https://docs.google.com/spreadsheets/d/1ABC123xyz_exemplo/edit`
- ID: `1ABC123xyz_exemplo`

## 🔑 Primeira execução (autorizar)

```bash
# Primeira vez - vai pedir autorização
docker-compose run --rm sync
```

**O sistema vai:**
1. **Mostrar uma URL** para você abrir no browser
2. **Pedir para fazer login** e autorizar
3. **Mostrar um código** para você copiar
4. **Executar um comando** com esse código

**Exemplo do que vai aparecer:**
```
1. Abra esta URL no browser: https://accounts.google.com/oauth/authorize?...
2. Faça login e autorize
3. Copie o código e execute:
   docker-compose run --rm sync node -e "require('./sync.js').setAuthCode('4/codigo_aqui')"
```

## ⚡ Execuções seguintes (automático)

Depois da primeira autorização:

```bash
# Sincronizar (automático)
docker-compose run --rm sync
```

## 📊 Como funciona

1. **Primeira vez**: Autoriza via browser, salva token
2. **Sempre**: Lê Google Sheets → Limpa PostgreSQL → Insere dados
3. **Automático**: Renova tokens quando necessário

## 🛠️ Estrutura esperada da planilha

| name | description | sow_pt | gerente_hp | project_type |
|------|-------------|---------|------------|--------------|
| Projeto Alpha | Descrição... | SOW-001 | Maria Silva | externo |
| Projeto Beta | Descrição... | PT-002 | João Santos | interno |

## 🔧 Resolução de problemas

**"Token expirado":**
```bash
# Remover token e re-autorizar
docker-compose run --rm sync rm -f /app/credentials/token.json
docker-compose run --rm sync
```

**"Spreadsheet not found":**
- Verifique se o `GOOGLE_SPREADSHEET_ID` está correto
- Certifique-se que você tem acesso à planilha

**"Insufficient permissions":**
- Re-execute a autorização
- Certifique-se de autorizar acesso às planilhas