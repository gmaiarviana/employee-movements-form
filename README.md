# Employee Exit Process - POC

Sistema para registrar saídas de funcionários.

## 🚀 Como executar

1. Clone o repositório:
```bash
git clone git@github.com:gmaiarviana/contract-movements.git
cd contract-movements
```

2. Execute com Docker:
```bash
docker-compose up -d
```

3. Acesse no navegador: **http://localhost:3000**

## 🔧 Desenvolvimento com Hot Reload

Para desenvolvimento, o sistema agora suporta hot reload automático que reinicia automaticamente quando arquivos são alterados:

```bash
# Inicia em modo desenvolvimento com hot reload
docker-compose up

# O servidor reinicia automaticamente quando arquivos backend são alterados
# Acesse: http://localhost:3000 (aplicação principal)
# Porta 3001 está disponível para browser-sync se necessário
```

**Portas utilizadas:**
- **3000**: Aplicação principal (Express server)
- **3001**: Browser-sync (se executado separadamente)

**O que reinicia automaticamente:**
- ✅ Mudanças em `server.js` e arquivos `.js` na raiz
- ❌ Mudanças em arquivos frontend (`src/public/`) não reiniciam o servidor (por design)

## 📋 Pré-requisitos

- **Docker Desktop**: [Download aqui](https://www.docker.com/products/docker-desktop/)
- **Git**: Para clonar o repositório

## 🎯 Como usar

1. Clique em "Saída de Funcionário"
2. Selecione o funcionário da lista
3. Preencha os dados da saída:
   - Data de saída
   - Motivo da saída
   - Haverá replacement? (sim/não)
   - Tombo da máquina
4. Revise o resumo e confirme

## 🛑 Como parar

```bash
docker-compose down
```

## 🧪 Dados disponíveis para teste

- **Usuário**: Maria Santos (líder)
- **Funcionários**: João Silva, Ana Costa
- **Projetos**: Sistema ERP, App Mobile

## ❓ Problemas?

Se não conseguir acessar:
- Verifique se o Docker Desktop está rodando
- Aguarde alguns segundos após o `docker-compose up`
- Certifique-se que a porta 3000 está livre