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