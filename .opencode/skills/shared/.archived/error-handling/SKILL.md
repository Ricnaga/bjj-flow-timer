---
name: error-handling
description: Use when implementing error handling patterns, designing error hierarchies, or handling failures in applications. Covers error hierarchies (DomainError, ApplicationError, InfrastructureError), Result pattern (Success/Failure), retry patterns with exponential backoff, circuit breaker, error boundaries in React, and error logging. Trigger on keywords like "error", "error handling", "exception", "retry", "circuit breaker", "fallback", "result pattern", "throw", "catch", "boundary", "recovery", "resilience".
---

# Error Handling — Padrões de Tratamento de Erros

Referência completa de tratamento de erros em TypeScript. Aplicável a qualquer camada da arquitetura (domain, application, infrastructure).

---

## 1. Error Hierarchies

### Hierarquia de Erros

```
Error (built-in)
├── DomainError              → erros de regra de negócio
│   ├── ValidationError      → dados inválidos
│   ├── NotFoundError        → recurso não encontrado
│   ├── ConflictError        → conflito de estado
│   └── AuthenticationError  → falha de autenticação
├── ApplicationError         → erros de camada de aplicação
│   ├── UseCaseError         → falha em use case
│   └── ExternalServiceError → falha em serviço externo
└── InfrastructureError      → erros de infraestrutura
    ├── DatabaseError        → falha de banco
    ├── NetworkError         → falha de rede
    └── TimeoutError         → timeout
```

### Implementação Base

```ts
// Erro base do domínio
class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

// Erros específicos do domínio
class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown,
  ) {
    super(message, 'VALIDATION_ERROR', { field, value })
    this.name = 'ValidationError'
  }
}

class NotFoundError extends DomainError {
  constructor(entity: string, identifier: string) {
    super(`${entity} not found: ${identifier}`, 'NOT_FOUND', {
      entity,
      identifier,
    })
    this.name = 'NotFoundError'
  }
}

class ConflictError extends DomainError {
  constructor(message: string, current: string, attempted: string) {
    super(message, 'CONFLICT', { current, attempted })
    this.name = 'ConflictError'
  }
}

// Erros de infraestrutura
class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = 'InfrastructureError'
  }
}

class DatabaseError extends InfrastructureError {
  constructor(message: string, cause?: Error) {
    super(message, 'DATABASE_ERROR', cause)
    this.name = 'DatabaseError'
  }
}

class TimeoutError extends InfrastructureError {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation "${operation}" timed out after ${timeoutMs}ms`, 'TIMEOUT')
    this.name = 'TimeoutError'
  }
}
```

### Regras de Uso

- **DomainError** → o caller pode resolver (ex: dados inválidos, recurso não existe)
- **InfrastructureError** → o caller provavelmente não pode resolver (ex: banco caiu)
- **ApplicationError** → estado intermediário (ex: use case falhou por regra)
- NUNCA usar `Error` genérico — sempre o tipo mais específico
- Erros de domínio NUNCA devem vazar detalhes de infraestrutura

---

## 2. Result Pattern

Alternativa a exceptions para operações que podem falhar de forma esperada.

### Implementação

```ts
type Result<T, E = DomainError> =
  { ok: true; value: T } | { ok: false; error: E }

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

// Utility: unwrap com valor padrão
function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue
}

// Utility: map sobre o valor
function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  return result.ok ? ok(fn(result.value)) : result
}

// Utility: flatMap (encadear operações)
function flatMap<T, U>(
  result: Result<T>,
  fn: (value: T) => Result<U>,
): Result<U> {
  return result.ok ? fn(result.value) : result
}
```

### Uso no Domain

```ts
class Order {
  static create(input: CreateOrderInput): Result<Order, ValidationError> {
    if (input.items.length === 0) {
      return err(
        new ValidationError('Order must have items', 'items', input.items),
      )
    }
    if (input.total <= 0) {
      return err(
        new ValidationError('Total must be positive', 'total', input.total),
      )
    }

    return ok(new Order(crypto.randomUUID(), input.customerId, input.items))
  }

