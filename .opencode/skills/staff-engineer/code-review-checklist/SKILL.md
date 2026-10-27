---
name: code-review-checklist
description: Use when reviewing code, providing feedback, doing architecture reviews, or checking code quality. Covers review checklists, severity levels, feedback patterns, cross-cutting concerns, and anti-patterns. Trigger on keywords like "review", "code review", "pr review", "pull request", "feedback", "checklist", "quality", "audit".
---

# Code Review Checklist

Referência completa para revisão de código. O staff-engineer é o guardião de qualidade técnica — este guia estrutura como aplicar esse papel.

---

## Severity Levels

### Critical — Must fix antes de merge

Problemas que causam bugs, falhas de segurança, ou violam convenções arquiteturais do projeto.

**Como comentar:**

```
🔴 CRITICAL: [descrição do problema]

[explicação do porquê é crítico]

Sugestão: [código ou abordagem correta]
```

**Exemplo:**

```
🔴 CRITICAL: SQL Injection — user input está sendo interpolado diretamente na query.

Isso permite que qualquer input malicioso execute SQL arbitrário no banco.

Sugestão: usar parameterized query:
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])
```

### Warning — Deve ser resolvido, mas pode ir em PR separado

Problemas de design, code smells, ou melhorias importantes que não são bloqueantes.

**Como comentar:**

```
🟡 WARNING: [descrição]

[explicação do impacto]

Sugestão: [código ou abordagem alternativa]
```

**Exemplo:**

```
🟡 WARNING: Função `processOrder` tem 150 linhas e 5 responsabilidades.

Isso dificulta testes e manutenção. Sugestão: extrair para:
- validateOrder()
- applyDiscounts()
- processPayment()
- createShipment()
- sendNotifications()
```

### Nit — Sugestão opcional, pode ignorar

Melhorias de estilo, nomes, ou preferências pessoais. Não bloqueia merge.

**Como comentar:**

```
💭 NIT: [sugestão menor]

[nota opcional]
```

**Exemplo:**

```
💭 NIT: `data` poderia se chamar `users` para ficar mais claro o que representa.
```

---

## Checklist de Review

### 1. Segurança

- [ ] **Input validation** — todo input do usuário é validado no boundary?
- [ ] **SQL injection** — queries usam parameterized queries?
- [ ] **XSS** — conteúdo dinâmico é escaped no render?
- [ ] **Secrets** — nenhum secret commitado no código? (.env, hardcoded keys)
- [ ] **Auth** — endpoints protegidos têm middleware de autenticação?
- [ ] **Authorization** — usuário tem permissão para acessar este recurso?
- [ ] **CSRF** — mutations protegidas contra cross-site request forgery?
- [ ] **Rate limiting** — endpoints sensíveis têm rate limit?
- [ ] **Logging** — dados sensíveis (passwords, tokens) NÃO são logados?

```ts
// ❌ Errado: logando dados sensíveis
logger.info('Login attempt', { email, password, token })

// ✅ Correto
logger.info('Login attempt', { email, userId: user.id })
```

### 2. Performance

- [ ] **N+1 queries** — lazy loading dentro de loops foi evitado?
- [ ] **Eager loading** — relacionamentos necessários são carregados junto?
- [ ] **Indexing** — queries frequentes têm índices no banco?
- [ ] **Pagination** — listas grandes usam paginação?
- [ ] **Cache** — dados frequentemente lidos estão cacheados?
- [ ] **Lazy loading** — componentes abaixo da dobra usam dynamic import?
- [ ] **Memory leaks** — event listeners, subscriptions, timers são cleanup?
- [ ] **Bundle size** — dependências novas impactam bundle significativamente?

```ts
// ❌ Errado: N+1 query
const orders = await orderRepo.findMany()
for (const order of orders) {
  order.user = await userRepo.findById(order.userId) // query por iteração
}

// ✅ Correto: eager loading
const orders = await orderRepo.findMany({
  include: { user: true },
})

// ✅ Correto: batch loading
const userIds = orders.map((o) => o.userId)
const users = await userRepo.findByIds(userIds)
```

### 3. Legibilidade

- [ ] **Nomes** — variáveis e funções descrevem o que fazem?
- [ ] **Funções pequenas** — cada função faz uma coisa só (<30 linhas)?
- [ ] **Complexidade** — funções com <3 níveis de aninhamento?
- [ ] **Duplicação** — código duplicado foi extraído para função/componente?
- [ ] **Magic numbers** — valores hardcoded estão em constantes nomeadas?
- [ ] **Comentários** — explicam o "porquê", não o "o quê"?
- [ ] **Imports** — organizados, sem dependências circulares?

```ts
// ❌ Errado: magic number
if (user.age >= 18) {
  /* ... */
}
for (let i = 0; i < 5; i++) {
  /* ... */
}

// ✅ Correto
const LEGAL_AGE = 18
const MAX_RETRY_ATTEMPTS = 5

if (user.age >= LEGAL_AGE) {
  /* ... */
}
for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
  /* ... */
}
```

### 4. Arquitetura

