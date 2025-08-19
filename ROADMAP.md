# Roadmap - Employee Exit Process (Contract Movements)

## ✅ Épico 1: Prova de Conceito (POC)
- Registro de saída com armazenamento JSON e interface básica.

## ✅ Épico 2: Protótipo Estendido  
- Formulário de entrada, dashboard administrativo e filtros básicos.

## ✅ Épico 3: Interface Moderna
- Migração para React + Vite, design system e arquitetura frontend/backend separada.

## ✅ Épico 4: Persistência e Autenticação
- PostgreSQL implementado e sistema de login/registro com JWT.

## ✅ Épico 5: Fluxos Realistas MVP - Integração com Dados Corporativos
- Adaptação de formulários para fluxo real do MVP, integração com dados corporativos (Instituto Atlântico) e dados específicos HP.

---

## 🚧 Épico 6: Frontend e APIs - Integração com Dados Estendidos
- Objetivo: Atualizar sistema para utilizar os novos campos de dados pessoais e corporativos implementados no banco.

### **📊 CONTEXTO TÉCNICO - ESTRUTURA ATUAL DO BANCO:**
```
SCHEMA CORE:
- core.employees: NOVOS CAMPOS → cpf, rg, data_nascimento, nivel_escolaridade, formacao
- core.users: sem alterações

SCHEMA HP_PORTFOLIO:
- hp_portfolio.projects: NOVOS CAMPOS → sow_pt (UNIQUE), gerente_hp
- hp_portfolio.hp_employee_profiles: NOVA TABELA → employee_id (FK), hp_employee_id
- hp_portfolio.movements: NOVO CAMPO → bundle_aws
- hp_portfolio.project_managers: sem alterações

DADOS ATUAIS:
- 15 funcionários com dados pessoais completos
- 3 funcionários com perfis HP (EMP003, EMP008, EMP011)
- 1 projeto com SOW/PT preenchido
- 4 movimentações existentes
```

### **🎯 ARQUIVOS FRONTEND QUE PRECISAM MODIFICAÇÃO:**
```
BACKEND:
- backend/controllers/employeeController.js → retornar novos campos pessoais
- backend/controllers/movementController.js → validar bundle_aws
- backend/routes/projects.js → retornar sow_pt, gerente_hp

FRONTEND:
- frontend/src/components/forms/EntryForm.jsx → adicionar campo infraestrutura + bundle_aws
- frontend/src/components/forms/ExitForm.jsx → mostrar CPF, data nascimento
- frontend/src/components/forms/SelectEmployee.jsx → mostrar formação
- frontend/src/components/pages/AdminDashboard.jsx → modal detalhes funcionário
```

