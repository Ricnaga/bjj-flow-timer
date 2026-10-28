---
name: control-flow
description: Use when writing, reviewing, or refactoring conditional branching. Prefer early return/guard clauses over else, and replace long if/else chains with object/table lookup or switch. Trigger on keywords like "else", "if else", "else if", "early return", "return early", "guard clause", "object lookup", "table lookup", "mapping object", "switch", "branching", "conditional", "complexity".
---

# Control Flow — Evite `else`, prefira clareza

Regras para organizar ramificações condicionais. O objetivo é **reduzir aninhamento e complexidade ciclomática**, deixando o fluxo linear e o "caminho feliz" evidente.

> Referência de implementação e revisão, não dogma. Quando uma exceção fizer sentido (ver seção 8), documente o porquê.

## 1. Regra principal: evite `else` como padrão

Antes de escrever um `else`, considere nesta ordem:

1. **Guard clause / return early** — elimina o `else` na maioria dos casos.
2. **Object/table lookup** — quando a condição apenas mapeia chave → valor/ação.
3. **`switch`** — quando há união discriminada/enum com lógica por caso.
4. **Strategy/polimorfismo** — quando cada branch tem lógica substancial própria.

O `else` ainda é aceitável em **um único caso**: dois branches binários, simétricos, curtos e sem aninhamento (seção 8).

## 2. Guard clauses / return early

Tratar o caso de erro/inválido primeiro e sair cedo. O restante da função fica no nível principal, sem aninhamento.

```ts
// ❌ Negativo: aninhamento em pirâmide
function processUser(user: User | null) {
  if (user) {
    if (user.active) {
      if (user.role === "admin") {
        return { allowed: true }
      } else {
        return { allowed: false, reason: "Not admin" }
      }
    } else {
      return { allowed: false, reason: "Inactive" }
    }
  } else {
    return { allowed: false, reason: "User not found" }
  }
}

// ✅ Positivo: guard clauses, caminho feliz no final
function processUser(user: User | null) {
  if (!user) return { allowed: false, reason: "User not found" }
  if (!user.active) return { allowed: false, reason: "Inactive" }
  if (user.role !== "admin") return { allowed: false, reason: "Not admin" }

  return { allowed: true }
}
```

**`else` após `return`/`throw` é sempre ruído** — remova:

```ts
// ❌ Negativo: else inútil
function getRoleLabel(role: Role) {
  if (role === "admin") {
    return "Administrador"
  } else {
    return "Usuário"
  }
}

// ✅ Positivo
function getRoleLabel(role: Role) {
  if (role === "admin") return "Administrador"
  return "Usuário"
}
```

**Regra de aninhamento:** mais de 2 níveis de `if` é sinal para reescrever com guard clauses.

## 3. Object/table lookup

Quando a condição só **mapeia uma chave para um valor ou uma ação**, troque a cadeia de `if/else` por um objeto declarativo. É mais legível, tipável e fácil de estender.

### 3.1 Chave → valor

```ts
// ❌ Negativo: cadeia de else if
function getStatusColor(status: Status) {
  if (status === "idle") return "gray"
  else if (status === "loading") return "blue"
  else if (status === "success") return "green"
  else if (status === "error") return "red"
  else return "gray"
}

// ✅ Positivo: lookup tipado com fallback
const STATUS_COLOR: Record<Status, string> = {
  idle: "gray",
  loading: "blue",
  success: "green",
  error: "red",
}

function getStatusColor(status: Status) {
  return STATUS_COLOR[status] ?? "gray"
}
```

### 3.2 Chave → ação (handlers)

```ts
type Action = "create" | "update" | "delete"

// ❌ Negativo: cadeia de branches para despachar ação
function handle(action: Action, payload: Payload) {
  if (action === "create") return createItem(payload)
  else if (action === "update") return updateItem(payload)
  else return deleteItem(payload)
}

// ✅ Positivo: objeto de handlers
const HANDLERS: Record<Action, (payload: Payload) => void> = {
  create: createItem,
  update: updateItem,
  delete: deleteItem,
}

function handle(action: Action, payload: Payload) {
  return HANDLERS[action](payload)
}
```

**Fallback obrigatório quando as chaves não são exaustivas:**

```ts
const LABELS: Partial<Record<string, string>> = { admin: "Administrador" }

function getLabel(role: string) {
  return LABELS[role] ?? role
}
```

> Prefira `Record<Key, ...>` quando a união é fechada (erro em tempo de compilação se faltar chave). Use `Partial<Record<...>>` + fallback só quando a entrada é aberta.

## 4. `switch`

