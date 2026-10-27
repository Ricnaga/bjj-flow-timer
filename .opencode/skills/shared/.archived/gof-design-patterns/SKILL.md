---
name: gof-design-patterns
description: Use when implementing or refactoring code to apply Gang of Four (GOF) design patterns. Covers creational, structural, and behavioral patterns with TypeScript examples. Trigger on keywords like "design pattern", "gof", "factory", "strategy", "observer", "singleton", "adapter", "decorator", "builder", "pattern".
---

# Gang of Four (GOF) Design Patterns

Referência completa dos 23 padrões clássicos do GOF com exemplos em TypeScript.

## Regra Geral

Se houver possibilidade de implementar um design pattern que resolva o problema de forma clara e elegante, **implemente**. Prefira patterns quando:

- O código apresenta code smells que o pattern resolve naturalmente
- O pattern melhora legibilidade e manutenção
- Não viola YAGNI (o pattern é necessário agora, não no futuro)

## Creational Patterns

### Singleton

**Quando usar:** Quando uma instância global é necessária (config, connection pool, logger).

```ts
class Database {
  private static instance: Database | null = null

  private constructor(private readonly config: DbConfig) {}

  static getInstance(config?: DbConfig): Database {
    if (!Database.instance) {
      if (!config) throw new Error('Config required on first call')
      Database.instance = new Database(config)
    }
    return Database.instance
  }

  async query<T>(sql: string): Promise<T> {
    // ...
  }
}

const db = Database.getInstance({ url: '...' })
```

### Factory Method

**Quando usar:** Quando o tipo de objeto a ser criado é determinado em runtime.

```ts
interface Notification {
  send(message: string): Promise<void>
}

class EmailNotification implements Notification {
  async send(message: string) {
    /* SMTP */
  }
}

class PushNotification implements Notification {
  async send(message: string) {
    /* Firebase */
  }
}

class NotificationFactory {
  static create(type: 'email' | 'push'): Notification {
    switch (type) {
      case 'email':
        return new EmailNotification()
      case 'push':
        return new PushNotification()
    }
  }
}

const notifier = NotificationFactory.create('email')
await notifier.send('Olá!')
```

### Abstract Factory

**Quando usar:** Quando o sistema precisa de famílias de objetos relacionados.

```ts
interface UIFactory {
  createButton(): Button
  createInput(): Input
}

class MaterialUIFactory implements UIFactory {
  createButton() {
    return new MaterialButton()
  }
  createInput() {
    return new MaterialInput()
  }
}

class ChakraUIFactory implements UIFactory {
  createButton() {
    return new ChakraButton()
  }
  createInput() {
    return new ChakraInput()
  }
}

function buildForm(factory: UIFactory) {
  const button = factory.createButton()
  const input = factory.createInput()
  // ...
}
```

### Builder

**Quando usar:** Quando a construção de um objeto complexo requer múltiplos passos.

```ts
class QueryBuilder {
  private table = ''
  private conditions: string[] = []
  private orderBy = ''
  private limit: number | null = null

  static create(table: string): QueryBuilder {
    const builder = new QueryBuilder()
    builder.table = table
    return builder
  }

  where(condition: string): this {
    this.conditions.push(condition)
    return this
  }

  order(field: string, dir: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderBy = `${field} ${dir}`
    return this
  }

  take(n: number): this {
    this.limit = n
    return this
  }

  build(): string {
    let sql = `SELECT * FROM ${this.table}`
    if (this.conditions.length) sql += ` WHERE ${this.conditions.join(' AND ')}`
    if (this.orderBy) sql += ` ORDER BY ${this.orderBy}`
    if (this.limit) sql += ` LIMIT ${this.limit}`
    return sql
  }
}

const query = QueryBuilder.create('users')
  .where('active = true')
  .order('createdAt', 'DESC')
  .take(10)
  .build()
```

### Prototype

**Quando usar:** Quando criar objetos do zero é custoso e é mais eficiente clonar existentes.

```ts
interface Clonable<T> {
  clone(): T
}

class UserTemplate implements Clonable<UserTemplate> {
  constructor(
    public name: string,
    public role: Role,
    public permissions: string[],
  ) {}

  clone(): UserTemplate {
    return new UserTemplate(this.name, this.role, [...this.permissions])
  }
}

const adminTemplate = new UserTemplate('Admin', 'admin', [
  'read',
  'write',
  'delete',
])
const newAdmin = adminTemplate.clone()
newAdmin.name = 'Novo Admin'
```

## Structural Patterns

### Adapter

**Quando usar:** Quando precisa integrar interfaces incompatíveis.

