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
  - **✅ 1. Persistência de Dados com PostgreSQL:** (Concluída em Agosto/2025)
    - Sistema migrado de arquivos JSON para banco PostgreSQL
    - 5 tabelas implementadas: employees, projects, employee_projects, entries, exits  
    - Todas as APIs adaptadas para usar queries SQL
    - Script de migração automatizada criado

  - **2. Sistema de Autenticação e Cadastro (Básico):**
    - **Objetivo:** Adicionar uma camada de segurança para proteger o acesso a rotas críticas do sistema.
    - **Critérios de Aceite:**
      - O frontend deve incluir novas páginas para `Login` e `Cadastro de Usuários`.
      - O backend deve expor novas rotas de API para `POST /api/register` e `POST /api/login`.
      - As rotas do frontend `/select-employee`, `/entry-form` e `/admin-dashboard` devem ser protegidas, exigindo autenticação do usuário antes de serem acessadas.

**Backend (5 tarefas)**

**Tarefa 4.2.1: Criar tabela users e migration no PostgreSQL**
- Adicionar migration script com campos: id, email, password_hash, name, role, created_at
- Inserir usuário admin padrão para testes

**Tarefa 4.2.2: Instalar dependências de autenticação no backend**
- Adicionar bcrypt, jsonwebtoken ao package.json
- Configurar variáveis de ambiente para JWT_SECRET

**Tarefa 4.2.3: Implementar API POST /api/register**
- Endpoint para cadastro com hash da senha
- Validação de email único
- Retorno de token JWT

**Tarefa 4.2.4: Implementar API POST /api/login**
- Endpoint para login com verificação de credenciais
- Comparação de senha hasheada
- Retorno de token JWT válido

**Tarefa 4.2.5: Criar middleware de autenticação para APIs protegidas**
- Middleware para validar JWT token
- Aplicar proteção nas rotas necessárias

**Frontend (6 tarefas)**

**Tarefa 4.2.6: Criar componente Login.jsx**
- Formulário com email e senha
- Integração com API /api/login
- Armazenamento de token no localStorage

**Tarefa 4.2.7: Criar componente Register.jsx**
- Formulário de cadastro (nome, email, senha)
- Integração com API /api/register
- Redirecionamento automático pós-cadastro

**Tarefa 4.2.8: Implementar ProtectedRoute component**
- HOC para verificar autenticação
- Redirecionamento para /login se não autenticado
- Verificação de token válido

**Tarefa 4.2.9: Adicionar rotas de autenticação no App.jsx**
- Rotas /login e /register
- Aplicar ProtectedRoute nas rotas críticas

**Tarefa 4.2.10: Implementar logout e estado de autenticação global**
- Botão de logout no header
- Context/estado para gerenciar usuário logado
- Limpeza do localStorage

**Tarefa 4.2.11: Atualizar navegação e UI para usuários autenticados**
- Mostrar nome do usuário quando logado
- Ajustar header/menu com opções de logout

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