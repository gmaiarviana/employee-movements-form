# 📋 **Padrões para Tickets do Jira**

## 🎯 **Épicos**

**Formato:** `ÉPICO X: Nome Descritivo`

**Estrutura:**
```
**Contexto:** [Problema ou necessidade]
**Valor de Negócio:** [Benefício tangível]  
**Stack Técnica:** [Tecnologias utilizadas]
**Critérios de Aceite do Épico:**
* [Requisito de alto nível 1]
* [Requisito de alto nível 2]
```

**Exemplo:**
```
ÉPICO 4: Interface Organizada e Transparente

**Contexto:** Melhorar clareza dos formulários reduzindo sobrecarga cognitiva.
**Valor de Negócio:** Experiência mais intuitiva, menos erros de preenchimento.
**Stack Técnica:** React 18 + CSS + PowerShell/Docker.
**Critérios de Aceite do Épico:**
* Seções visuais claramente delimitadas
* Layout responsivo mantido
* Funcionalidade atual preservada
```

## 🔧 **Funcionalidades**

**Formato:** `FUNCIONALIDADE X.Y: Nome Descritivo`

**Estrutura:**
```
[Descrição em uma frase clara]

**Critérios de Aceite:**
* [Critério específico e testável 1]
* [Critério específico e testável 2]
```

**Exemplo:**
```
FUNCIONALIDADE 4.1: Melhoria Visual das Seções de Formulário

Transformar seções atuais em cards visuais distintos.

**Critérios de Aceite:**
* EntryForm e ExitForm com cards delimitados
* Headers com ícones (👤 Dados Corporativos, 📋 Dados do Projeto)
* Espaçamento de 16px entre cards
* Funcionalidade atual mantida
```

## ✅ **Regras**
- Critérios de aceite **específicos e testáveis**
- Sempre mencionar preservação de funcionalidade existente
- Épicos no roadmap antes do Jira