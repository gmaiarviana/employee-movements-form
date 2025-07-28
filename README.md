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