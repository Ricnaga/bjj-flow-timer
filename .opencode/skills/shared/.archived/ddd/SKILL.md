---
name: ddd
description: Use when modeling business domains with Domain-Driven Design. Covers strategic patterns (bounded contexts, context maps, ubiquitous language) and tactical patterns (entities, value objects, aggregates, domain events, domain services). Trigger on keywords like "ddd", "domain", "bounded context", "aggregate", "entity", "value object", "domain event", "ubiquitous language", "subdomain", "anti-corruption layer".
---

# Domain-Driven Design (DDD)

Referência completa de Domain-Driven Design com exemplos em TypeScript.

## Strategic Design

### Ubiquitous Language

Linguagem compartilhada entre desenvolvedores e especialistas de domínio. Todo conceito do negócio tem um nome único e preciso.

```ts
// ❌ Errado: linguagem técnica genérica
class DataProcessor {
  process(input: Record<string, unknown>): Record<string, unknown> {
    // ...
  }
}

// ✅ Correto: linguagem do domínio
class OrderPlacement {
  placeOrder(customer: Customer, items: OrderItem[]): Order {
    // ...
  }
}
```

**Regras:**

- Nomes de classes e métodos devem refletir o vocabulário do negócio
- Evitar nomes genéricos (Data, Manager, Handler, Processor)
- Documentar glossário do domínio no README ou wiki

### Bounded Contexts

Cada bounded context é um mini-universo com sua própria linguagem, modelos e regras.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Catalog        │    │   Order          │    │   Shipping       │
│                  │    │                  │    │                  │
│  Product         │    │  Order           │    │  Shipment        │
│  Category        │    │  OrderItem       │    │  Tracking        │
│  Price           │    │  Customer        │    │  Carrier         │
│                  │    │                  │    │                  │
│  "Product" tem   │    │  "Product" é     │    │  "Package" é     │
│  nome, preço,    │    │  apenas SKU +    │    │  o que é         │
│  descrição       │    │  quantidade      │    │  despachado      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Como identificar bounded contexts:**

- Equipes diferentes trabalham em áreas diferentes
- O mesmo termo significa coisas diferentes (Product no catálogo ≠ Product no pedido)
- Mudanças em um contexto não afetam outro

### Context Maps

Relações entre bounded contexts:

| Padrão                    | Descrição                               | Quando usar                                        |
| ------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Shared Kernel**         | Dois contextos compartilham um modelo   | Modelos parcialmente sobrepostos, equipes próximas |
| **Customer-Supplier**     | Um context fornece dados para outro     | Relação client-provider entre contextos            |
| **Conformist**            | Um context se adapta ao modelo do outro | API externa que não controlamos                    |
| **Anti-Corruption Layer** | Camada de tradução entre contextos      | Integrar com sistema legado                        |
| **Open Host Service**     | API pública para múltiplos consumidores | Serviço que atende vários clientes                 |
| **Published Language**    | Linguagem compartilhada (JSON, events)  | Comunicação assíncrona entre contextos             |

```ts
// Anti-Corruption Layer — traduzindo modelo legado
class LegacyOrderAdapter {
  toDomain(legacyOrder: LegacyOrderDTO): Order {
    return Order.create({
      id: legacyOrder.ORD_NUM,
      customer: Customer.create({ name: legacyOrder.CUST_NM }),
      total: Money.create(legacyOrder.TOT_AMT, 'BRL'),
      items: legacyOrder.ITEMS.map((item) =>
        OrderItem.create({
          productId: item.ITM_CD,
          quantity: item.QTY,
          price: Money.create(item.UNIT_PR, 'BRL'),
        }),
      ),
    })
  }
}
```

### Subdomains

| Tipo           | Descrição                          | Estratégia                    |
| -------------- | ---------------------------------- | ----------------------------- |
| **Core**       | Diferencial competitivo do negócio | Investir, equipe dedicada     |
| **Supporting** | Suporte ao core (ex: billing)      | Implementar, mas não exagerar |
| **Generic**    | Commodity (ex: email, auth)        | Comprar ou usar SaaS          |

