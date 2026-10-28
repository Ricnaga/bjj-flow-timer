---
name: clean-code
description: Use when writing, reviewing, or refactoring code for naming and structure. Covers max 2 arguments, names, small functions, constants, comments, file organization. Trigger on keywords like "clean code", "code style", "max args", "arguments", "naming", "function size", "magic number", "comments".
---

# Clean Code

Regras de estilo e escrita de código para máxima legibilidade.

## Regra de argumentos: máximo 2 argumentos

Se uma função ou método precisa de **3 ou mais argumentos**, todos os dados devem ser passados como um **objeto tipado (interface/type)**.

**Por quê:**
- Melhora legibilidade: `createUser({ name, email, role })` vs `createUser(name, email, role)`
- Facilita adicionar novos campos sem quebrar chamadas existentes
- Força a definição de um contrato claro via type/interface
- Torna optional params mais claros

**Exemplo errado:**
```tsx
function createUser(name: string, email: string, role: Role, sendWelcome: boolean) {
  // ...
}

// Chamada confusa — qual é o 3º argumento?
createUser("João", "joao@email.com", "admin", true)
```

**Exemplo correto:**
```tsx
interface CreateUserInput {
  name: string
  email: string
  role: Role
  sendWelcome?: boolean
}

function createUser({ name, email, role, sendWelcome = true }: CreateUserInput) {
  // ...
}

// Chamada legível e autoexplicativa
createUser({
  name: "João",
  email: "joao@email.com",
  role: "admin",
  sendWelcome: true,
})
```

### Regra: 1-2 argumentos são aceitáveis

```tsx
// OK: 1 argumento primitivo
function formatCurrency(value: number) { /* ... */ }

// OK: 2 argumentos primitivos
function addItem(cart: Cart, item: CartItem) { /* ... */ }

// OK: 2 argumentos onde um é complexo
function processPayment(cart: Cart, options: PaymentOptions) { /* ... */ }

// ERRADO: 3+ argumentos — usar interface
function createOrder(userId: string, items: Item[], total: number, coupon?: string) { /* ❌ */ }

// CORRETO
interface CreateOrderInput {
  userId: string
  items: Item[]
  total: number
  coupon?: string
}
function createOrder({ userId, items, total, coupon }: CreateOrderInput) { /* ✅ */ }
```

## Fluxo de controle

Regras de ramificação (`if/else`, guard clauses, object/table lookup e `switch`) vivem na skill **`control-flow`**.

Resumo:
- Evite `else`; prefira **return early / guard clauses**.
- Mapeou chave → valor/ação? Use **object lookup** (`Record<Key, ...>`).
- União discriminada/enum com lógica por caso? Use **`switch`** exaustivo.
- Remova `else` após `return`/`throw`; nunca aninhe `else if`.

> Ternário no JSX (componentizar, `&&`, nunca no meio do JSX) é específico de React — ver `react-patterns`.

## Outras regras de Clean Code

- **Nomes descritivos**: variáveis e funções devem descrever o que fazem
- **Funções pequenas**: máximo ~30 linhas por função
- **Constantes > Magic numbers**: extrair valores para constantes nomeadas
- **Comentários**: só quando o "porquê" não é óbvio pelo código
- **Arquivos organizados**: uma função principal por arquivo, exports na parte superior

