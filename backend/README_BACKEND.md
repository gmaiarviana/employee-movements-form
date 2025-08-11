# Employee Movements Backend

API REST server para a aplicação de movimentação de funcionários.

## Visão Geral

Este serviço fornece endpoints para:
- **Autenticação JWT**: Registro e login de usuários
- **Consulta de informações de funcionários**
- **Dados de projetos e atribuições**
- **Histórico de movimentações (entradas e saídas)**
- **Health check**: Monitoramento do status do serviço

O backend utiliza PostgreSQL database com Docker para persistência de dados e autenticação JWT para proteção de rotas.

## Desenvolvimento

O backend roda via Docker junto com PostgreSQL.

```bash
# Na raiz do projeto - inicia backend + banco de dados
docker-compose up backend

# Para verificar se o banco está funcionando
docker-compose exec db psql -U app_user -d employee_movements
```

## Stack Técnico

- **Node.js 18** + **Express.js 4**
- **CORS** configurado para frontend
- **PostgreSQL 15** + **pg driver** para database
- **Nodemon** para hot reload em desenvolvimento
- **JWT (jsonwebtoken)** para autenticação
- **bcryptjs** para hash de senhas
- **dotenv** para gerenciamento de variáveis de ambiente
- **Arquitetura MVC parcial** com controllers separados

> **Database Schema**: Ver `DATABASE.md` para schema completo e queries detalhadas

## Verificando o Database

Para verificar a estrutura do banco:

```bash
# Conectar ao PostgreSQL
docker-compose exec db psql -U app_user -d employee_movements

# Verificação básica
\dt                                    -- Listar tabelas
SELECT COUNT(*) FROM employees;        -- Verificar dados
\q                                     -- Sair do PostgreSQL
```

## API Endpoints

### Sistema
- `GET /api/health` - Status do serviço

### Autenticação
- `POST /api/register` - Registro de novos usuários
- `POST /api/login` - Login de usuários

### Funcionários (🔒 Protegidos por JWT)
- `GET /api/employees/:leaderId/team-members` - Membros da equipe
- `GET /api/employees/:id/details` - Detalhes do funcionário

### Movimentações (🔒 Protegidos por JWT)
- `GET /api/movements` - Histórico de movimentações
- `POST /api/entries` - Criar nova entrada
- `POST /api/exits` - Criar nova saída

**Nota**: 
- Endpoints marcados com 🔒 requerem autenticação JWT via header `Authorization: Bearer <token>`
- Todos os endpoints utilizam PostgreSQL para consulta e manipulação de dados
- O servidor valida automaticamente todas as variáveis de ambiente obrigatórias na inicialização
- Rotas não encontradas retornam lista de endpoints disponíveis para facilitar o desenvolvimento

### POST /api/register
**Lógica**:
1. Valida dados de entrada (username, email, password)
2. Verifica se usuário/email já existe
3. Hash da senha com bcryptjs
4. Insere usuário na tabela users
5. Retorna sucesso (sem token)

**Body**:
```json
{
  "username": "usuario123",
  "email": "usuario@email.com", 
  "password": "senha123"
}
```

### POST /api/login
**Lógica**:
1. Busca usuário por username na tabela users
2. Compara senha fornecida com hash armazenado
3. Gera token JWT com dados do usuário
4. Retorna token de autenticação

**Body**:
```json
{
  "username": "usuario123",
  "password": "senha123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "USER123456789",
    "username": "usuario123",
    "email": "usuario@email.com"
  }
}
```

### GET /api/employees/:leaderId/team-members
**Lógica**:
1. Consulta projetos liderados pelo `leaderId` na tabela projects
2. Encontra atribuições ativas para estes projetos na tabela employee_projects
3. Retorna dados consolidados funcionário + projeto via JOIN

### GET /api/employees/:id/details  
**Lógica**:
1. Busca dados do funcionário por ID na tabela employees
2. Encontra projeto ativo do funcionário via JOIN com employee_projects e projects
3. Retorna dados consolidados

### GET /api/movements
**Lógica**:
1. Consulta tabelas entries e exits com JOIN para dados de funcionários e projetos
2. Consolida em formato único ordenado cronologicamente
3. Retorna histórico completo de movimentações

## Configurações

### Environment Variables
```bash
PORT=3000                           # Porta do servidor
CORS_ORIGIN=http://localhost:3001   # URL do frontend para CORS
NODE_ENV=development                # Ambiente
DB_HOST=localhost                   # Host do banco PostgreSQL
DB_PORT=5432                        # Porta do banco PostgreSQL
DB_NAME=employee_movements          # Nome do banco de dados
DB_USER=app_user                    # Usuário do banco de dados
DB_PASSWORD=secure_password         # Senha do banco de dados
JWT_SECRET=your-super-secret-key    # Chave secreta para JWT (deve ser aleatória em produção)
```

**Validação Automática**: O servidor valida automaticamente todas as variáveis obrigatórias na inicialização e interrompe a execução se alguma estiver ausente, mostrando quais variáveis estão faltando.

### Estrutura Modular
O servidor está organizado em módulos separados:
- **Controllers**: `/controllers/authController.js`, `/controllers/employeeController.js`, `/controllers/movementController.js`
- **Routes**: `/routes/auth.js`, `/routes/employees.js`, `/routes/movements.js`, `/routes/health.js` - Agora usam controllers para lógica de negócio
- **Middlewares**: `/middleware/auth.js` 
- **Configurações**: `/config/cors.js`, `/config/database.js`

### Logs de Inicialização
Ao iniciar, o servidor exibe:
- Status da configuração carregada
- Informações de conexão (sem valores sensíveis)
- URLs importantes para health check
- Configuração do CORS

### CORS Setup
```js
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}))
```

### Autenticação JWT
```js
// Middleware de autenticação aplicado automaticamente em rotas protegidas
// Token deve ser enviado no header: Authorization: Bearer <token>

// Exemplo de requisição autenticada:
fetch('/api/movements', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Estrutura de Resposta da API
```js
// Resposta de sucesso
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso"
}

// Resposta de erro
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição detalhada do erro"
}
```