---

## Tactical Design

### Entities

Objetos com identidade única que persistem ao longo do tempo.

```ts
class User {
  constructor(
    public readonly id: string,
    private _name: string,
    private _email: Email,
    private _role: Role,
  ) {}

  // Identidade: dois Users com mesmo id são o mesmo User
  equals(other: User): boolean {
    return this.id === other.id
  }

  // Comportamento de negócio
  promote(): void {
    if (this._role === 'admin') {
      throw new DomainError('User is already admin')
    }
    this._role = 'admin'
  }

  get name(): string {
    return this._name
  }
  get email(): Email {
    return this._email
  }
  get role(): Role {
    return this._role
  }
}
```

**Regras:**

- Entidades têm identidade (id) e ciclo de vida
- Dois objetos com mesmo id mas dados diferentes são o mesmo objeto
- Entidades podem ter comportamento (métodos de negócio)

### Value Objects

Objetos imutáveis identificados por seus atributos, não por id.

```ts
class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    if (!raw.includes('@')) {
      throw new DomainError('Invalid email')
    }
    return new Email(raw.toLowerCase())
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}

class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) throw new DomainError('Amount cannot be negative')
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add different currencies')
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }
}
```

**Regras:**

- Imutáveis (readonly, sem setters)
- Igualdade estrutural (dois Emails com mesmo valor são iguais)
- Auto-validam no construtor
- Podem ter comportamento (add, subtract) mas nunca mutam estado

### Aggregates

Grupo de entidades e value objects com uma raiz (aggregate root) que garante consistência.

```ts
class Order {
  private _items: OrderItem[] = []
  private _status: OrderStatus = 'pending'

  constructor(
    public readonly id: string,
    public readonly customerId: string,
  ) {}

  addItem(product: Product, quantity: number): void {
    if (this._status !== 'pending') {
      throw new DomainError('Can only add items to pending orders')
    }
    if (quantity <= 0) {
      throw new DomainError('Quantity must be positive')
    }

    const existing = this._items.find((i) => i.productId === product.id)
    if (existing) {
      existing.increaseQuantity(quantity)
    } else {
      this._items.push(OrderItem.create(product, quantity))
    }
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.create(0, 'BRL'),
    )
  }

  get items(): ReadonlyArray<OrderItem> {
    return [...this._items]
  }
}

// Order é o aggregate root — OrderItem só existe dentro de Order
class OrderItem {
  private constructor(
    public readonly productId: string,
    private _quantity: number,
    public readonly price: Money,
  ) {}

  static create(product: Product, quantity: number): OrderItem {
    return new OrderItem(product.id, quantity, product.price)
  }

  increaseQuantity(amount: number): void {
    this._quantity += amount
  }

  get subtotal(): Money {
    return new Money(this.price.amount * this._quantity, this.price.currency)
  }
}
```

**Regras:**

- Um aggregate root por transação
- Modificações em itens do aggregate passam pelo root
- IDs externos referenciam outros aggregates (não objetos internos)
- Consistência garantida dentro do aggregate

### Domain Events

Eventos que representam algo significativo que aconteceu no domínio.

```ts
// Eventos em passado (aconteceu, não está acontecendo)
class OrderCreatedEvent {
  type = 'order.created' as const
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

class OrderPaidEvent {
  type = 'order.paid' as const
  constructor(
    public readonly orderId: string,
    public readonly paymentMethod: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

// Publicando eventos a partir do aggregate
class Order {
  private _domainEvents: DomainEvent[] = []

  pay(paymentMethod: string): void {
    if (this._status !== 'pending') {
      throw new DomainError('Order is not pending')
    }
    this._status = 'paid'
    this._domainEvents.push(new OrderPaidEvent(this.id, paymentMethod))
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._domainEvents]
    this._domainEvents = []
    return events
  }
}
```

**Quando usar:**

- Domain events → acontecimentos internos do bounded context
- Integration events → comunicar entre bounded contexts
- Eventos no passado: `OrderCreated`, `UserRegistered`, `PaymentProcessed`

