# Roadmap - Employee Movements System

## 📊 **Épico 1: Relatórios em PDF**
**Contexto:** Permitir download de relatórios em PDF das movimentações para facilitar compartilhamento, arquivamento e documentação formal dos processos.

#### **Funcionalidades:**

##### **1.1 Relatório de Período no Admin Dashboard**
- **Descrição:** Botão para baixar PDF com lista detalhada das movimentações filtradas
- **Critérios de Aceite:**
  - Botão "Gerar Relatório PDF" visível na seção de filtros do AdminDashboard
  - Relatório deve conter todas as movimentações exibidas na tabela atual (respeitando filtros aplicados)
  - PDF deve incluir: cabeçalho com período selecionado, data de geração, logo/nome da empresa
  - Cada movimentação deve mostrar: data, tipo (entrada/saída), funcionário, projeto, detalhes
  - Formato profissional e legível (tabela bem formatada)
  - Nome do arquivo: "Movimentacoes_[PERIODO]_[DATA_GERACAO].pdf"

##### **1.2 Relatório Individual de Entrada**
- **Descrição:** Botão na página SummaryEntry para baixar PDF com dados da entrada específica
- **Critérios de Aceite:**
  - Botão "Baixar PDF" na página de resumo de entrada
  - PDF deve conter todas as seções: Dados Corporativos, Dados Pessoais, Dados HP, Dados do Projeto
  - Incluir dados do projeto: nome, código/SOW-PT, gerente HP
  - Layout similar ao resumo exibido na tela
  - Nome do arquivo: "Entrada_[NOME_FUNCIONARIO]_[DATA].pdf"

##### **1.3 Relatório Individual de Saída**
- **Descrição:** Botão na página SummaryExit para baixar PDF com dados da saída específica  
- **Critérios de Aceite:**
  - Botão "Baixar PDF" na página de resumo de saída
  - PDF deve conter: Dados Corporativos, Dados do Projeto, Dados HP, Dados da Saída
  - Incluir dados do projeto: nome, código/SOW-PT, gerente HP
  - Layout consistente com relatório de entrada
  - Nome do arquivo: "Saida_[NOME_FUNCIONARIO]_[DATA].pdf"

---

## 🎨 **Épico 2: Padronização da Interface de Resumos**
**Contexto:** Unificar a experiência de usuário entre as páginas de resumo de entrada e saída, garantindo layout consistente e exibição completa dos dados.

#### **Funcionalidades:**

##### **2.1 Padronização de Layout** 
- **Descrição:** Unificar estrutura visual entre SummaryEntry e SummaryExit
- **Critérios de Aceite:**
  - Ambas páginas devem usar a mesma estrutura CSS (usar `summary-grid`/`data-row` como padrão)
  - Seções organizadas de forma idêntica: Dados Corporativos → Dados Pessoais → Dados do Projeto → Dados HP → Dados Específicos (Entrada/Saída)
  - Espaçamentos, cores e tipografia consistentes
  - Labels padronizados para campos similares

##### **2.2 Exibição Completa de Dados do Projeto**
- **Descrição:** Garantir que ambas as páginas exibam informações completas do projeto
- **Critérios de Aceite:**
  - SummaryEntry deve exibir: nome do projeto, SOW/PT, gerente HP, descrição
  - SummaryExit deve manter: nome do projeto, tipo, SOW/PT + adicionar gerente HP se disponível
  - Tratamento adequado para dados ausentes ("Não informado" de forma consistente)
  - Mesma estrutura de seção "Dados do Projeto" em ambas

##### **2.3 Padronização de Fonte de Dados**
- **Descrição:** Corrigir débito técnico atual onde SummaryEntry obtém dados via URL parameters (inseguro, URLs longas) enquanto SummaryExit usa chamadas de API. Unificar ambas para usar o mesmo padrão de busca de dados via API.
- **Critérios de Aceite:**
  - SummaryEntry deve migrar de URL params para chamadas de API (como SummaryExit)
  - Estrutura de dados consistente entre as páginas
  - Tratamento de loading e erro padronizado
  - Fallbacks consistentes para dados ausentes

---

## 🔐 **Épico 3: Autenticação Google**
**Contexto:** Substituir completamente o sistema de email/senha por autenticação Google, simplificando o acesso e melhorando a segurança.

#### **Funcionalidades:**

##### **3.1 Implementação de Google OAuth**
- **Descrição:** Configurar autenticação via Google OAuth no backend e frontend
- **Critérios de Aceite:**
  - Remover rotas de `/register` e `/login` do sistema atual
  - Implementar OAuth 2.0 com Google no backend
  - Página de login deve ter apenas botão "Entrar com Google"
  - Após autenticação Google, verificar se email está na lista autorizada
  - Se email autorizado: criar/atualizar usuário e gerar JWT
  - Se email não autorizado: exibir mensagem de acesso negado

##### **3.2 Controle de Acesso via Gestores Cadastrados**
- **Descrição:** Permitir login apenas para gestores cadastrados na tabela project_managers
- **Critérios de Aceite:**
  - Após autenticação Google, verificar se email existe na tabela project_managers
  - Se email encontrado: permitir acesso e criar/atualizar registro na tabela users
  - Se email não encontrado: exibir mensagem de acesso negado
  - Todos gestores têm mesmo nível de acesso inicialmente
  - Email Google como identificação única entre sistemas
  - Manter associação gestor-projeto via project_managers

##### **3.3 Preparação da Estrutura de Dados**
- **Descrição:** Ajustar estrutura do banco para suportar autenticação Google e integração futura
- **Critérios de Aceite:**
  - Remover campos de senha do banco de dados (password_hash da tabela users)
  - Garantir que tabela project_managers utiliza emails Gmail como identificação
  - Manter estrutura atual de 3 tabelas (users, employees, project_managers)
  - Dados pessoais (employees) serão populados pela integração RH (épico 4)
  - Documentar fluxo: Google Auth → verificação project_managers → criação/atualização users

---

## **Épico 4: Integração com Sistemas de RH**
Integrar com sistemas externos de RH para utilizar dados corporativos como fonte automatizada, reduzindo entrada manual de informações de funcionários e mantendo dados sempre atualizados.

## **Épico 5: Refatoração de Componentes**
Melhorar maintainability do código quebrando componentes grandes em módulos menores e mais organizados, facilitando desenvolvimento e manutenção futura.

---

## 💡 **Ideias Futuras**

### **Analytics e Métricas**
- Dashboard com insights gerenciais (turnover, tendências de movimentação)
- Métricas de performance do sistema
- Relatórios de tendências por período/projeto

### **Testes Automatizados** 
- Cobertura de testes unitários e integração
- Testes e2e para fluxos críticos
- Pipeline de CI/CD com testes automatizados

### **Otimizações de Performance**
- Melhorias na responsividade do sistema
- Otimização de consultas ao banco
- Cache estratégico para dados frequentemente acessados

### **Melhorias de UX/UI**
- Design system mais robusto
- Melhorias de acessibilidade
- Interface mobile-friendly

### **Configurações Avançadas**
- Ambiente de desenvolvimento/produção/teste separados
- Configurações customizáveis por organização
- Sistema de logs e auditoria avançado