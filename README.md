# Employee Exit Process - POC

Sistema para registrar saídas de funcionários.

## Pré-requisitos

- **Docker Desktop**: [Download aqui](https://www.docker.com/products/docker-desktop/)

## Como executar

1. Baixe os arquivos do projeto
2. Abra o terminal na pasta do projeto
3. Execute os comandos:

```bash
docker-compose up -d
```

4. Acesse no navegador: **http://localhost:3000**

## Como usar

1. Clique em "Saída de Funcionário"
2. Selecione o funcionário da lista
3. Preencha os dados da saída
4. Revise o resumo e confirme

## Como parar

Para parar a aplicação:

```bash
docker-compose down
```

Ou pressione `Ctrl+C` se rodou sem `-d`

## Dados disponíveis para teste

- **Usuário**: Maria Santos (líder)
- **Funcionários**: João Silva, Ana Costa
- **Projetos**: Sistema ERP, App Mobile

## Limitações desta POC

- Dados fictícios (não salva no banco)
- Login simulado (sempre como Maria Santos)
- Interface básica
- Apenas processo de saída

## Problemas?

Se não conseguir acessar, verifique:
- Docker Desktop está rodando
- Porta 3000 não está sendo usada por outro programa
- Aguarde alguns segundos após o `docker-compose up`