### Domain Services

Lógica que não pertence a nenhuma entidade individual.

```ts
// Serviço de domínio quando a lógica envolve múltiplos objetos
class PriceCalculator {
  calculateTotal(order: Order, coupon: Coupon | null): Money {
    const subtotal = order.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.create(0, 'BRL'),
    )

    if (coupon) {
      const discount = coupon.apply(subtotal)
      return subtotal.add(discount)
    }

    return subtotal
  }
}
```

**Quando criar:**

- Lógica que envolve múltiplos aggregates
- Lógica que depende de serviços externos (taxas, cotações)
- Regras que não são de responsabilidade de uma entidade específica

### Repositories

Abstração sobre persistência — o domínio define o contrato, a infraestrutura implementa.

```ts
// Interface no domínio
interface OrderRepository {
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<void>
  nextId(): string
}

// Implementação na infraestrutura
class PrismaOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const data = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    return data ? this.toDomain(data) : null
  }

  async save(order: Order): Promise<void> {
    await prisma.order.upsert({
      where: { id: order.id },
      create: {/* ... */},
      update: {/* ... */},
    })
  }

  nextId(): string {
    return crypto.randomUUID()
  }
}
```

**Regras:**

- Um repositório por aggregate root
- Interface vive no domínio, implementação na infraestrutura
- Repositórios retornam objetos de domínio, não DTOs
- Nunca expor detalhes de persistência (SQL, ORM)

---

## Anti-Patterns

### Anemic Domain Model

```ts
// ❌ Errado: entidade sem comportamento
class Order {
  id: string
  status: string
  total: number
  items: OrderItem[]
}

// Lógica espalhada em services
class OrderService {
  pay(order: Order) {
    order.status = 'paid'
  }
  cancel(order: Order) {
    order.status = 'cancelled'
  }
  addItem(order: Order, item: OrderItem) {
    order.items.push(item)
  }
}

// ✅ Correto: entidade com comportamento
class Order {
  private _status: OrderStatus = 'pending'

  pay(): void {
    if (this._status !== 'pending') throw new DomainError('Not pending')
    this._status = 'paid'
  }

  cancel(): void {
    if (this._status === 'shipped') throw new DomainError('Already shipped')
    this._status = 'cancelled'
  }
}
```

### God Aggregate

```ts
// ❌ Errado: um aggregate que faz tudo
class Order {
  // 200+ linhas, 15 responsabilidades
  // Gerencia pagamento, estoque, frete, notificação...
}

// ✅ Correto: aggregates pequenos e focados
class Order {
  /* só pedidos */
}
class Payment {
  /* só pagamentos */
}
class Shipment {
  /* só envios */
}
```

### Domain Logic em Services

```ts
// ❌ Errado: regra de negócio no service
class OrderService {
  async createOrder(input: CreateOrderInput) {
    if (input.items.length === 0) throw new Error('No items') // ← regra no service
    const order = new Order()
    order.total = input.items.reduce((s, i) => s + i.price * i.qty, 0) // ← lógica no service
    await this.repo.save(order)
  }
}

// ✅ Correto: regra no domínio
class Order {
  static create(input: CreateOrderInput): Order {
    if (input.items.length === 0) {
      throw new DomainError('Order must have at least one item')
    }
    const order = new Order(crypto.randomUUID(), input.customerId)
    input.items.forEach((i) => order.addItem(i.product, i.quantity))
    return order
  }
}
```

---

## Regras

1. **Ubiquitous Language primeiro** — nomes de classes = nomes do negócio
2. **Bounded Contexts antes de código** — definir limites antes de implementar
3. **Entities têm identidade** — value objects não
4. **Value Objects são imutáveis** — validam no construtor
5. **Um aggregate root por transação** — não modificar múltiplos roots na mesma operação
6. **Eventos no passado** — `OrderCreated`, não `CreateOrder`
7. **Repositórios retornam domínio** — não DTOs, não records do banco
8. **Anti-corruption layer** para integração com sistemas legados
