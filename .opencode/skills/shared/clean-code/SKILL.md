---
name: clean-code
description: Use when writing, reviewing, or refactoring code. Covers max 2 arguments, return early, naming, functions small, constants, comments. Trigger on keywords like "clean code", "code style", "max args", "early return", "naming", "function size", "magic number".
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
function createUser(
  name: string,
  email: string,
  role: Role,
  sendWelcome: boolean,
) {
  // ...
}

// Chamada confusa — qual é o 3º argumento?
createUser('João', 'joao@email.com', 'admin', true)
```

**Exemplo correto:**

```tsx
interface CreateUserInput {
  name: string
  email: string
  role: Role
  sendWelcome?: boolean
}

function createUser({
  name,
  email,
  role,
  sendWelcome = true,
}: CreateUserInput) {
  // ...
}

// Chamada legível e autoexplicativa
createUser({
  name: 'João',
  email: 'joao@email.com',
  role: 'admin',
  sendWelcome: true,
})
```

### Regra: 1-2 argumentos são aceitáveis

```tsx
// OK: 1 argumento primitivo
function formatCurrency(value: number) {
  /* ... */
}

// OK: 2 argumentos primitivos
function addItem(cart: Cart, item: CartItem) {
  /* ... */
}

// OK: 2 argumentos onde um é complexo
function processPayment(cart: Cart, options: PaymentOptions) {
  /* ... */
}

// ERRADO: 3+ argumentos — usar interface
function createOrder(
  userId: string,
  items: Item[],
  total: number,
  coupon?: string,
) {
  /* ❌ */
}

// CORRETO
interface CreateOrderInput {
  userId: string
  items: Item[]
  total: number
  coupon?: string
}
function createOrder({ userId, items, total, coupon }: CreateOrderInput) {
  /* ✅ */
}
```

## Regra: sempre usar return early

Sempre optar por **return early** ao invés de `if/else` aninhado. Isso melhora legibilidade e reduz a complexidade ciclomática.

**Exemplo errado:**

```tsx
function processUser(user: User | null) {
  if (user) {
    if (user.active) {
      if (user.role === 'admin') {
        return { allowed: true }
      } else {
        return { allowed: false, reason: 'Not admin' }
      }
    } else {
      return { allowed: false, reason: 'Inactive' }
    }
  } else {
    return { allowed: false, reason: 'User not found' }
  }
}
```

**Exemplo correto:**

```tsx
function processUser(user: User | null) {
  if (!user) return { allowed: false, reason: 'User not found' }
  if (!user.active) return { allowed: false, reason: 'Inactive' }
  if (user.role !== 'admin') return { allowed: false, reason: 'Not admin' }

  return { allowed: true }
}
```

**Regra:** se a função tem mais de 2 níveis de aninhamento, reescrever com early returns.

## Outras regras de Clean Code

- **Nomes descritivos**: variáveis e funções devem descrever o que fazem
- **Funções pequenas**: máximo ~30 linhas por função
- **Constantes > Magic numbers**: extrair valores para constantes nomeadas
- **Comentários**: só quando o "porquê" não é óbvio pelo código
- **Arquivos organizados**: uma função principal por arquivo, exports na parte superior

## Regra: ternário apenas para fallback simples

Ternários devem ser usados apenas para fallbacks simples e **nunca aninhados** nem no meio do JSX.

**Nunca**:

- Ternário aninhado (3+ níveis)
- Ternário no meio do JSX — preferir componentizar + return early
- Lógica/variáveis computadas no meio do JSX

**Exemplo errado:**

```tsx
// ❌ Negativo: ternário aninhado
return isAdmin ? <AdminPanel /> : isOwner ? <OwnerPanel /> : <GuestPanel />

// ❌ Negativo: ternário no meio do JSX
return (
  <div>
    <Header />
    {isLoggedIn ? <UserMenu /> : <LoginButton />}
    <Footer />
  </div>
)

// ❌ Negativo: lógica no meio do JSX
return (
  <div>
    {items
      .filter((i) => i.active)
      .map((i) => (
        <Item key={i.id} {...i} />
      ))}
  </div>
)
```

**Exemplos corretos:**

```tsx
// ✅ Positivo: early return em vez de ternário aninhado
if (isAdmin) return <AdminPanel />
if (isOwner) return <OwnerPanel />
return <GuestPanel />

// ✅ Positivo: componentizar + return early em vez de ternário no JSX
function AppHeader() {
  if (!isLoggedIn) return <LoginButton />
  return <UserMenu />
}

// ✅ Positivo: lógica antes do return
const activeItems = items.filter((i) => i.active)
return (
  <div>
    {activeItems.map((i) => (
      <Item key={i.id} {...i} />
    ))}
  </div>
)
```

### Padrões de fallback

Preferir operadores de curto-circuito a ternários com fallback:

```tsx
// ✅ Positivo: fallback booleano
const isActive = isEnabled ?? false

// ✅ Positivo: fallback de valor
const label = displayName || 'Sem nome'

// ✅ Positivo: fallback null com && (renderização condicional)
return isVisible && <Component />
```
