---
name: codebase-audit
description: Use when the user asks to check if a functionality, component, or pattern already exists in the codebase, or when running /audit for a full app scan. Covers duplicate detection, codebase exploration, centralization analysis. Trigger on keywords like "verify if exists", "check if already implemented", "find existing", "duplicate", "centralize", "codebase audit", "already have", "exists in project", "reuse", "DRY", "audit".
---

# Codebase Audit

Workflow de varredura do codebase para identificar componentes, hooks, utils e services duplicados. Pode ser pontual (buscar algo específico) ou completo (varrer todo o app).

---

## Modo 1: Auditoria Completa (`/audit`)

Quando o usuário roda `/audit` ou pede "auditoria completa", executar a varredura total do app.

### Passo 1 — Mapear todos os arquivos fonte

Usar `glob` para encontrar todo o código fonte:

```
**/*.{tsx,ts,jsx}
```

Excluir: `node_modules`, `dist`, `build`, `*.test.*`, `*.spec.*`, `*.d.ts`

### Passo 2 — Catalogar exports de cada arquivo

Ler cada arquivo e extrair:

- **Componentes**: `export function X`, `export const X`, `export default`
- **Hooks**: funções que começam com `use`
- **Utils/Funções**: funções exportadas que não são hooks nem componentes
- **Services/Repositories**: classes ou objetos que interagem com API/banco
- **Types/Interfaces**: types compartilhados entre arquivos

### Passo 3 — Identificar duplicações

Comparar os catalogs e identificar:

- **Mesmo nome** em arquivos diferentes (ex: `Modal.tsx` em `components/` e `features/`)
- **Mesma assinatura** de função/hook (parâmetros e retorno similares)
- **Lógica similar** (mesmo padrão de implementação copiado)
- **Imports circulares** ou dependências duplicadas

### Passo 4 — Gerar relatório consolidado

```
## Auditoria Completa do Codebase

### Resumo
- Total de arquivos analisados: X
- Componentes encontrados: X
- Hooks encontrados: X
- Utils encontrados: X
- Services encontrados: X

### Duplicações Encontradas

#### 1. [Nome do Componente/Funcionalidade]
| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| src/components/Modal.tsx | Modal genérico | ~120 |
| src/features/auth/LoginModal.tsx | Modal de login | ~80 |

**Similaridade**: Alta/Média/Baixa
**Recomendação**: Centralizar em src/components/Modal.tsx

#### 2. [Próxima duplicação]
...

### Componentes Únicos (sem duplicação)

| Arquivo | Descrição |
|---------|-----------|
| src/components/Header.tsx | Header principal |
| src/hooks/useAuth.ts | Autenticação |

### Resumo de Ações Sugeridas

1. [ ] Centralizar Modal → 2 arquivos afetados
2. [ ] Unificar hooks de loading → 3 arquivos afetados
3. [ ] ...

---

Deseja que eu refatore para centralizar alguma dessas duplicações?
```

---

## Modo 2: Busca Pontual (`@staff-engineer verifique se existe X`)

Quando o usuário busca algo específico:

### Passo 1 — Busca por nomes (glob)

```
**/*{nome}*.tsx
**/*{nome}*.ts
**/*{nome}*.jsx
```

### Passo 2 — Busca por conteúdo (grep)

```
{nomeDoComponente}
"useHook"
"export.*Componente"
```

### Passo 3 — Ler e analisar

Para cada arquivo encontrado, avaliar:

- O que faz
- Como está implementado
- Tamanho e complexidade

### Passo 4 — Gerar relatório pontual

```
## Resultado: {o que foi procurado}

| # | Arquivo | Descrição | Tamanho |
|---|---------|-----------|---------|
| 1 | src/components/Modal.tsx | Modal genérico | ~120 linhas |

**Duplicação**: Sim/Não
**Recomendação**: [sugestão]

Deseja refatorar? (sim/não)
```

---

## Regras

1. **Sempre informar** onde está cada implementação encontrada
2. **Não presumir** duplicação — analisar se são realmente equivalentes
3. **Sugerir, não implementar** — refatoração é do `@frontend-engineer` ou `@backend-engineer`
4. **Ser específico** — "encontrei 3 modais" é melhor que "tem vários componentes similares"
5. **Respeitar contextos** — um Modal de auth pode ter lógica específica que justifica existir separado
6. **Apenas projeto atual** — não buscar em projetos referenciados
7. **Aplicar princípios de design** — consultar o skill `design-principles` (DRY, KISS, YAGNI, SOC) ao avaliar recomendações; código similar não é necessariamente duplicação (DRY ≠ "não repetir conceitos")
