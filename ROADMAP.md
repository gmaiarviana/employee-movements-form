# Roadmap - Employee Exit Process

## ✅ **Fase 1: POC (Proof of Concept)**
**Objetivo**: Validar fluxo básico de saída de funcionários

**Capacidades:**
- Interface com 4 páginas HTML separadas
- Dados mock em 3 arquivos JSON (employees, projects, employee_projects)
- Fluxo completo: seleção → formulário → resumo → confirmação
- Express.js servindo páginas + APIs simples
- Docker single container
- Usuário simulado fixo (Maria Santos)
- Processo de saída apenas

---

## 🎯 **Fase 2: MVP (Minimum Viable Product)**
**Objetivo**: Banco de dados real e persistência

**Capacidades:**
- Migração dos 3 JSONs para tabelas PostgreSQL
- Mesmas APIs, nova fonte de dados
- Persistência real das movimentações
- Validações de integridade no backend
- Docker Compose (app + database)
- Estrutura de dados escalável

---

## 🎯 **Fase 3: Autenticação**
**Objetivo**: Login real e controle de acesso

**Capacidades:**
- Sistema de login simples (email/senha)
- Sessão de usuário (JWT ou sessions)
- Middleware de autenticação nas rotas
- Página de login antes do fluxo principal
- Identificação real do líder logado
- Logout funcional

---

## 🎯 **Fase 4: Formulário de Entrada**
**Objetivo**: Processo completo de movimentação

**Capacidades:**
- Nova opção na home: "Entrada de Funcionário"
- Fluxo de entrada: selecionar funcionário disponível → adicionar ao projeto
- Dados específicos do processo de entrada
- Validação de funcionários disponíveis/ocupados
- Interface para ambos os processos (entrada/saída)

---

## 🔮 **Fase 5: Dashboard Administrativo**
**Objetivo**: Visibilidade e controle gerencial

**Capacidades:**
- Perfil de administrador
- Relatório de movimentações mensais
- Histórico completo de entradas/saídas
- Filtros por período, projeto, funcionário
- Exportação de dados (CSV/PDF)
- Métricas básicas (turnover, etc)

---

## 🔮 **Fase 6: Otimização e UX**
**Objetivo**: Interface moderna e performance

**Capacidades:**
- Migration para React.js ou Vue.js
- Design system consistente
- Validações em tempo real
- Interface responsiva
- Otimizações de performance
- Testes automatizadoss