- [ ] **Boundaries** — módulos não importam internals de outros módulos?
- [ ] **Dependency direction** — dependência vai de fora pra dentro (domain no centro)?
- [ ] **SOLID** — SRP, OCP, LSP, ISP, DIP estão sendo seguidos?
- [ ] **Acoplamento** — mudanças em um módulo não quebram outros?
- [ ] **Testabilidade** — código pode ser testado com mocks dos dependencies?
- [ ] **Error handling** — erros são tratados na camada correta?
- [ ] **Side effects** — funções de domínio são puras (sem side effects)?

```ts
// ❌ Errado: domínio depende de infraestrutura
// domain/order.ts
import { prisma } from '@/infrastructure/database'

export class Order {
  async save() {
    await prisma.order.create({ data: this })
  }
}

// ✅ Correto: domínio define port, infra implementa
// domain/order.ts
export interface OrderRepository {
  save(order: Order): Promise<void>
}

// infrastructure/database/prisma-order-repository.ts
export class PrismaOrderRepository implements OrderRepository {
  async save(order: Order): Promise<void> {
    await prisma.order.create({ data: order })
  }
}
```

### 5. Testabilidade

- [ ] **Testes existem** — código novo tem testes unitários e/ou de integração?
- [ ] **Edge cases** — testes cobrem cenários de erro e borda?
- [ ] **Mock mínimo** — mocks são apenas dos boundaries, não de implementação?
- [ ] **Testes independentes** — testes não dependem de ordem ou estado anterior?
- [ ] **Dados de teste** — usam factories/builders, não fixtures hardcoded gigantescas?
- [ ] **Assertions claras** — cada teste tem um asserts claro e específico?

```ts
// ❌ Errado: testa implementação, não comportamento
it('calls repository.save', async () => {
  const spy = vi.spyOn(repo, 'save')
  await useCase.execute(input)
  expect(spy).toHaveBeenCalled()
})

// ✅ Correto: testa comportamento
it('creates user with valid data', async () => {
  const result = await useCase.execute(input)
  expect(result.id).toBeDefined()
  expect(result.email).toBe(input.email)
})
```

### 6. Operacionalidade

- [ ] **Logging estruturado** — logs são em JSON com contexto (requestId, userId)?
- [ ] **Error handling** — erros são tratados e retornam responses padronizadas?
- [ ] **Idempotência** — re-requests não causam efeitos colaterais?
- [ ] **Health checks** — endpoints de health existem e são verazes?
- [ ] **Graceful shutdown** — aplicação fecha conexões antes de encerrar?
- [ ] **Feature flags** — mudanças gradualmente liberadas via flags?
- [ ] **Monitoring** — métricas de latência, erro rate, throughput existem?

```ts
// ❌ Errado: log genérico
logger.error('Something went wrong')

// ✅ Correto: log estruturado com contexto
logger.error({
  event: 'order_creation_failed',
  orderId: input.orderId,
  userId: req.user.id,
  error: error.message,
  requestId: req.headers['x-request-id'],
})
```

---

## Feedback Patterns

### Como escrever comentários construtivos

**Estrutura:**

1. **Observação** — o que você viu
2. **Impacto** — por que é problema
3. **Sugestão** — como resolver (quando aplicável)

**Bom:**

```
Essa função tem 200 linhas e 6 responsabilidades. Isso dificulta
testes e torna manutenção difícil. Considere extrair para:
- validateInput()
- processPayment()
- updateInventory()
```

**Ruim:**

```
função grande demais, refatorar
```

### Perguntas vs Afirmações

**Prefira perguntas** — elas abrem discussão em vez de impor:

```
// ❌ Afirmação
Isso deve usar Redis em vez de Memcached.

// ✅ Pergunta
Qual o raciocínio por trás de Memcached aqui? Redis teria
suporte a data structures que facilitariam essa lógica.
```

### Concordando com feedback anterior

```
+1 no comentário do @dev. Além disso, eu adicionaria que...
```

### Quando não comentar

- **Nits em código que não será modificado** — escolha suas batalhas
- **Preferências pessoais** — se segue o padrão do projeto, está OK
- **Coisas que o lint/format já cobrem** — não comente o que o ESLint resolve

---

## Anti-patterns para identificar

### God Function

Função que faz tudo (>100 linhas, múltiplas responsabilidades).

### Leaky Abstraction

Detalhes de implementação vazando para camadas superiores (ex: UI sabendo de SQL).

### Primitive Obsession

Usando strings/numbers em vez de Value Objects tipados.

### Arrow Anti-pattern

Código com muitos níveis de indentação (>3 = problema).

### Shotgun Surgery

Mudar uma feature requer alterar 5+ arquivos.

### Feature Envy

Função que usa mais dados de outro módulo que do seu próprio.

### Temporal Coupling

Componente B só funciona se componente A rodou antes (sem verificação explícita).

### Invisible Dependencies

Módulo que depende de estado global ou ordem de execução implícita.

---

## Regras

1. **Revisar TODO PR** — sem exceção, mesmo os pequenos
2. **Ser rápido** — PRs grandes demoram mais; PRs pequenos (<400 linhas) são revisados em <1h
3. **Ser construtivo** — criticar código, não pessoas
4. **Ser específico** — "isso tá ruim" não ajuda; "essa função faz 3 coisas" ajuda
5. **Priorizar** — critical antes de warning antes de nit
6. **Aprender** — se o mesmo problema aparece 3x, criar guideline/docs
7. **Aprovar com ressalvas** — não bloquear PR por nits; anotar para follow-up
