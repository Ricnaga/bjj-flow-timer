---
name: frontend-patterns
description: Use when building OR reviewing frontend interfaces regardless of framework. Covers UI Kit and Design System usage, visual consistency, semantic HTML, accessibility, and responsive design. For design decisions (tokens, wireframes, prototypes) use designer-ux-ui instead. Trigger on keywords like "ui", "interface", "frontend", "uikit", "ui kit", "semantic html", "accessibility", "a11y", "responsive", "mobile first", "visual consistency", "audit", "review", "html", "wcag".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: frontend
  mode: implementation-review
---

# Frontend Patterns — Interfaces Web/Mobile

Referência de padrões gerais de construção de interfaces frontend, **independente de framework** (React, Next.js, React Native, etc.).

> Esta skill é uma referência de implementação e revisão, **não um conjunto de regras absolutas**. Use o bom senso contextual; quando um critério conflitar com o contexto real, documente a decisão.

## 1. Objetivo

Definir padrões gerais de construção de interfaces frontend: consistência visual, uso correto de UI Kit / Design System, HTML semântico, acessibilidade e responsividade — em qualquer plataforma (web e mobile).

## 2. Agentes autorizados

| Agente              | Papel                                                        |
| ------------------- | ------------------------------------------------------------ |
| `frontend-engineer` | Consulta durante desenvolvimento e refatoração de interfaces |
| `staff-engineer`    | Consulta durante auditorias e revisões de UI                 |

> **Acesso**: por contexto (trigger no `description`) — não há bloqueio por permissão. A pasta em que a skill vive indica **ownership** (quem a mantém), não audience. Agent fora do domínio deve delegar ao dono.

## 3. Quando consultar

- **Desenvolvimento (frontend-engineer):** ao construir telas, componentes visuais ou integrar com UI Kit / Design System.
- **Revisão (staff-engineer):** auditorias de UI, revisões de PRs com impacto visual/estrutural, validação de acessibilidade e responsividade.

## 4. Regras

### 4.1 UI Kit / Design System primeiro

Se existir um componente no UI Kit ou Design System do projeto, **priorizá-lo** antes de criar um componente próprio.

- ✅ Usar o componente do kit quando existir equivalente.
- ✅ Estender o componente do kit (composition / variantes) quando a customização for pontual.
- ❌ Não reimplementar um componente do kit sem justificativa técnica registrada.
- ❌ Não usar HTML puro (ex: `<button>`, `<input>`, `<select>` cru) quando existe componente equivalente no kit com acessibilidade e estilos já tratados.

### 4.2 Consistência visual

- ✅ Usar **design tokens** (cores, espaçamento, tipografia, elevação, raio) — nunca valores soltos.
- ✅ Reutilizar espaçamento e escala do design system; evitar números mágicos.
- ✅ Seguir o padrão visual existente nas telas vizinhas.
- ❌ Não introduzir cor, fonte ou espaçamento fora do token/scale do projeto.

### 4.3 HTML semântico

Usar elementos semânticos conforme o propósito — e nunca substituí-los por `div` sem necessidade.

- ✅ `header`, `main`, `nav`, `section`, `article`, `aside`, `footer` para landmarks/estrutura.
- ✅ `button` para ações, `a` para navegação, `label` para campos, `ul/ol/li` para listas, `table` para dados tabulares.
- ✅ `<h1>–<h6>` para hierarquia de títulos.
- ❌ Não usar `div` com `onClick` no lugar de `button`/`a` (perde foco e acessibilidade de teclado).
- ❌ Não fazer "div soup": `div` dentro de `div` para expressar estrutura que tem elemento semântico próprio.

### 4.4 Acessibilidade (a11y)

- ✅ Todo campo de formulário com `<label>` associado.
- ✅ Elementos interativos alcançáveis e operáveis por teclado.
- ✅ Contraste suficiente (baseline WCAG AA).
- ✅ `aria-*` quando o elemento nativo não cobre a semântica necessária (ex: `aria-expanded`, `role="alert"`).
- ✅ Estados de foco visíveis.
- ❌ Não depender de cor como único indicador de estado/erro.
- ❌ Não usar `aria-label` para substituir texto visível quando o texto visível existe.

### 4.5 Responsividade

- ✅ Mobile-first: desenhar/construir para a menor viewport e escalar.
- ✅ Breakpoints e grids fluidas do design system; evitar media queries ad-hoc.
- ✅ Touch targets adequados (≥ 44×44px no mobile, quando aplicável).
- ✅ Texto e layout não quebram em larguras extremas (viewport pequeno/amplo).
- ❌ Não fixar larguras que não escalam (`width: 900px` etc.) sem necessidade.
- ❌ Não assumir que desktop é o único contexto.

### 4.6 Web vs Mobile

- ✅ Considerar as diferenças entre plataformas: input (mouse/teclado vs toque), densidade, navegação, hover vs long-press.
- ✅ Quando a experiência exigir, usar componentes específicos por plataforma (platform-specific code em React Native; componentes dedicados web/mobile).
- ❌ Não forçar compartilhamento de um componente quando isso prejudicar a experiência da plataforma.
- ⚠️ Compartilhar lógica/tokens sim; compartilhar componente visual, **só se** a interação e a densidade forem compatíveis.

## 5. Critérios de Decisão

Tabela condição → ação. Referência, não regra absoluta:

| Condição observada                                    | Ação sugerida                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Existe componente equivalente no UI Kit/Design System | Usar o do kit; estender via composição se pontual                            |
| Componente próprio em vez do kit                      | Justificar tecnicamente (gap do kit, esforço) e alinhar com `designer-ux-ui` |
| HTML puro onde existe componente do kit               | Substituir pelo componente do kit                                            |
| Elemento semântico substituído por `div` sem motivo   | Restaurar o elemento semântico                                               |
| Valor visual fora do token/scale                      | Substituir pelo token/scale do design system                                 |
| Interativo sem suporte de teclado/foco                | Usar elemento/role adequado e garantir foco                                  |
| Componente compartilhado web/mobile com UX divergente | Não forçar; usar component por plataforma (compartilhar lógica)              |
| Interface sem considerar viewport pequena             | Aplicar mobile-first e grid do design system                                 |

## 6. Exemplos Positivos

- Usar `<Button variant="primary">` do UI Kit em vez de `<button className="...">` cru.
- Estrutura com `nav`/`main`/`footer` e listas com `ul/ol/li`.
- Input com `<label htmlFor>` associado e estado de erro textual + ícone (não só cor).
- Layout mobile-first com grid do design system e touch targets adequados.
- Formulário com componente do kit específico da plataforma no mobile (ex: picker nativo) e equivalente web.

## 7. Exemplos Negativos

- `<div onClick={...}>` no lugar de `<button>` (perde teclado e foco).
- "Div soup" para estrutura que deveria usar `section`/`article`/`table`.
- Valores soltos de cor/espaçamento fora dos tokens.
- Erro indicado somente por cor.
- Largura fixa que quebra em viewport pequena.
- Componente web compartilhado no mobile forçando UX de hover/desktop.

## 8. Referências cruzadas

- **`react-patterns`** — padrões de componentes React (composição, hooks, estado, renderização).
- **`designer-ux-ui`** — design tokens, design system e decisões visuais (consultar o agent `designer-ux-ui` ao criar telas).
- **`react-native-patterns`** — padrões específicos de plataforma mobile.
- **`staff-engineer/code-review-checklist`** — checklist genérico de revisão (cross-cutting, inclui a11y).