  pay(paymentMethod: string): Result<void, ConflictError> {
    if (this._status !== 'pending') {
      return err(
        new ConflictError(
          'Cannot pay order in current status',
          this._status,
          'paid',
        ),
      )
    }
    this._status = 'paid'
    return ok(undefined)
  }
}
```

### Uso em Services

```ts
class CreateOrderUseCase {
  async execute(
    input: CreateOrderInput,
  ): Promise<Result<Order, ApplicationError>> {
    // 1. Criar aggregate
    const orderResult = Order.create(input)
    if (!orderResult.ok) return orderResult // propagar erro de validação

    // 2. Verificar estoque
    const stockResult = await this.stockService.checkStock(input.items)
    if (!stockResult.ok) return stockResult

    // 3. Salvar
    try {
      await this.orderRepository.save(orderResult.value)
    } catch (error) {
      return err(new DatabaseError('Failed to save order', error as Error))
    }

    return ok(orderResult.value)
  }
}
```

### Quando Usar Result vs Exceptions

| Cenário                     | Usar        | Por quê                       |
| --------------------------- | ----------- | ----------------------------- |
| Dados inválidos do usuário  | `Result`    | Esperado, caller deve tratar  |
| Recurso não encontrado      | `Result`    | Esperado, caller deve decidir |
| Banco de dados indisponível | `Exception` | Inesperado, deve propagar     |
| Timeout de rede             | `Exception` | Inesperado, deve propagar     |
| Regra de negócio violada    | `Result`    | Esperado no fluxo             |
| Autenticação falhou         | `Result`    | Caller deve tratar            |

**Regra geral:** se o caller pode resolver o erro de forma programática → `Result`. Se é uma falha que deve interromper o fluxo → `Exception`.

---

## 3. Retry Patterns

### Exponential Backoff

```ts
interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitter: boolean
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30_000,
  backoffMultiplier: 2,
  jitter: true,
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === opts.maxRetries) break

      const delay = calculateDelay(attempt, opts)
      await sleep(delay)
    }
  }

  throw lastError
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay =
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt)
  delay = Math.min(delay, config.maxDelayMs)

  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5)
  }

  return delay
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

### Retry com Condição

```ts
// Retry apenas para erros específicos
async function withConditionalRetry<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === opts.maxRetries || !shouldRetry(lastError)) break

      const delay = calculateDelay(attempt, opts)
      await sleep(delay)
    }
  }

  throw lastError
}

// Uso: retry apenas para erros de rede
await withConditionalRetry(
  () => fetch('https://api.example.com/data'),
  (error) => error instanceof NetworkError || error instanceof TimeoutError,
  { maxRetries: 3 },
)
```

### Retry para LLM Calls

```ts
async function callLLMWithRetry(
  messages: ChatMessage[],
  config: Partial<RetryConfig> = {},
): Promise<string> {
  return withConditionalRetry(
    async () => {
      const response = await llm.chat(messages)
      return response.content
    },
    (error) => {
      // Retry para rate limit e timeouts, NÃO para erros de conteúdo
      return (
        error.message.includes('rate_limit') ||
        error.message.includes('timeout') ||
        error.message.includes('529') // overloaded
      )
    },
    {
      maxRetries: 3,
      initialDelayMs: 2000,
      backoffMultiplier: 3, // LLM rate limits precisam de backoff mais agressivo
    },
  )
}
```

---

## 4. Circuit Breaker

### Estados

```
         sucesso
    ┌──────────────┐
    │              ▼
┌────────┐    ┌────────┐    ┌────────────┐
│ CLOSED │───▶│  OPEN  │───▶│ HALF-OPEN  │
└────────┘    └────────┘    └────────────┘
    ▲              ▲              │
    │   falhas     │   timeout    │
    └──────────────└──────────────┘
```

### Implementação

