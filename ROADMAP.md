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

## 🎯 Épico 3: Interface Moderna e Design System
- Objetivo: Modernizar a interface do usuário com tecnologias atuais e estabelecer um design system consistente.
- Funcionalidades:
  - **Migração para Vite + React/Vue:** Transição da arquitetura atual para um framework moderno utilizando Vite como bundler.
  - **Design System Básico:** Implementação de componentes reutilizáveis e padronizados para garantir consistência visual.
  - **Interface Responsiva e Moderna:** Desenvolvimento de uma interface adaptativa que funcione bem em diferentes dispositivos e tamanhos de tela.
  - **Reorganização da Arquitetura:** Separação clara entre frontend e backend, com Express focado exclusivamente em APIs e Vite gerenciando o frontend. Reestruturação de pastas para facilitar desenvolvimento futuro e preparar o terreno para integração com PostgreSQL no próximo épico.
  - **Manter Funcionalidades Existentes:** Preservar todas as funcionalidades já implementadas, focando apenas na melhoria da experiência visual e de usabilidade.

## 🔮 Épico 4: Mínimo Produto Viável (MVP) - Persistência, Autenticação e Relatórios Básicos
- Objetivo: Transformar o sistema em uma ferramenta funcional e utilizável por usuários selecionados, com persistência real de dados, segurança de acesso e capacidade de gerar relatórios.
- Funcionalidades:
  - **Persistência de Dados com PostgreSQL:**
    - Substituição completa dos arquivos JSON por um banco de dados PostgreSQL para armazenar todas as movimentações de forma persistente.
    - Migração dos dados mock existentes para a nova estrutura do banco de dados.
    - Adaptação das APIs existentes para interagir com o PostgreSQL.
  - **Sistema de Autenticação e Cadastro (Básico):**
    - Implementação de um fluxo de cadastro para novos usuários.
    - Desenvolvimento de uma tela de login simples (usuário/senha).
    - Proteção das rotas e páginas críticas (e.g., `select-employee`, `entry-form`, `admin-dashboard`) exigindo autenticação do usuário.
    - Possibilidade de compartilhar com usuários selecionados.
  - **Geração de Relatório de Movimentação (PDF):**
    - Funcionalidade para gerar e permitir o download de um relatório em formato PDF com os detalhes completos de uma movimentação (saída ou entrada).

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