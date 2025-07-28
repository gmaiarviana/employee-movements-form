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

### **1. ETAPAS → FUNCIONALIDADES**
- Ler etapa no ROADMAP.md (ex: "Fase 2: MVP")
- Quebrar em 2-4 funcionalidades específicas
- Cada funcionalidade = valor demonstrável para usuário
- Definir critérios de aceite comportamentais

### **2. FUNCIONALIDADES → TAREFAS**
- Quebrar funcionalidade em tarefas de 5-15 minutos
- Cada tarefa = 1 arquivo criado/modificado
- Máximo 3-4 tarefas por sessão
- Tarefas devem ser testáveis individualmente

### **3. TAREFAS → PROMPTS**
- Cada tarefa = 1 prompt estruturado para GitHub Copilot
- Template específico com validação PowerShell
- Aguardar confirmação antes da próxima tarefa

## Reflexão Técnica Obrigatória

Antes de qualquer implementação, SEMPRE executar:

1. **STACK**: Node.js + Express + Docker + arquivos JSON
2. **COMPATIBILITY**: PowerShell commands? Docker ports corretos?
3. **ARCHITECTURE**: Como integra com estrutura existente?
4. **DATA**: Arquivos JSON atualizados? APIs funcionando?
5. **VALIDATION**: Como testar no browser após implementação?

## Template para Prompts

```markdown
## 🎯 TAREFA: [Nome Específico]

### Para o GitHub Copilot:
```
[AÇÃO] arquivo [CAMINHO]
- [Detalhe 1]: especificação técnica
- [Detalhe 2]: especificação técnica
```

### Validação PowerShell:
```powershell
docker-compose up -d
# Testar: [comportamento esperado no browser]
```

**Critério de Aceite:**
✅ Deve: [output específico]
❌ NÃO deve: [erros específicos]
```

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
- Arquivos JSON para dados (POC)
- HTML/CSS/JS vanilla para interface

## Regras Fundamentais

✅ **SEMPRE:**
- Reflexão técnica antes de implementar
- Template estruturado para Copilot
- Validação PowerShell + browser após tarefa
- Commit específico quando funcionar

❌ **NUNCA:**
- Comandos Linux no PowerShell
- `git add .` em commits
- Prosseguir com validação falhando
- Implementar sem testar no browser