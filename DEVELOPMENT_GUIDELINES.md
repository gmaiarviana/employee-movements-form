# Diretrizes de Desenvolvimento - Contract Movements

## Visão Geral

Este documento define **como trabalhar** no projeto Contract Movements. O **que construir** está em `ROADMAP.md` e detalhes técnicos em `ARCHITECTURE.md`.

## Ambiente de Desenvolvimento

### **PowerShell + Node.js/Docker**
- **Sistema**: Windows PowerShell - NUNCA usar comandos Linux
- **Comandos válidos**: `docker-compose up`, `Get-Content`, `Select-String`, `git add arquivo.js`
- **Comandos proibidos**: `&&`, `|`, `grep`, `curl`, `sleep`
- **Validação**: `docker-compose up -d` + testar no browser `http://localhost:3000`

### **Controle de Versão**
- **Commits específicos**: SEMPRE `git add arquivo1.js arquivo2.html` - NUNCA `git add .`
- **Mensagens**: "feat/fix: descrição - Funcionalidade X.Y concluída"
- **Frequência**: 1 commit por tarefa validada

## Processo de Refinamento

### **1. ÉPICOS → FUNCIONALIDADES**
- Ler o Épico no `ROADMAP.md` (ex: "Épico 2: Protótipo Estendido").
- **Com o auxílio do Gemini, quebrar o épico em 2-5 funcionalidades específicas.**
- Cada funcionalidade deve entregar valor demonstrável para o usuário.
- Definir critérios de aceite comportamentais para a funcionalidade completa.

### **2. FUNCIONALIDADES → TAREFAS**
- Para cada funcionalidade, **o Gemini irá propor a quebra em tarefas de 5-15 minutos.**
- Cada tarefa deve idealmente corresponder à criação ou modificação de um único arquivo.
- Manter no máximo 3-6 tarefas por sessão de trabalho em uma funcionalidade.
- Cada tarefa deve ser testável individualmente.

### **3. TAREFAS → PROMPTS (Geração com Gemini para GitHub Copilot)**
- Para cada tarefa, **o Gemini irá gerar um prompt estruturado, seguindo o template específico abaixo, para ser utilizado diretamente com o GitHub Copilot no VSCode.**
- Após a geração do prompt, aguardar a sua validação e execução, e então prosseguir para a próxima tarefa.

## Reflexão Técnica Interna do Gemini

O Gemini realizará uma auto-reflexão técnica antes de gerar tarefas e prompts. Para isso, consultará o contexto existente (arquivos fornecidos, histórico da conversa) e, se necessário, **solicitará a visualização de arquivos específicos ou fará perguntas para esclarecer**:
1.  **STACK**: Confirmar as tecnologias envolvidas (Node.js + Express + Docker + JSON/DB).
2.  **COMPATIBILITY**: Garantir que os comandos gerados são compatíveis com PowerShell e o ambiente Docker.
3.  **ARCHITECTURE**: Entender como a nova funcionalidade se encaixa na estrutura de páginas (`src/public`), APIs (`server.js`) e fluxo de dados existente.
4.  **DATA**: Verificar a necessidade de criar ou atualizar arquivos JSON, ou antecipar alterações para o banco de dados futuro. Identificar quais APIs serão impactadas ou criadas.
5.  **VALIDATION**: Definir a melhor forma de testar o comportamento esperado no browser após a implementação da tarefa.

## Template para Prompts (Gerado pelo Gemini para o GitHub Copilot)

```markdown
## 🎯 TAREFA: [Nome Específico da Tarefa]

### Para o GitHub Copilot:
[AÇÃO] arquivo [CAMINHO]

[Detalhe 1]: especificação técnica
[Detalhe 2]: especificação técnica
[Detalagem N]: especificação técnica


### Validação PowerShell:
```powershell
docker-compose up -d
# Testar: [comportamento esperado no browser após a execução da tarefa]
Critério de Aceite:
✅ Deve: [output específico ou comportamento esperado no browser]
❌ NÃO deve: [erros específicos ou comportamentos indesejados]

## Princípios de Qualidade

### **PowerShell-First**
- Comandos testados no Windows PowerShell
- NUNCA assumir comandos Linux

### **Docker-First**
- Sistema sempre via container
- Dados preservados em volumes
- Porta 3000 para acesso

### **Incremental**
- Sistema funcionando após cada tarefa
- Validação no browser obrigatória
- 1 commit por tarefa validada

### **Simples e Funcional**
- Foco na funcionalidade sobre otimização
- Arquivos JSON para dados (POC/Protótipo)
- HTML/CSS/JS vanilla para interface

## Regras Fundamentais

✅ **SEMPRE:**
- Valide cada tarefa no navegador (`http://localhost:3000`) antes do próximo commit.
- Adicione apenas os arquivos modificados/criados ao `git` (`git add arquivo.js`).
- Garanta que o sistema esteja sempre funcionando ao final de cada tarefa/commit.
- Mantenha o foco na tarefa atual, evitando desvios para otimizações prematuras.

❌ **NUNCA:**
- Use `git add .` ou `git commit -am "mensagem"`.
- Altere arquivos não relacionados à tarefa atual.
- Deixe o sistema em estado não funcional.
- Assuma comandos Linux ou outros ambientes que não sejam PowerShell/Docker.