# Roadmap - Employee Exit Process (Contract Movements)

## ✅ Épico 1: Prova de Conceito (POC)
- Registro de saída com armazenamento JSON e interface básica.

## ✅ Épico 2: Protótipo Estendido  
- Formulário de entrada, dashboard administrativo e filtros básicos.

## ✅ Épico 3: Interface Moderna
- Migração para React + Vite, design system e arquitetura frontend/backend separada.

## ✅ Épico 4: Persistência e Autenticação
- PostgreSQL implementado e sistema de login/registro com JWT.

---

## 🟡 Épico 5: Fluxos Realistas MVP - Integração com Dados Corporativos - EM ANDAMENTO
- Objetivo: Adaptar formulários para replicar fluxo real do MVP, integrando dados da base corporativa (Instituto Atlântico) com dados específicos do cliente HP, criando distinção clara entre dados canônicos e dados gerenciados pela ferramenta.
- Funcionalidades:
   ✅ **5.1. CONCLUÍDO:** Reestruturação de banco hp_portfolio implementada
   ✅ **5.2. Fluxo de Entrada Realista CONCLUÍDO:** Dropdown funcionários existentes, campos HP específicos, salva em hp_portfolio

   ✅ **5.3. Fluxo de Saída Realista CONCLUÍDO**

  - **5.4. APIs e Integrações:**
    - **Objetivo:** Adaptar todas as APIs para nova estrutura e garantir funcionamento do dashboard administrativo.
    - **Critérios de Aceite:**
      - Todos os controllers de employee e movement devem funcionar com nova estrutura
      - AdminDashboard deve exibir dados consolidados corretamente
      - APIs devem utilizar VIEW consolidada para performance
      - Todos os endpoints devem ser testados e validados
      - Sistema completo deve funcionar end-to-end

---

## 🔮 Épico 6: Relatórios e Integrações Avançadas
- Objetivo: Implementar funcionalidades avançadas para o ambiente de produção.
- Funcionalidades:
  - **6.1. Geração de Relatório de Movimentação (PDF):**
    - **Objetivo:** Permitir que o usuário gere e baixe um relatório em PDF com os detalhes de uma movimentação específica.
    - **Critérios de Aceite:**
      - O frontend do `AdminDashboard.jsx` deve exibir um botão para `Gerar PDF` ao lado de cada movimentação na tabela.
      - Ao clicar no botão, uma nova API no backend deve ser chamada.
      - O backend deve gerar um arquivo PDF formatado com os dados completos da movimentação e enviá-lo para download.

  - **6.2. Integração com Sistemas de RH:**
    - Conexão com APIs ou bancos existentes para importar informações de funcionários e projetos.
    - Sincronização automática para reduzir entrada manual de dados.
    - Validação e mapeamento de dados externos para a estrutura interna do sistema.

## 🔮 Épico 7: Autenticação com Google Login
- Objetivo: Melhorar a experiência de autenticação com integração OAuth.
- Funcionalidades:
  - **Integração OAuth Google:** Substituir o sistema de login simples por autenticação via Google Login.
  - **Gestão de Sessões Aprimorada:** Melhorar o controle de acesso e a experiência do usuário através de um gerenciamento de sessões mais robusto.

## 🔮 Épico 8: Melhorias e Otimização
- Objetivo: Prover funcionalidades avançadas e otimizações para o sistema.
- Funcionalidades:
  - **Analytics e Métricas:** Desenvolvimento de um dashboard com insights gerenciais (e.g., turnover, tendências de movimentação).
  - **Testes Automatizados:** Aumento da cobertura de testes para garantir a qualidade e estabilidade do sistema.
  - **Otimizações de Performance:** Melhorias na performance e responsividade do sistema.
  - **Configuração Avançada de Ambientes:** Separação completa de configurações dev/prod/test com pipelines automatizados.
  - **Documentação Avançada:** Guias de migração, processos de desenvolvimento detalhados e documentação técnica expandida.