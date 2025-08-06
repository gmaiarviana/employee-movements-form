# Employee Movements System - React + Node.js

Sistema para registrar movimentações de funcionários (entradas e saídas) com interface React e APIs Node.js.

## 🏗️ Arquitetura

- **Frontend**: React + Vite (Port 3001)
- **Backend**: Node.js + Express APIs (Port 3000)
- **Dados**: Arquivos JSON (simulação de banco)
- **Infraestrutura**: Docker multi-serviço

## 🚀 Como executar

1. Clone o repositório:
```bash
git clone https://guilherme_viana1@bitbucket.org/institutoatlantico/employee-movements-form.git
cd employee-movements-form
```

2. Execute com Docker:
```bash
docker-compose up -d --build
```

3. Acesse no navegador: **http://localhost:3001**

## 🌐 URLs Disponíveis

- **Frontend React**: http://localhost:3001
- **Backend APIs**: http://localhost:3000/api/*

## 📋 Pré-requisitos

- **Docker Desktop**: [Download aqui](https://www.docker.com/products/docker-desktop/)
- **Git**: Para clonar o repositório

## 🎯 Como usar

### Para Saída de Funcionário:
1. Na página inicial, clique em "Nova Saída"
2. Selecione o funcionário da lista de subordinados
3. Preencha o formulário de saída:
   - Data de saída
   - Motivo da saída
   - Haverá replacement? (sim/não)
   - Tombo da máquina
4. Revise o resumo e confirme

### Para Entrada de Funcionário:
1. Na página inicial, clique em "Nova Entrada"  
2. Preencha o formulário com dados do novo funcionário:
   - Nome completo, CPF, email
   - Instituto, papel profissional
   - Projeto HP, data de início
   - Treinamento compliance, faturável
3. Revise o resumo e confirme

### Para Área Administrativa:
1. Na página inicial, clique em "Administrador"
2. Visualize tabela com todas as movimentações
3. Use filtros por período
4. Export dados (simulado)

## 🛑 Como parar

```bash
docker-compose down
```

## 🧪 Dados disponíveis para teste

- **Usuário**: Maria Santos (líder)
- **Funcionários**: João Silva, Ana Costa, Carlos Oliveira, Fernanda Lima, Roberto Ferreira, e outros
- **Projetos**: Sistema ERP

## ❓ Problemas?

Se não conseguir acessar:
- Verifique se o Docker Desktop está rodando
- Execute `docker-compose up -d --build` para rebuild
- Aguarde alguns segundos após subir os serviços
- Certifique-se que as portas 3000 e 3001 estão livres
- Frontend React: http://localhost:3001
- APIs Backend: http://localhost:3000/api/*