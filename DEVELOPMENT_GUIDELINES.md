# Diretrizes de Desenvolvimento - Contract Movements

## Visão Geral

Este documento define **como trabalhar** no projeto Contract Movements. O **que construir** está em `ROADMAP.md` e detalhes técnicos em `README.md` de cada componente.

## Ambiente de Desenvolvimento

### **PowerShell + Node.js/Docker**
- **Sistema**: Windows PowerShell - NUNCA usar comandos Linux
- **Comandos válidos**: `docker-compose up`, `Get-Content`, `Select-String`, `git add arquivo.js`
- **Comandos proibidos**: `&&`, `|`, `grep`, `curl`, `sleep`
- **Validação**: `docker-compose up -d` + testar no browser `http://localhost:3000`

### **Controle de Versão**
- **Commits específicos**: SEMPRE `git add arquivo1.js arquivo2.html` - NUNCA `git add .`
- **Mensagens**: "feat/fix: descrição - Feature X.Y concluída"
- **Frequência**: 1 commit por sub-task validada

## Processo de Refinamento

### **1. ÉPICOS → FEATURES**
- **Com o auxílio do Gemini, quebrar o épico em 2-5 features específicas no Jira.**
- Cada feature deve entregar valor demonstrável para o usuário.
- Definir critérios de aceite comportamentais para a feature completa.

### **2. FEATURES → SUB-TASKS**
- Para cada feature, **o Gemini irá propor a quebra em sub-tasks de 5-15 minutos.**
- Cada sub-task deve ser uma unidade de trabalho específica e validável, podendo abranger modificações relacionadas em poucos arquivos.
- Manter no máximo 3-6 sub-tasks por sessão de implementação em uma feature.
- Cada sub-task deve ser testável individualmente.
- **Features e sub-tasks no Jira não precisam de "Summary"**.
- **Numeração:** Features usam formato '4.2' e sub-tasks usam '4.2.1, 4.2.2, 4.2.3...'

**Template para descrição de sub-tasks no Jira:**
```
**Expectativas Técnicas:**
**Validação:**  
**Critérios de Aceite:**
```

**Nota:** Prompts do Copilot ficam na sessão de implementação, não no Jira.

### 3. FLUXO DE TRABALHO: SUB-TASK A SUB-TASK (COM AUXÍLIO DO GEMINI/COPILOT)

Para cada Feature, o trabalho será dividido e executado em sub-tasks sequenciais e validáveis, seguindo o seguinte ciclo:

1.  **Definição da Feature Atual:**
    * O Gemini indicará claramente qual Feature do Épico atual está em foco.

2.  **Lista de Sub-tasks da Feature:**
    * As sub-tasks serão fornecidas pelo usuário no início da sessão de implementação, já planejadas e numeradas (4.2.1, 4.2.2, etc.).
    * Cada Sub-task será concisa e com um objetivo claro e **único**.

3.  **Execução da Sub-task N:**
    * O Gemini declarará explicitamente: "Vamos agora para a Sub-task N: [Descrição da Sub-task]".
    * **Prompt para o Copilot:** O Gemini fornecerá o prompt específico para o GitHub Copilot para a sub-task atual.
    * **Expectativa:** O Gemini descreverá o resultado esperado da execução da sub-task (ex: "O Copilot deve gerar o arquivo X.html com Y campos. Após isso, você deverá verificar e criar/atualizar o arquivo.").
    * **Validação:** O desenvolvedor (você) confirmará a conclusão da sub-task e sua validação (ex: "Sub-task N concluída. Código revisado/aplicado.").
    * **Commit:** Realizar um `git add <arquivos>` e `git commit -m "feat: [descrição da sub-task] - Feature X.Y"` para **cada sub-task validada**.

4.  **Próxima Sub-task:**
    * Após a validação da Sub-task N, o Gemini passará para a Sub-task N+1, repetindo o ciclo.

**Critério de Conclusão da Feature:**
* Uma Feature é considerada completa quando todas as suas Sub-tasks foram executadas, validadas e commitadas individualmente.
* Ao final da Feature, será realizada uma validação abrangente para confirmar o comportamento esperado.
* Um commit final será feito para a conclusão da feature, referenciando-a.
* Atualizar a documentação relevante (ex: ARCHITECTURE.md, ROADMAP.md, DEVELOPMENT_GUIDELINES.md) para refletir as mudanças ou o status da feature concluída, se necessário.