- Funcionalidades:
  - **6.1. Atualização dos Controllers Backend:**
    - **Objetivo:** Modificar APIs para retornar e validar os novos campos de dados pessoais e HP.
    - **Critérios de Aceite:**
      - API `GET /api/employees` deve retornar CPF, RG, data de nascimento, nível de escolaridade e formação.
      - API `GET /api/employees/:id/details` deve incluir dados do perfil HP (hp_employee_id) quando disponível.
      - API `GET /api/projects` deve retornar SOW/PT e gerente HP.
      - API `POST /api/entries` deve validar e salvar campo `bundle_aws` quando `machine_type='aws'`.
      - Implementar validação de formato de CPF (###.###.###-##) no backend.

  - **6.2. Campo Bundle AWS Condicional no Formulário de Entrada:**
    - **Objetivo:** Adicionar lógica condicional para o campo bundle AWS baseado na seleção de infraestrutura.
    - **Critérios de Aceite:**
      - Adicionar campo "Tipo de infraestrutura necessária" com opções: "Necessário o envio de máquina", "Ambiente AWS", "Máquina disponível".
      - Campo "Bundle necessário para o ambiente AWS" deve aparecer apenas quando "Ambiente AWS" for selecionado.
      - Dropdown bundle deve permitir entrada livre de texto (não restrito a valores específicos).
      - Campo bundle deve ser obrigatório quando "Ambiente AWS" estiver selecionado.
      - Validação frontend deve impedir envio sem bundle quando AWS for escolhido.

  - **6.3. Visualização de Dados Pessoais nos Funcionários:**
    - **Objetivo:** Exibir dados pessoais completos dos funcionários onde relevante.
    - **Critérios de Aceite:**
      - ExitForm deve mostrar CPF e data de nascimento do funcionário selecionado.
      - SelectEmployee deve mostrar formação do funcionário na lista quando disponível.
      - AdminDashboard deve ter opção para visualizar detalhes completos do funcionário (modal ou página).
      - Implementar máscara visual para CPF (###.###.###-##) no frontend.

  - **6.4. Integração com Dados HP e Projetos:**
    - **Objetivo:** Utilizar dados da nova estrutura HP_employee_profiles e campos de projeto.
    - **Critérios de Aceite:**
      - EntryForm deve migrar hp_employee_id para usar nova tabela hp_employee_profiles.
      - AdminDashboard deve mostrar SOW/PT e gerente HP quando visualizar detalhes do projeto.
      - Sistema deve sincronizar dados entre movements e hp_employee_profiles.
      - Funcionários com perfil HP devem mostrar hp_employee_id na visualização detalhada.

  - **6.5. Validações e Tratamento de Dados Legados:**
    - **Objetivo:** Garantir compatibilidade com dados existentes e validações robustas.
    - **Critérios de Aceite:**
      - Sistema deve funcionar normalmente para funcionários sem dados pessoais preenchidos.
      - Implementar fallbacks para exibição quando campos opcionais estão vazios.
      - Backend deve validar formato de CPF e retornar mensagens de erro específicas.
      - Frontend deve tratar graciosamente funcionários sem perfil HP.
      - Logs devem incluir contexto dos novos campos para debugging.

---

## 🔮 Épico 7: Relatórios e Integrações Avançadas
- Objetivo: Implementar funcionalidades avançadas para o ambiente de produção.
- Funcionalidades:
  - **7.1. Geração de Relatório de Movimentação (PDF):**
    - **Objetivo:** Permitir que o usuário gere e baixe um relatório em PDF com os detalhes de uma movimentação específica.
    - **Critérios de Aceite:**
      - O frontend do `AdminDashboard.jsx` deve exibir um botão para `Gerar PDF` ao lado de cada movimentação na tabela.
      - Ao clicar no botão, uma nova API no backend deve ser chamada.
      - O backend deve gerar um arquivo PDF formatado com os dados completos da movimentação e enviá-lo para download.

  - **7.2. Integração com Sistemas de RH:**
    - Conexão com APIs ou bancos existentes para importar informações de funcionários e projetos.
    - Sincronização automática para reduzir entrada manual de dados.
    - Validação e mapeamento de dados externos para a estrutura interna do sistema.

  - **7.3. Refatoração de Componentes Grandes:**
    - **Objetivo:** Melhorar maintainability quebrando componentes grandes em módulos menores
    - **Critérios de Aceite:**
      - `AdminDashboard.jsx` deve ser dividido em `<DateFilters>`, `<MovementsTable>`, e `<SortControls>`
      - `ExitForm.jsx` deve ter lógica de validação extraída em hook customizado
      - Componentes devem manter funcionalidade idêntica após refatoração

## 🔮 Épico 8: Autenticação com Google Login
- Objetivo: Melhorar a experiência de autenticação com integração OAuth.
- Funcionalidades:
  - **Integração OAuth Google:** Substituir o sistema de login simples por autenticação via Google Login.
  - **Gestão de Sessões Aprimorada:** Melhorar o controle de acesso e a experiência do usuário através de um gerenciamento de sessões mais robusto.

## 🔮 Épico 9: Melhorias e Otimização
- Objetivo: Prover funcionalidades avançadas e otimizações para o sistema.
- Funcionalidades:
  - **Analytics e Métricas:** Desenvolvimento de um dashboard com insights gerenciais (e.g., turnover, tendências de movimentação).
  - **Testes Automatizados:** Aumento da cobertura de testes para garantir a qualidade e estabilidade do sistema.
  - **Otimizações de Performance:** Melhorias na performance e responsividade do sistema.
  - **Configuração Avançada de Ambientes:** Separação completa de configurações dev/prod/test com pipelines automatizados.
  - **Documentação Avançada:** Guias de migração, processos de desenvolvimento detalhados e documentação técnica expandida.