```ts
type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerConfig {
  failureThreshold: number // falhas para abrir
  successThreshold: number // sucessos para fechar (half-open)
  timeoutMs: number // tempo para transição open → half-open
}

class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.config.timeoutMs) {
        this.state = 'half-open'
        this.successCount = 0
      } else {
        throw new InfrastructureError('Circuit breaker is OPEN', 'CIRCUIT_OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'closed'
        this.failureCount = 0
      }
    } else {
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === 'half-open') {
      this.state = 'open'
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open'
    }
  }

  getState(): CircuitState {
    return this.state
  }
}
```

### Uso

```ts
const llmCircuit = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60_000, // 1 minuto
})

async function callLLM(messages: ChatMessage[]): Promise<string> {
  return llmCircuit.execute(async () => {
    const response = await llm.chat(messages)
    return response.content
  })
}
```

---

## 5. Error Boundaries (React)

### Componente de Erro

```tsx
import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
    // Logar erro para serviço de monitoramento
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-boundary">
            <h2>Algo deu errado</h2>
            <p>{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Tentar novamente
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}

// Uso
function App() {
  return (
    <ErrorBoundary
      fallback={<div>Erro na aplicação</div>}
      onError={(error, info) => reportError(error, info)}
    >
      <Router />
    </ErrorBoundary>
  )
}
```

### Hook de Erro

```tsx
function useAsyncError() {
  const [, setError] = useState()

  return useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
```

---

## 6. Logging e Categorização

### Estrutura de Log de Erro

```ts
interface ErrorLog {
  timestamp: string
  level: 'error' | 'warn'
  error: {
    name: string
    message: string
    code: string
    stack?: string
    cause?: string
  }
  context: {
    userId?: string
    requestId?: string
    operation: string
    input?: Record<string, unknown>
  }
  metadata?: Record<string, unknown>
}

function logError(error: Error, context: ErrorContext): ErrorLog {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: isErrorRetryable(error) ? 'warn' : 'error',
    error: {
      name: error.name,
      message: error.message,
      code: getErrorCode(error),
      stack: error.stack,
      cause: error.cause instanceof Error ? error.cause.message : undefined,
    },
    context,
  }

  console.error(JSON.stringify(log))
  return log
}

function isErrorRetryable(error: Error): boolean {
  if (error instanceof InfrastructureError) {
    return ['TIMEOUT', 'NETWORK_ERROR'].includes(error.code)
  }
  return false
}

function getErrorCode(error: Error): string {
  if ('code' in error) return (error as { code: string }).code
  return 'UNKNOWN'
}
```

### Error Categorization

```ts
// Categorizar erros para métricas e alertas
function categorizeError(error: Error): ErrorCategory {
  if (error instanceof ValidationError) return 'client_error'
  if (error instanceof NotFoundError) return 'client_error'
  if (error instanceof ConflictError) return 'client_error'
  if (error instanceof AuthenticationError) return 'client_error'
  if (error instanceof DatabaseError) return 'server_error'
  if (error instanceof NetworkError) return 'server_error'
  if (error instanceof TimeoutError) return 'server_error'
  return 'unknown'
}

// Métricas por categoria
// client_error → 4xx, não alertar
// server_error → 5xx, alertar
// unknown → investigar
```

---

## Regras

1. **Sempre o tipo mais específico** — nunca lançar `Error` genérico
2. **Result para erros esperados** — dados inválidos, recursos não encontrados
3. **Exception para falhas inesperadas** — infraestrutura, timeouts, erros de sistema
4. **Retry com backoff** — para erros transitórios (rede, rate limit)
5. **Circuit breaker** — para chamadas a serviços externos (LLM, APIs)
6. **Error boundaries** — em todo componente React que renderiza dados
7. **NUNCA silenciar erros** — toda exceção deve ser logada
8. **Categorizar erros** — client_error vs server_error para métricas
9. **Error hierarchies** — DomainError > ApplicationError > InfrastructureError
10. **Cleanup em erros** — rollback, liberação de recursos, notificação
