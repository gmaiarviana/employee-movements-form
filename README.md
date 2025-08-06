# Employee Movements System

Sistema web para registro de movimentações de funcionários (entradas e saídas).

## � Funcionalidades

- **Registro de Saída**: Formulário para registrar saída de funcionários
- **Registro de Entrada**: Formulário para registrar entrada de novos funcionários  
- **Dashboard Admin**: Visualização de todas as movimentações registradas
- **Interface Responsiva**: Design adaptativo para diferentes dispositivos

## � Configuração de Environment Variables

Copie os arquivos de exemplo:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Ajuste as variáveis conforme necessário para seu ambiente.

## �🚀 Como executar

### Pré-requisitos
- Docker Desktop instalado
- Ou Node.js 18+ para execução local

### Com Docker (Recomendado)
```bash
git clone <repository-url>
cd employee-movements-form
docker-compose up -d --build
```

Acesse: http://localhost:3001

### Execução Local
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm install
npm run dev
```

## 🛑 Como parar

```bash
docker-compose down
```