```ts
// API legada retorna XML
class LegacyUserAPI {
  async getUserXML(id: string): Promise<string> {
    return `<user><id>${id}</id><name>João</name></user>`
  }
}

// Interface moderna
interface UserResponse {
  id: string
  name: string
}

class UserAdapter {
  constructor(private readonly legacyAPI: LegacyUserAPI) {}

  async getUser(id: string): Promise<UserResponse> {
    const xml = await this.legacyAPI.getUserXML(id)
    return this.parseXML(xml)
  }

  private parseXML(xml: string): UserResponse {
    // parsing...
    return { id: '1', name: 'João' }
  }
}
```

### Decorator

**Quando usar:** Quando precisa adicionar comportamentos dinamicamente.

```ts
interface HttpClient {
  fetch(url: string, options?: RequestInit): Promise<Response>
}

class BaseHttpClient implements HttpClient {
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    return globalThis.fetch(url, options)
  }
}

class LoggingHttpClient implements HttpClient {
  constructor(private readonly inner: HttpClient) {}

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    console.log(`→ ${options?.method ?? 'GET'} ${url}`)
    const start = Date.now()
    const response = await this.inner.fetch(url, options)
    console.log(`← ${response.status} (${Date.now() - start}ms)`)
    return response
  }
}

class AuthHttpClient implements HttpClient {
  constructor(
    private readonly inner: HttpClient,
    private readonly token: string,
  ) {}

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    return this.inner.fetch(url, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${this.token}` },
    })
  }
}

// Composição: Auth → Logging → Base
const client = new AuthHttpClient(
  new LoggingHttpClient(new BaseHttpClient()),
  'my-token',
)
```

### Facade

**Quando usar:** Quando precisa simplificar uma interface complexa.

```ts
class OrderFacade {
  constructor(
    private readonly inventory: InventoryService,
    private readonly payment: PaymentService,
    private readonly shipping: ShippingService,
    private readonly notification: NotificationService,
  ) {}

  async placeOrder(input: PlaceOrderInput): Promise<OrderResult> {
    const available = await this.inventory.check(input.items)
    if (!available) throw new Error('Out of stock')

    const paymentResult = await this.payment.charge(
      input.total,
      input.paymentMethod,
    )
    if (!paymentResult.success) throw new Error('Payment failed')

    const shipment = await this.shipping.create(input.address, input.items)

    await this.notification.send(
      input.email,
      `Pedido #${shipment.id} confirmado`,
    )

    return { orderId: shipment.id, status: 'confirmed' }
  }
}
```

### Proxy

**Quando usar:** Quando precisa controlar acesso, caching, ou lazy loading.

```ts
interface UserRepository {
  findById(id: string): Promise<User | null>
}

class CachingUserProxy implements UserRepository {
  private cache = new Map<string, User>()

  constructor(private readonly real: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    const cached = this.cache.get(id)
    if (cached) return cached

    const user = await this.real.findById(id)
    if (user) this.cache.set(id, user)
    return user
  }
}
```

## Behavioral Patterns

### Strategy

**Quando usar:** Quando múltiplos algoritmos podem ser trocados em runtime.

```ts
interface SortStrategy<T> {
  sort(items: T[], compareFn: (a: T, b: T) => number): T[]
}

class QuickSort<T> implements SortStrategy<T> {
  sort(items: T[], compareFn: (a: T, b: T) => number): T[] {
    // implementação quick sort
    return items
  }
}

class BubbleSort<T> implements SortStrategy<T> {
  sort(items: T[], compareFn: (a: T, b: T) => number): T[] {
    // implementação bubble sort
    return items
  }
}

class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>) {
    this.strategy = strategy
  }

  sort(items: T[], compareFn: (a: T, b: T) => number): T[] {
    return this.strategy.sort(items, compareFn)
  }
}

const sorter = new Sorter(new QuickSort<number>())
sorter.setStrategy(new BubbleSort<number>())
```

### Observer

**Quando usar:** Quando múltiplos objetos precisam reagir a mudanças de um evento.

```ts
type EventHandler<T> = (data: T) => void

class EventEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<string, Set<EventHandler<any>>>()

  on<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>,
  ): () => void {
    if (!this.handlers.has(event as string)) {
      this.handlers.set(event as string, new Set())
    }
    this.handlers.get(event as string)!.add(handler)
    return () => this.handlers.get(event as string)?.delete(handler)
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.handlers.get(event as string)?.forEach((handler) => handler(data))
  }
}

interface OrderEvents {
  created: { orderId: string; total: number }
  paid: { orderId: string; method: string }
  shipped: { orderId: string; tracking: string }
}

const orderEvents = new EventEmitter<OrderEvents>()

orderEvents.on('created', (data) => {
  console.log(`Pedido ${data.orderId} criado - R$ ${data.total}`)
})

orderEvents.emit('created', { orderId: '123', total: 150 })
```

### Command

**Quando usar:** Quando precisa desacoplar a execução de uma ação de quem a invoca.

```ts
interface Command {
  execute(): Promise<void>
  undo(): Promise<void>
}

