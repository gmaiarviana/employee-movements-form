# CONTRIBUTING.md

Guia para contribuir no Employee Movements System.

## 🚀 Como Começar

```powershell
# 1. Clone o projeto
git clone https://guilherme_viana1@bitbucket.org/institutoatlantico/employee-movements-form.git
cd employee-movements-form

# 2. Inicie o sistema (vai baixar e configurar tudo automaticamente)
docker-compose up -d --build

# 3. Teste se funcionou
Invoke-WebRequest -Uri "http://localhost:3000/api/health"
# Acesse no browser: http://localhost:3001
```

**Pronto!** O sistema está rodando. Se deu erro, peça ajuda.

## 📋 Como Escolher o que Implementar

1. Abra `ROADMAP.md`
2. Escolha uma feature disponível (ex: Feature 7.3, 8.1, etc.)
3. Siga o processo abaixo

## 🤖 Implementando com AI (Processo Recomendado)

### Setup das Ferramentas
- **GitHub Copilot** no seu IDE (já configurado via `.copilot-instructions.md`)
- **Gemini** como assistente (acesse [gemini.google.com](https://gemini.google.com))

### Processo Passo-a-Passo

```powershell
# 1. Criar branch para sua feature
git checkout -b feature-X.Y
```

**2. Pedir ao Gemini para quebrar a feature:**

```
"Consulte o arquivo DEVELOPMENT_GUIDELINES.md para entender o processo completo.

Analise a Feature X.Y do ROADMAP.md e quebre em sub-tasks específicas seguindo as diretrizes do DEVELOPMENT_GUIDELINES.md.

Gere o PRIMEIRO prompt estruturado para o GitHub Copilot, seguindo o template definido no documento. Aguarde minha confirmação antes de prosseguir para a próxima sub-task."
```

**3. Para cada sub-task que o Gemini fornecer:**

```powershell
# Implementar no IDE com Copilot usando o prompt gerado
# Validar se a sub-task específica funcionou
docker-compose up -d
Invoke-WebRequest -Uri "http://localhost:3000/api/health"
# Testar no browser: http://localhost:3001
```

**4. Revisar com Gemini:**
- Envie: `git status`, `git diff`, código gerado + resultados dos testes
- Gemini vai avaliar se está correto antes do commit

**5. Commit da sub-task (só após aprovação do Gemini):**
```powershell
git add arquivos-modificados.js
git commit -m "feat: descrição da sub-task - Feature X.Y.Z"
```

**6. Repetir até completar a feature**

**7. Finalizar e abrir Pull Request:**
```powershell
# Push da branch
git push origin feature-X.Y

# No Bitbucket: 
# - Abrir Pull Request
# - Aguardar aprovação 
# - Merge será feito após aprovação
```

## 📚 Documentações de Apoio

- `DEVELOPMENT_GUIDELINES.md` (diretrizes que o Gemini deve seguir)
- `backend/README_BACKEND.md` (APIs disponíveis)
- `frontend/README_FRONTEND.md` (Frontend)
- `backend/DATABASE.md` (Banco de dados)

## 🔄 Controle de Versão (Git)

**Se o prompt está levando para caminho ruim:**
```powershell
git restore arquivo.js          # Desfaz mudanças não commitadas
```

**Fluxo completo:**
1. `git checkout -b feature-X.Y` - Criar branch
2. Implementar sub-tasks com commits
3. `git push origin feature-X.Y` - Enviar para repositório  
4. Abrir Pull Request no Bitbucket
5. Aguardar aprovação e merge

---

**Resumo:** Escolha feature → Gemini quebra → Copilot implementa → Valida → Gemini aprova → Commit → Repete → PR