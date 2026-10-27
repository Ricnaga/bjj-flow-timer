---
name: frontend-testing-strategy
description: Use when writing, configuring, or debugging unit and integration tests for React components, React Native components, Next.js pages, or hooks. Covers Vitest, React Testing Library, React Native Testing Library, mocking, coverage, and test data builders. Trigger on keywords like "test", "vitest", "jest", "testing library", "rtl", "rntl", "mock", "coverage", "spec", "describe", "it", "builder", "react native test", "component test".
---

# Testing Strategy

Referência completa para testes unitários e de integração em projetos React/React Native com TypeScript.

## Setup

### Vitest (preferido)

```ts
// vitest.config.ts (web)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'test/'],
    },
  },
})
```

```ts
// vitest.config.ts (React Native)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

### React Testing Library (Web)

```ts
// test/setup.ts
import '@testing-library/jest-dom/vitest'
```

### React Native Testing Library

```bash
npm install --save-dev @testing-library/react-native
```

```ts
// test/setup.ts
import 'react-native-gesture-handler/jestSetup'
```

## Web - Component Tests

### Componente React

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from './Counter'

describe('Counter', () => {
  it('renders with initial count', () => {
    render(<Counter initialCount={0} />)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('increments on button click', () => {
    render(<Counter initialCount={0} />)
    fireEvent.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
```

### Hook customizado

```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

### Async Component

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { UserList } from './UserList'

it('loads and displays users', async () => {
  render(<UserList />)

  expect(screen.getByText('Carregando...')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText('João')).toBeInTheDocument()
  })
})
```

## React Native - Component Tests

### Componente Nativo

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Greeting } from './Greeting'

describe('Greeting', () => {
  it('renders name', () => {
    render(<Greeting name="João" />)
    expect(screen.getByText('Olá, João')).toBeTruthy()
  })
})
```

### Componente com interação

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Counter } from './Counter'

describe('Counter', () => {
  it('increments on press', () => {
    render(<Counter />)

    fireEvent.press(screen.getByText('Incrementar'))

    expect(screen.getByText('1')).toBeTruthy()
  })
})
```

### Input Controlado

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native'
import { SearchInput } from './SearchInput'

it('calls onChangeText', () => {
  const onChangeText = jest.fn()
  render(<SearchInput onChangeText={onChangeText} />)

  fireEvent.changeText(screen.getByPlaceholderText('Buscar...'), 'react')

  expect(onChangeText).toHaveBeenCalledWith('react')
})
```

### FlatList

```tsx
import { render, screen } from '@testing-library/react-native'
import { ItemList } from './ItemList'

const data = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
]

it('renders all items', () => {
  render(<ItemList data={data} />)

  expect(screen.getByText('Item 1')).toBeTruthy()
  expect(screen.getByText('Item 2')).toBeTruthy()
})
```

### Navegação (Expo Router mock)

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ProductCard } from './ProductCard'

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

it('navigates on press', () => {
  const mockPush = jest.fn()
  require('expo-router').useRouter = () => ({ push: mockPush })

  render(<ProductCard id="123" />)
  fireEvent.press(screen.getByText('Ver produto'))

  expect(mockPush).toHaveBeenCalledWith('/product/123')
})
```

## Mocking

### Mock de módulo

```ts
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))
```

### Mock de fetch

```ts
vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mocked' }),
} as Response)
```

### Mock de next/navigation

```ts
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/current-path',
}))
```

### Mock de expo-router

```ts
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: '123' }),
  usePathname: () => '/current-path',
}))
```

### Mock de módulo nativo

```ts
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  RN.Alert.alert = jest.fn()
  return RN
})
```

## Regra: Reutilização em testes — factories e mocks

Se houver lógica ou variável repetida **3 ou mais vezes** nos testes, criar uma **factory** ou **mock reutilizável**.

### Factory para dados de teste