class UpdateEmailCommand implements Command {
  private previousEmail = ''

  constructor(
    private readonly userId: string,
    private readonly newEmail: string,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(): Promise<void> {
    const user = await this.userRepo.findById(this.userId)
    if (!user) throw new Error('User not found')
    this.previousEmail = user.email
    user.email = this.newEmail
    await this.userRepo.save(user)
  }

  async undo(): Promise<void> {
    const user = await this.userRepo.findById(this.userId)
    if (!user) throw new Error('User not found')
    user.email = this.previousEmail
    await this.userRepo.save(user)
  }
}

// Command queue
class CommandHistory {
  private history: Command[] = []

  async execute(command: Command): Promise<void> {
    await command.execute()
    this.history.push(command)
  }

  async undo(): Promise<void> {
    const command = this.history.pop()
    if (command) await command.undo()
  }
}
```

### Chain of Responsibility

**Quando usar:** Quando múltiplos handlers podem processar uma requisição.

```ts
abstract class Middleware {
  private next: Middleware | null = null

  use(middleware: Middleware): Middleware {
    this.next = middleware
    return middleware
  }

  async handle(request: Request): Promise<Response | null> {
    const result = await this.process(request)
    if (result) return result
    if (this.next) return this.next.handle(request)
    return null
  }

  protected abstract process(request: Request): Promise<Response | null>
}

class AuthMiddleware extends Middleware {
  protected async process(request: Request): Promise<Response | null> {
    if (!request.headers.authorization) {
      return new Response('Unauthorized', { status: 401 })
    }
    return null // passa pro próximo
  }
}

class RateLimitMiddleware extends Middleware {
  protected async process(request: Request): Promise<Response | null> {
    // check rate limit
    return null
  }
}

const auth = new AuthMiddleware()
auth.use(new RateLimitMiddleware())
```

### State

**Quando usar:** Quando um objeto muda comportamento dependendo do seu estado.

```ts
interface OrderState {
  pay(order: Order): void
  ship(order: Order): void
  deliver(order: Order): void
}

class PendingState implements OrderState {
  pay(order: Order) {
    order.setState(new PaidState())
  }
  ship() {
    throw new Error('Cannot ship unpaid order')
  }
  deliver() {
    throw new Error('Cannot deliver unpaid order')
  }
}

class PaidState implements OrderState {
  pay() {
    throw new Error('Order already paid')
  }
  ship(order: Order) {
    order.setState(new ShippedState())
  }
  deliver() {
    throw new Error('Cannot deliver unshipped order')
  }
}

class ShippedState implements OrderState {
  pay() {
    throw new Error('Order already paid')
  }
  ship() {
    throw new Error('Order already shipped')
  }
  deliver(order: Order) {
    order.setState(new DeliveredState())
  }
}

class Order {
  private state: OrderState = new PendingState()

  setState(state: OrderState) {
    this.state = state
  }
  pay() {
    this.state.pay(this)
  }
  ship() {
    this.state.ship(this)
  }
  deliver() {
    this.state.deliver(this)
  }
}
```

### Template Method

**Quando usar:** Quando o esqueleto de um algoritmo é fixo mas passos variam.

```ts
abstract class DataExporter {
  // Template method
  async export(data: unknown[]): Promise<string> {
    const validated = this.validate(data)
    const formatted = this.format(validated)
    const compressed = this.compress(formatted)
    return compressed
  }

  protected validate(data: unknown[]): unknown[] {
    return data.filter((item) => item !== null)
  }

  protected abstract format(data: unknown[]): string
  protected abstract compress(data: string): string
}

class CSVExporter extends DataExporter {
  protected format(data: unknown[]): string {
    return data.map((row) => Object.values(row as object).join(',')).join('\n')
  }

  protected compress(data: string): string {
    return data // CSV não comprime
  }
}

class JSONExporter extends DataExporter {
  protected format(data: unknown[]): string {
    return JSON.stringify(data)
  }

  protected compress(data: string): string {
    return `compressed:${data}` // stub
  }
}
```

### Iterator

**Quando usar:** Quando precisa percorrer uma coleção sem expor sua estrutura interna.

```ts
class Tree<T> {
  constructor(private readonly root: TreeNode<T> | null) {}

  [Symbol.iterator](): Iterator<T> {
    const stack: TreeNode<T>[] = this.root ? [this.root] : []
    return {
      next(): IteratorResult<T> {
        const node = stack.pop()
        if (!node) return { done: true, value: undefined }
        if (node.right) stack.push(node.right)
        if (node.left) stack.push(node.left)
        return { done: false, value: node.value }
      },
    }
  }
}

const tree = new Tree({ value: 1, left: { value: 2 }, right: { value: 3 } })
for (const value of tree) {
  console.log(value) // 1, 2, 3
}
```
