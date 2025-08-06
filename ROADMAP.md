# Roadmap - Employee Exit Process (Contract Movements)

## ✅ Épico 1: Prova de Conceito (POC) - Registro de Saída de Funcionários
- Objetivo: Validar a arquitetura básica e o fluxo de registro de saída de funcionários.
- Funcionalidades:
  - **Interface de Registro de Saída:** Criação das páginas e fluxo para registrar a saída de um funcionário.
  - **Armazenamento Provisório (JSON):** Utilização de arquivos JSON para simular o banco de dados e armazenar as informações.
  - **Resumo da Saída:** Exibição consolidada dos dados da saída antes da confirmação.

## ✅ Épico 2: Protótipo Estendido - Entrada de Funcionários e Visão Administrativa
- Objetivo: Ampliar as capacidades do sistema para gerenciar entradas de funcionários e oferecer uma visão consolidada das movimentações.
- Funcionalidades:
  - **Formulário de Entrada de Funcionários:** Página para registro de entrada com dados mock e fluxo de navegação.
  - **Painel Administrativo:** Dashboard consolidado com visualização de movimentações em formato de tabela, filtros por período de data e simulação de exportação de dados.

## ✅ Épico 3: Interface Moderna e Design System
- Objetivo: Modernizar a interface com tecnologias atuais e estabelecer arquitetura separada frontend/backend.
- Funcionalidades:
  - **Migração React + Vite:** Conversão completa de HTML vanilla para React 18 com Vite, 7 componentes criados e React Router.
  - **Design System:** Sistema de tokens centralizados, componentes reutilizáveis, responsividade mobile-first e dark mode automático.
  - **Arquitetura Separada:** Frontend (porta 3001) e backend (porta 3000) independentes, APIs RESTful exclusivas, environment variables configuradas.

---

## 🔮 Épico 4: Mínimo Produto Viável (MVP) - Persistência, Autenticação e Relatórios Básicos
- Objetivo: Transformar o sistema em uma ferramenta funcional e utilizável por usuários selecionados, com persistência real de dados, segurança de acesso e capacidade de gerar relatórios.
- Funcionalidades:
  - **1. Persistência de Dados com PostgreSQL:**
    - **Objetivo:** Substituir os arquivos JSON por um banco de dados PostgreSQL para armazenar todas as movimentações de forma persistente.
    - **Critérios de Aceite:**
      - O arquivo `docker-compose.yml` deve ser atualizado para incluir o serviço do banco de dados PostgreSQL.
      - O backend deve ser configurado para se conectar ao PostgreSQL usando variáveis de ambiente.
      - É necessário implementar a lógica de migração dos dados mock existentes (dos arquivos JSON) para o novo banco de dados.
      - Todas as APIs existentes no backend devem ser modificadas para realizar operações de leitura e escrita no PostgreSQL, em vez dos arquivos JSON.

Funcionalidade 4.1: Persistência de Dados com PostgreSQL
Esta funcionalidade será dividida em 8 tarefas, começando pela configuração do ambiente e avançando para a adaptação das APIs existentes para utilizar o novo banco de dados.

4.1.1 -Adicionar o serviço do PostgreSQL ao docker-compose.yml

Objetivo: Incluir o contêiner do banco de dados no ambiente Docker para que o backend possa se conectar a ele.

Descrição: Atualizar o arquivo docker-compose.yml para adicionar um novo serviço chamado db (ou similar) que utiliza uma imagem PostgreSQL, mapeia a porta e configura o volume para persistência dos dados.

Critério de Aceite: Ao executar docker-compose up -d, o contêiner do PostgreSQL deve ser iniciado com sucesso, junto com os serviços de frontend e backend.

4.1.2 - Instalar a biblioteca pg no backend

Objetivo: Adicionar o driver do PostgreSQL ao projeto backend para permitir a comunicação com o banco de dados.

Descrição: Executar o comando npm install pg no diretório do backend para adicionar a dependência.

Critério de Aceite: O arquivo backend/package.json deve ser atualizado com a dependência pg.

4.1.3 - Configurar variáveis de ambiente de conexão com o banco de dados

Objetivo: Definir as variáveis de ambiente necessárias para que o backend se conecte ao banco de dados de forma segura e configurável.

Descrição: Adicionar as variáveis DB_USER, DB_PASSWORD, DB_NAME, e DB_HOST ao arquivo backend/.env.example e, posteriormente, ao docker-compose.yml.

Critério de Aceite: As novas variáveis devem estar presentes nos arquivos e prontas para serem lidas pela aplicação.

4.1.4 - Criar a lógica de conexão com o PostgreSQL no server.js

Objetivo: Implementar o código inicial no backend para estabelecer a conexão com o banco de dados.

Descrição: No arquivo backend/server.js, adicionar o código para importar a biblioteca pg, criar um cliente de conexão usando as variáveis de ambiente e tentar conectar.

