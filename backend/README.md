# Employee Movements Backend

API REST server para a aplicação de movimentação de funcionários.

## Visão Geral

Este serviço fornece endpoints para:
- Consulta de informações de funcionários
- Dados de projetos e atribuições
- Histórico de movimentações (entradas e saídas)

## Desenvolvimento

O backend roda exclusivamente via Docker. Para detalhes técnicos completos, consulte `ARCHITECTURE.md` na raiz do projeto.

```bash
# Na raiz do projeto
docker-compose up backend
```

## API Endpoints

- `GET /api/health` - Status do serviço
- `GET /api/employees/:leaderId/team-members` - Membros da equipe
- `GET /api/employees/:id/details` - Detalhes do funcionário
- `GET /api/movements` - Histórico de movimentações