```tsx
// ❌ Errado: dados repetidos em cada teste
it('creates user', async () => {
  const formData = new FormData()
  formData.append('name', 'João')
  formData.append('email', 'joao@email.com')
  // ...
})

// ✅ Correto: factory reutilizável
function createUserData(overrides?: Partial<CreateUserInput>): CreateUserInput {
  return {
    name: 'João',
    email: 'joao@email.com',
    role: 'admin',
    ...overrides,
  }
}

it('creates user', async () => {
  const data = createUserData()
  const result = await createUser(data)
  expect(result.success).toBe(true)
})
```

### Mock reutilizável

```tsx
// ❌ Errado: mesmo mock repetido
it('fetches users', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [{ id: '1', name: 'João' }],
  } as Response)
})

// ✅ Correto: factory de mock
function createMockResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: async () => data,
  } as Response
}

it('fetches users', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    createMockResponse([{ id: '1', name: 'João' }]),
  )
})
```

### Onde colocar as factories

- `test/factories/` — factories compartilhadas entre testes
- `__tests__/factories.ts` — factories do módulo específico
- No próprio arquivo de teste — se só é usado naquele arquivo

## Coverage

### Comando

```bash
npx vitest run --coverage
```

### Meta

- Lines: 80%+
- Branches: 75%+
- Functions: 80%+
- Priorizar coverage em features críticas

### O que testar

- Components: renderização, interações, estados
- Hooks: retorna valores corretos, atualiza estado
- Utils: entrada/saída, edge cases

### O que NÃO testar

- Tipos TypeScript (compile-time check)
- Configuração de tools (build-time)
- Código trivial (constants, re-exports)

## Test Data Builders

### Builder Base

```ts
// test/builders/user-builder.ts
class UserBuilder {
  private data: Partial<User> = {
    id: crypto.randomUUID(),
    name: 'João Silva',
    email: 'joao@test.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
  }

  withName(name: string): this {
    this.data.name = name
    return this
  }

  withEmail(email: string): this {
    this.data.email = email
    return this
  }

  asAdmin(): this {
    this.data.role = 'admin'
    return this
  }

  build(): User {
    return this.data as User
  }
}

function aUser(): UserBuilder {
  return new UserBuilder()
}
```

### Uso nos testes

```ts
it('allows admin to delete users', async () => {
  const admin = aUser().asAdmin().build()
  const target = aUser().build()

  const result = await deleteUseCase.execute({
    requester: admin,
    targetId: target.id,
  })

  expect(result.success).toBe(true)
})
```

## Test Organization

### Estrutura de Pastas (Web)

```
src/
├── components/
│   ├── Counter.tsx
│   └── __tests__/
│       └── Counter.test.tsx
├── hooks/
│   ├── useCounter.ts
│   └── __tests__/
│       └── useCounter.test.ts
└── test/
    ├── builders/
    │   └── user-builder.ts
    ├── factories/
    │   └── shared-factories.ts
    └── setup.ts
```

### Estrutura de Pastas (React Native)

```
src/
├── components/
│   ├── Greeting.tsx
│   └── __tests__/
│       └── Greeting.test.tsx
├── screens/
│   ├── HomeScreen.tsx
│   └── __tests__/
│       └── HomeScreen.test.tsx
└── test/
    ├── setup.ts
    └── factories/
```

### Naming Conventions

```
*.test.ts          → Unit tests
*.test.tsx         → Component tests (React/RN)
*.integration.ts   → Integration tests
```

## Tips

- Testar comportamento, não implementação
- Usar `screen.getByRole` (web) ou `screen.getByText` (RN) em vez de `getByTestId` quando possível
- Manter testes independentes (não depender de ordem)
- Usar `beforeEach` para setup, não `beforeAll`
- Mockar o mínimo necessário
- Preferir dados de teste realistas
- Builders > factories para dados complexos
- React Native: usar `@testing-library/react-native` (não RTL)
- React Native: testar em ambiente close ao real (não jsdom)
