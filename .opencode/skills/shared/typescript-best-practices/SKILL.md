---
name: typescript-best-practices
description: Use when writing TypeScript types, interfaces, generics, utility types, type guards, or when dealing with type errors. Trigger on keywords like "typescript", "type", "interface", "generic", "type error", "strict", "type safety", "discriminated union".
---

# TypeScript Best Practices

Referência de boas práticas para TypeScript.

## Fundamentos

### Preferir types explícitos em APIs públicas

```tsx
// ✅ Bom: tipo explícito
function createUser(data: CreateUserInput): Promise<User> {
  return db.user.create({ data })
}

// ❌ Ruim: retorno implícito
function createUser(data: any) {
  return db.user.create({ data })
}
```

### Usar `interface` para objetos, `type` para uniões e utilitários

```tsx
// Interface para shapes de objetos (extensível)
interface User {
  id: string
  name: string
  email: string
}

// Type para uniões, interseções, utilitários
type Status = 'active' | 'inactive' | 'pending'
type UserWithRole = User & { role: Role }
type PartialUser = Partial<User>
```

## Type Safety

### Evitar `any`

```tsx
// ❌ Nunca
function processData(data: any) { ... }

// ✅ Usar unknown e type guard
function processData(data: unknown) {
  if (typeof data === "string") {
    // data é string aqui
  }
}
```

### Discriminated Unions

```tsx
type Result<T> = { success: true; data: T } | { success: false; error: string }

function handleResult(result: Result<User>) {
  if (result.success) {
    // result.data é User aqui
    console.log(result.data.name)
  } else {
    // result.error é string aqui
    console.error(result.error)
  }
}
```

### Type Guards

```tsx
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

// Uso
const data = await response.json()
if (isUser(data)) {
  // data é User
}
```

## Utility Types

```tsx
// Partial - torna todas as props opcionais
type UpdateUser = Partial<User>

// Pick - seleciona props específicas
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - remove props
type CreateUser = Omit<User, 'id'>

// Record - mapeia chaves
type UserRoles = Record<string, Role>

// Extract - extrai de união
type ActiveStatus = Extract<Status, 'active'>

// Exclude - remove de união
type InactiveStatus = Exclude<Status, 'active'>
```

## Generics

```tsx
// Função genérica
function first<T>(array: T[]): T | undefined {
  return array[0]
}

// Constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// Generic com default
interface ApiResponse<T = unknown> {
  data: T
  status: number
  message: string
}
```

## Patterns

### Branded Types

```tsx
type UserId = string & { readonly __brand: "UserId" }
type OrderId = string & { readonly __brand: "OrderId" }

function createUserId(id: string): UserId {
  return id as UserId
}

// Agora não é possível confundir UserId com OrderId
function getOrder(userId: UserId, orderId: OrderId) { ... }
```

### Template Literal Types

```tsx
type Route = `/${string}`
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"
type Endpoint = `${HttpMethod} ${Route}`

function handleRequest(endpoint: Endpoint) { ... }
handleRequest("GET /api/users") // ✅
handleRequest("INVALID") // ❌ Error
```

### Const Assertions

```tsx
const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  settings: '/settings',
} as const

type Route = (typeof ROUTES)[keyof typeof ROUTES] // "/" | "/dashboard" | "/settings"
```

## Tips

- Usar `strict: true` no tsconfig
- Preferir `unknown` sobre `any` quando o tipo é realmente desconhecido
- Usar `satisfies` para validar tipos sem infere-los amplamente
- Tipar errors com `catch (error)` usando type guards
- Exportar tipos/interface que serão usados externamente
- Usar `import type` para imports que são apenas tipos