### **4. SUB-TASKS → PROMPTS (Sessão de Implementação com Gemini para GitHub Copilot)**
- Para cada sub-task, **o Gemini irá gerar um prompt estruturado, seguindo o template específico abaixo, para ser utilizado diretamente com o GitHub Copilot no VSCode.**
- Após a geração do prompt, aguardar a sua validação e execução, e então prosseguir para a próxima sub-task.

## Reflexão Técnica Interna do Gemini

O usuário fornecerá as sub-tasks e documentações no início da sessão. O Gemini deve solicitar arquivos específicos se necessário para obter contexto antes de gerar prompts.

O Gemini realizará uma auto-reflexão técnica antes de gerar sub-tasks e prompts. Para isso, consultará o contexto existente (arquivos fornecidos, histórico da conversa) e, se necessário, **solicitará a visualização de arquivos específicos ou fará perguntas para esclarecer**:
1.  **STACK**: Confirmar as tecnologias envolvidas (Node.js + Express + Docker + PostgreSQL).
2.  **COMPATIBILITY**: Garantir que os comandos gerados são compatíveis com PowerShell e o ambiente Docker.
3.  **ARCHITECTURE**: Entender como a nova feature se encaixa na estrutura de páginas (`src`), APIs (`server.js`) e fluxo de dados existente.
4.  **DATA**: Verificar a necessidade de criar ou atualizar estrutura do banco PostgreSQL. Identificar quais APIs serão impactadas ou criadas.
5.  **VALIDATION**: Definir a melhor forma de testar o comportamento esperado no browser após a implementação da sub-task.

## Template para Sub-tasks (Gerado pelo Gemini para o GitHub Copilot)

```markdown
## 🎯 SUB-TASK: [Nome Específico da Sub-task]

### Para o GitHub Copilot:
[AÇÃO] arquivo [CAMINHO]

[Detalhe 1]: especificação técnica
[Detalhe 2]: especificação técnica
[Detalagem N]: especificação técnica


### Validação PowerShell:
```powershell
docker-compose up -d
# Testar: [comportamento esperado no browser após a execução da sub-task]
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
- Sistema funcionando após cada sub-task
- Validação no browser obrigatória
- 1 commit por sub-task validada

### **Simples e Funcional**
- Foco na funcionalidade sobre otimização
- PostgreSQL database para persistência
- React + Vite para interface moderna

## Regras Fundamentais

✅ **SEMPRE:**
- Valide cada sub-task adequadamente antes do próximo commit.
- Adicione apenas os arquivos modificados/criados ao `git` (`git add arquivo.js`).
- Garanta que o sistema esteja sempre funcionando ao final de cada sub-task/commit.
- Mantenha o foco na sub-task atual, evitando desvios para otimizações prematuras.

❌ **NUNCA:**
- Use `git add .` ou `git commit -am "mensagem"`.
- Altere arquivos não relacionados à tarefa atual.
- Deixe o sistema em estado não funcional.
- Assuma comandos Linux ou outros ambientes que não sejam PowerShell/Docker.

#### 4.1. Dicas para Prompts e "Bloqueios" do Copilot

* **Priorizar Especificidade:** Quanto mais específicos os requisitos (IDs, classes CSS únicas, nomes de variáveis, lógica de negócios customizada), menor a chance de colisões com código público.
* **Dividir Sub-tasks Complexas:** Para grandes blocos de código (especialmente HTML de formulários complexos), pode ser mais eficaz pedir ao Copilot para gerar partes menores ou elementos específicos, e então montar o resultado final manualmente, se necessário.
* **Refrasear Agresivamente:** Se um prompt for bloqueado, reformular de forma diferente, alterando a estrutura da frase ou focando em aspectos mais nichados, é a primeira linha de defesa.
* **Compreender a Natureza do Conteúdo:**
    * **HTML (Estruturas Comuns):** Formulários, tabelas, layouts básicos são altamente padronizados e mais propensos a serem bloqueados. Nesses casos, a criação manual ou prompts *muito* detalhados com nomes e classes únicas são preferíveis.
    * **JavaScript (Lógica Específica):** Funções com lógica de negócios customizada, manipulação de dados específicos (com chaves únicas, como `newEntryData`), ou interações complexas tendem a ter menos "colisões genéricas" e o Copilot é mais eficaz.
* **Intervenção Manual:** Em casos persistentes de bloqueio, o Gemini fornecerá o código diretamente, permitindo a continuidade do desenvolvimento. O objetivo é sempre avançar.