Use `switch` para **união discriminada/enum com lógica por caso**. Ele comunica intenção melhor que uma cadeia de `else if` e permite checagem de exaustividade.

```ts
type Action =
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; error: string }

// ✅ Positivo: switch exaustivo com guarda de compilação
function assertNever(value: never): never {
  throw new Error(`Caso não tratado: ${JSON.stringify(value)}`)
}

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "SUBMIT_START":
      return { ...state, status: "loading", error: null }
    case "SUBMIT_SUCCESS":
      return { ...state, status: "success" }
    case "SUBMIT_ERROR":
      return { ...state, status: "error", error: action.error }
    default:
      return assertNever(action)
  }
}
```

**Quando NÃO usar `switch`:**
- Se o caso só devolve valor/ação mapeado por chave → **object lookup** (mais curto).
- Se cada branch tem muita lógica própria → **strategy/polimorfismo**.

## 5. Strategy / polimorfismo

Quando cada branch tem um bloco substancial de lógica (não só um valor), extraia cada caso para uma função/objeto e despache por lookup. Elimina o `if/else` gigante e isola cada comportamento.

```ts
// ✅ Positivo: strategy por lookup de funções
const PAYMENT_STRATEGIES: Record<PaymentMethod, PaymentStrategy> = {
  card: new CardPayment(),
  pix: new PixPayment(),
  boleto: new BoletoPayment(),
}

function pay(method: PaymentMethod, amount: number) {
  return PAYMENT_STRATEGIES[method].charge(amount)
}
```

## 6. Expressões condicionais (ternário, `??`, `||`)

- **Ternário** apenas para fallback simples e de uma linha. **Nunca aninhado.**
- Para escolher entre mais de 2 opções: **object lookup** ou **early return**.
- Para default de valor: prefira `??` / `||` ao ternário.

```ts
// ❌ Negativo: ternário aninhado
const label = isAdmin ? "Admin" : isOwner ? "Owner" : "Guest"

// ✅ Positivo: object lookup
const ROLE_LABEL: Record<Role, string> = { admin: "Admin", owner: "Owner", guest: "Guest" }
const label = ROLE_LABEL[role]

// ✅ Positivo: fallback de curto-circuito
const name = user.displayName || "Sem nome"
const isEnabled = flag ?? false
```

> Regras de ternário **no JSX** (componentizar, `&&`, nunca no meio do JSX) são React-específicas — ver `react-patterns`.

## 7. Tabela de decisão

| Situação | Técnica |
|---|---|
| Pré-condição / validação / erro | Guard clause / return early |
| `else` após `return` ou `throw` | Remover o `else` |
| Mapear chave fechada → valor | `Record<Key, Value>` |
| Mapear chave aberta → valor | `Partial<Record<...>>` + fallback |
| Mapear chave → ação/handler | `Record<Key, Handler>` |
| União discriminada/enum com lógica por caso | `switch` + `assertNever` |
| Branch com lógica substancial própria | Strategy / polimorfismo |
| Escolha entre 2 valores simples | Ternário de uma linha |
| Escolha entre 3+ valores | Object lookup |
| Default de valor | `??` / `||` |

## 8. Exceção consciente

Um `if/else` simples é aceitável quando **todos** forem verdadeiros:

- Exatamente 2 branches **simétricos** (ambos igualmente esperados, não erro vs. sucesso).
- Cada branch tem **1–2 linhas**.
- **Sem aninhamento**.

```ts
// ✅ Aceitável: dois branches simétricos, curtos, sem aninhamento
if (isPreview) {
  renderPreview()
} else {
  renderFull()
}
```

Fora desse caso, prefira as técnicas acima. **Nunca** use `else`/`else if` aninhados.

## 9. Smells na revisão

- `else` imediatamente após `return`/`throw`.
- Cadeia `else if` com 3+ branches.
- `if` aninhado em 2+ níveis (pirâmide).
- `switch` repetindo só mapeamento de valor → trocar por object lookup.
- `switch` com `fallthrough` não intencional ou sem caso `default`.
- Lookup sem fallback quando o índice pode ser inválido.
- Ternário aninhado ou escolhendo entre 3+ opções.

## 10. Referências cruzadas

- **`clean-code`** — tamanho de função, argumentos, naming, constantes.
- **`react-patterns`** — ternário no JSX, `Record<Estado, Componente>`, `&&`.
- **`gof-design-patterns`** — Strategy e Factory para substituir condicionais extensos.
- **`design-principles`** — KISS/YAGNI ao escolher entre lookup, `switch` e polimorfismo.