Critério de Aceite: Ao iniciar o servidor com npm run dev dentro do contêiner, o log deve exibir uma mensagem indicando que a conexão com o banco de dados foi bem-sucedida.

4.1.5 - Criar o script de migração para o PostgreSQL

Objetivo: Migrar os dados existentes nos arquivos JSON (employees, projects, entries, exits) para o novo banco de dados.

Descrição: Criar um script ou uma função na inicialização do backend que lê os dados dos arquivos JSON e os insere nas tabelas correspondentes do PostgreSQL.

Critério de Aceite: O banco de dados deve conter as tabelas necessárias e os dados dos arquivos JSON devem ter sido inseridos com sucesso após a execução do script.

4.1.6 - Adaptar a API GET /api/employees/:leaderId/team-members para usar o PostgreSQL

Objetivo: Modificar o endpoint para buscar os membros da equipe diretamente do banco de dados em vez de ler os arquivos JSON.

Descrição: Alterar a lógica na rota app.get('/api/employees/:leaderId/team-members') para executar consultas SQL no PostgreSQL.

Critério de Aceite: A API deve retornar os mesmos dados que antes, mas obtidos do banco de dados.

4.1.7 - Adaptar a API GET /api/employees/:id/details para usar o PostgreSQL

Objetivo: Alterar o endpoint para buscar os detalhes de um funcionário diretamente do banco de dados.

Descrição: Modificar a lógica na rota app.get('/api/employees/:id/details') para usar consultas SQL.

Critério de Aceite: A API deve retornar os detalhes corretos de um funcionário, agora obtidos do PostgreSQL.

4.1.8 - Adaptar a API GET /api/movements para usar o PostgreSQL

Objetivo: Atualizar o endpoint para buscar todas as movimentações (entradas e saídas) do banco de dados.

Descrição: Modificar a lógica na rota app.get('/api/movements') para realizar consultas no banco de dados e consolidar os resultados de entradas e saídas.

Critério de Aceite: A API deve retornar a lista completa e ordenada de movimentações, obtida do PostgreSQL.

  - **2. Sistema de Autenticação e Cadastro (Básico):**
    - **Objetivo:** Adicionar uma camada de segurança para proteger o acesso a rotas críticas do sistema.
    - **Critérios de Aceite:**
      - O frontend deve incluir novas páginas para `Login` e `Cadastro de Usuários`.
      - O backend deve expor novas rotas de API para `POST /api/register` e `POST /api/login`.
      - As rotas do frontend `/select-employee`, `/entry-form` e `/admin-dashboard` devem ser protegidas, exigindo autenticação do usuário antes de serem acessadas.

  - **3. Geração de Relatório de Movimentação (PDF):**
    - **Objetivo:** Permitir que o usuário gere e baixe um relatório em PDF com os detalhes de uma movimentação específica.
    - **Critérios de Aceite:**
      - O frontend do `AdminDashboard.jsx` deve exibir um botão para `Gerar PDF` ao lado de cada movimentação na tabela.
      - Ao clicar no botão, uma nova API no backend deve ser chamada.
      - O backend deve gerar um arquivo PDF formatado com os dados completos da movimentação e enviá-lo para download.

## 🔮 Épico 5: Integração de Dados Reais
- Objetivo: Reduzir a entrada manual de dados através da integração com sistemas externos.
- Funcionalidades:
  - **Integração com Sistemas de RH:** Conexão com APIs ou bancos existentes para importar informações de funcionários e projetos.
  - **Sincronização Automática:** Implementação de mecanismos para reduzir drasticamente a entrada manual de dados.
  - **Validação e Mapeamento:** Tratamento e mapeamento de dados externos para a estrutura interna do sistema.

## 🔮 Épico 6: Autenticação com Google Login
- Objetivo: Melhorar a experiência de autenticação com integração OAuth.
- Funcionalidades:
  - **Integração OAuth Google:** Substituir o sistema de login simples por autenticação via Google Login.
  - **Gestão de Sessões Aprimorada:** Melhorar o controle de acesso e a experiência do usuário através de um gerenciamento de sessões mais robusto.

## 🔮 Épico 7: Melhorias e Otimização
- Objetivo: Prover funcionalidades avançadas e otimizações para o sistema.
- Funcionalidades:
  - **Analytics e Métricas:** Desenvolvimento de um dashboard com insights gerenciais (e.g., turnover, tendências de movimentação).
  - **Testes Automatizados:** Aumento da cobertura de testes para garantir a qualidade e estabilidade do sistema.
  - **Otimizações de Performance:** Melhorias na performance e responsividade do sistema.
  - **Configuração Avançada de Ambientes:** Separação completa de configurações dev/prod/test com pipelines automatizados.
  - **Preparação Avançada para PostgreSQL:** Implementação completa do Repository Pattern, interfaces de acesso a dados e configuração de conexão DB.
  - **Documentação Avançada:** Guias de migração, processos de desenvolvimento detalhados e documentação técnica expandida.