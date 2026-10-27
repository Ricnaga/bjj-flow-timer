---
name: observability
description: Use when implementing observability, monitoring, tracing, or cost tracking for applications and AI systems. Covers OpenTelemetry (OTEL) instrumentation, LLM monitoring (tokens, latency, cost, drift), SLOs and SLIs for AI systems, FinOps and cost tracking, and dashboard design for AI/ML. Trigger on keywords like "observability", "otel", "opentelemetry", "monitoring", "tracing", "llm monitoring", "drift detection", "cost tracking", "finops", "slo", "sli", "dashboard", "grafana", "telemetry".
---

# Observability — Monitoramento para Sistemas de IA

Referência completa de observabilidade focada em sistemas de IA/ML. Complementa `devops-workflow` (logging com Pino, métricas básicas com Prometheus, correlation IDs) com instrumentação distribuída, monitoring de LLM e FinOps.

> `→ Veja devops-workflow para logging (Pino), Prometheus metrics básicas e correlation IDs`

---

## 1. OpenTelemetry (OTEL)

### Por que OTEL?

Prometheus + Pino são excelentes, mas para sistemas distribuídos com IA precisa de:

- **Distributed tracing** — rastrear uma request across multiple services
- **Correlation automática** — logs, métricas e traces linkados pelo mesmo ID
- **Vendor-neutral** — não lock-in em Datadog, New Relic, etc.

### Setup

```ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_ENDPOINT ?? 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_ENDPOINT ?? 'http://localhost:4318/v1/metrics',
    }),
    exportIntervalMillis: 15_000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
    }),
  ],
})

sdk.start()
```

### Custom Spans para Operações de IA

```ts
import { trace, SpanStatusCode } from '@opentelemetry/api'

const tracer = trace.getTracer('ai-pipeline')

async function processWithTracing<T>(
  operation: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string>,
): Promise<T> {
  return tracer.startActiveSpan(operation, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes)
      }
      const result = await fn()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  })
}

// Uso
const response = await processWithTracing(
  'llm.chat',
  () => llm.chat(messages),
  {
    'llm.model': 'gpt-4',
    'llm.operation': 'chat',
    'user.id': userId,
  },
)
```

### Context Propagation

```ts
// Propagar trace context em chamadas HTTP
async function callExternalAPI(url: string, data: unknown): Promise<Response> {
  const { trace, context, propagation } = await import('@opentelemetry/api')

  // Injetar headers de trace na request
  const carrier: Record<string, string> = {}
  propagation.inject(context.active(), carrier)

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...carrier, // headers de trace injetados
    },
    body: JSON.stringify(data),
  })
}
```

---

## 2. LLM Monitoring

### Métricas Essenciais

```ts
import { Counter, Histogram, Gauge } from '@opentelemetry/api'

const meter = trace.getTracer('llm').meter

// === Token Metrics ===

export const llmTokensInput = new Counter({
  name: 'llm_tokens_input_total',
  description: 'Total input tokens consumed',
  labelNames: ['model', 'operation', 'user_id'],
})

export const llmTokensOutput = new Counter({
  name: 'llm_tokens_output_total',
  description: 'Total output tokens generated',
  labelNames: ['model', 'operation', 'user_id'],
})

// === Latency Metrics ===

export const llmLatency = new Histogram({
  name: 'llm_latency_seconds',
  description: 'LLM response latency',
  labelNames: ['model', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
})

// === Cost Metrics ===

export const llmCost = new Counter({
  name: 'llm_cost_usd_total',
  description: 'Total cost in USD',
  labelNames: ['model', 'operation', 'user_id'],
})

// === Quality Metrics ===

export const llmQualityScore = new Gauge({
  name: 'llm_quality_score',
  description: 'Quality score of LLM output (0-1)',
  labelNames: ['model', 'operation'],
})

// === Error Metrics ===

export const llmErrors = new Counter({
  name: 'llm_errors_total',
  description: 'Total LLM errors',
  labelNames: ['model', 'operation', 'error_type'],
})

// Preços por modelo (atualizar conforme necessário)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
  'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
  'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
}

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0
  return inputTokens * pricing.input + outputTokens * pricing.output
}
```

### LLM Metrics Middleware

```ts
async function trackLLMMetrics<T>(
  operation: string,
  model: string,
  userId: string,
  fn: () => Promise<{
    content: string
    usage: { promptTokens: number; completionTokens: number }
  }>,
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await fn()
    const latency = (Date.now() - startTime) / 1000

    // Registrar tokens
    llmTokensInput.add(result.usage.promptTokens, {
      model,
      operation,
      user_id: userId,
    })
    llmTokensOutput.add(result.usage.completionTokens, {
      model,
      operation,
      user_id: userId,
    })

    // Registrar latência
    llmLatency.record(latency, { model, operation })

    // Registrar custo
    const cost = calculateCost(
      model,
      result.usage.promptTokens,
      result.usage.completionTokens,
    )
    llmCost.add(cost, { model, operation, user_id: userId })

    return result as unknown as T
  } catch (error) {
    llmErrors.add(1, {
      model,
      operation,
      error_type: (error as Error).name,
    })
    throw error
  }
}
```

### Drift Detection

```ts
interface DriftDetector {
  baseline: number[] // embeddings do baseline
  threshold: number // distância máxima aceitável
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (normA * normB)
}

function detectDataDrift(
  currentEmbedding: number[],
  detector: DriftDetector,
): { drifted: boolean; similarity: number } {
  const similarity = cosineSimilarity(currentEmbedding, detector.baseline)
  return {
    drifted: similarity < detector.threshold,
    similarity,
  }
}

// Monitorar drift continuamente
async function monitorDrift(
  embeddings: number[][],
  detector: DriftDetector,
): Promise<{ total: number; drifted: number; driftRate: number }> {
  let drifted = 0

  for (const embedding of embeddings) {
    const result = detectDataDrift(embedding, detector)
    if (result.drifted) drifted++
  }

  return {
    total: embeddings.length,
    drifted,
    driftRate: drifted / embeddings.length,
  }
}
```

---

## 3. SLOs e SLIs para AI Systems

### Definição de SLIs

| SLI                 | Métrica                           | Como medir                              |
| ------------------- | --------------------------------- | --------------------------------------- |
| **Disponibilidade** | % de requests bem-sucedidas       | `1 - (erros_5xx / total_requests)`      |
| **Latência**        | % de requests abaixo do threshold | `histogram_quantile(0.95, llm_latency)` |
| **Qualidade**       | % de outputs aceitos              | `accepted_outputs / total_outputs`      |
| **Custo**           | Custo médio por request           | `total_cost / total_requests`           |

### SLO Configuration

```ts
interface SLO {
  name: string
  target: number // 0.99 = 99%
  windowDays: number // período de medição
  sli: {
    metric: string
    goodFilter: string // filtro para "good" events
    totalFilter: string // filtro para todos os events
  }
}

const AI_SLOS: SLO[] = [
  {
    name: 'llm-availability',
    target: 0.99,
    windowDays: 30,
    sli: {
      metric: 'llm_requests_total',
      goodFilter: '{status!="error"}',
      totalFilter: '{}',
    },
  },
  {
    name: 'llm-latency',
    target: 0.95,
    windowDays: 30,
    sli: {
      metric: 'llm_latency_seconds',
      goodFilter: '{le="5"}', // menos de 5 segundos
      totalFilter: '{}',
    },
  },
  {
    name: 'llm-cost',
    target: 0.9, // 90% das requests abaixo do budget
    windowDays: 30,
    sli: {
      metric: 'llm_cost_usd',
      goodFilter: '{cost_bucket="under_budget"}',
      totalFilter: '{}',
    },
  },
]

// Verificar se SLO está sendo cumprido
function checkSLO(
  slo: SLO,
  goodEvents: number,
  totalEvents: number,
): {
  met: boolean
  currentSLO: number
  errorBudgetRemaining: number
} {
  const currentSLO = goodEvents / totalEvents
  const errorBudget = 1 - slo.target
  const errorRate = 1 - currentSLO
  const errorBudgetRemaining =
    Math.max(0, errorBudget - errorRate) / errorBudget

  return {
    met: currentSLO >= slo.target,
    currentSLO,
    errorBudgetRemaining,
  }
}
```

---

## 4. Cost Tracking / FinOps

### Budget por Feature

```ts
interface FeatureBudget {
  feature: string
  monthlyBudgetUSD: number
  alertThresholds: number[] // [0.5, 0.75, 0.9] = 50%, 75%, 90%
}

const FEATURE_BUDGETS: FeatureBudget[] = [
  {
    feature: 'chat-assistant',
    monthlyBudgetUSD: 500,
    alertThresholds: [0.5, 0.75, 0.9],
  },
  {
    feature: 'content-generation',
    monthlyBudgetUSD: 200,
    alertThresholds: [0.75, 0.9],
  },
  {
    feature: 'code-review',
    monthlyBudgetUSD: 100,
    alertThresholds: [0.75, 0.9],
  },
]

class CostTracker {
  private usage = new Map<string, number>()

  record(feature: string, model: string, tokens: number, cost: number): void {
    const key = `${feature}:${model}`
    const current = this.usage.get(key) ?? 0
    this.usage.set(key, current + cost)

    // Verificar thresholds
    const budget = FEATURE_BUDGETS.find((b) => b.feature === feature)
    if (budget) {
      const totalCost = this.getFeatureCost(feature)
      const usagePercent = totalCost / budget.monthlyBudgetUSD

      for (const threshold of budget.alertThresholds) {
        if (usagePercent >= threshold && usagePercent < threshold + 0.05) {
          this.alert(feature, usagePercent, budget.monthlyBudgetUSD)
        }
      }
    }
  }

  getFeatureCost(feature: string): number {
    let total = 0
    for (const [key, cost] of this.usage) {
      if (key.startsWith(feature)) total += cost
    }
    return total
  }

  getTotalCost(): number {
    return Array.from(this.usage.values()).reduce((sum, cost) => sum + cost, 0)
  }

  private alert(feature: string, usagePercent: number, budget: number): void {
    console.warn(
      JSON.stringify({
        type: 'cost_alert',
        feature,
        usage_percent: Math.round(usagePercent * 100),
        budget_usd: budget,
        current_cost_usd: this.getFeatureCost(feature),
      }),
    )
  }
}
```

### Cache como Redução de Custo

```ts
// Cache de respostas LLM para queries similares
class LLMResponseCache {
  private cache = new Map<string, { response: string; timestamp: number }>()
  private ttlMs: number

  constructor(ttlMs: number = 3600_000) {
    // 1 hora default
    this.ttlMs = ttlMs
  }

  getKey(messages: ChatMessage[], model: string): string {
    // Hash do conteúdo + modelo para cache key
    const content = messages.map((m) => `${m.role}:${m.content}`).join('|')
    return `${model}:${hashString(content)}`
  }

  get(messages: ChatMessage[], model: string): string | null {
    const key = this.getKey(messages, model)
    const cached = this.cache.get(key)

    if (!cached) return null
    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.cache.delete(key)
      return null
    }

    return cached.response
  }

  set(messages: ChatMessage[], model: string, response: string): void {
    const key = this.getKey(messages, model)
    this.cache.set(key, { response, timestamp: Date.now() })
  }

  // Métricas de cache
  getStats(): { hits: number; misses: number; hitRate: number } {
    // Implementar com Counter do OTEL
    return { hits: 0, misses: 0, hitRate: 0 }
  }
}
```

### Prompt Caching

```ts
// OpenAI/Azure suportam prompt caching automaticamente
// Custos reduzem ~50% para prompts repetidos

interface PromptCacheConfig {
  enabled: boolean
  prefixLength: number // caracteres do início que são cacheados
}

function optimizeForPromptCache(messages: ChatMessage[]): ChatMessage[] {
  // Manter system message estável para maximizar cache hits
  const systemMsg = messages.find((m) => m.role === 'system')
  const otherMsgs = messages.filter((m) => m.role !== 'system')

  // System message sempre primeiro e sem variações
  return systemMsg ? [systemMsg, ...otherMsgs] : otherMsgs
}
```

---

## 5. Dashboard Design para AI/ML

### Painel Principal — Overview

```
┌─────────────────────────────────────────────────────────┐
│  AI Systems Overview                                     │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Total Cost  │ Avg Latency │ Error Rate  │ Quality Score │
│ $127.43     │ 1.2s        │ 0.3%        │ 0.94          │
│ (↓12% m/m)  │ (↑0.1s)     │ (↓0.1%)     │ (→)           │
├─────────────┴─────────────┴─────────────┴───────────────┤
│  Cost by Feature (bar chart)                             │
│  ████████████████ chat-assistant ($89)                   │
│  ████████ content-generation ($38)                       │
│  ████ code-review ($17)                                  │
├─────────────────────────────────────────────────────────┤
│  Latency P95 by Model (line chart, 7 dias)              │
│  ─── gpt-4: ~3.2s                                        │
│  ─── gpt-3.5-turbo: ~0.8s                                │
│  ─── claude-3: ~2.1s                                     │
├─────────────────────────────────────────────────────────┤
│  Error Rate (sparkline, 24h)                             │
│  ·····×··········×·········×····· (× = errors)           │
└─────────────────────────────────────────────────────────┘
```

### Painel de Custo Detalhado

```
┌─────────────────────────────────────────────────────────┐
│  Cost Tracking                                           │
├─────────────────────────────────────────────────────────┤
│  Monthly Budget: $500 | Spent: $127 | Remaining: $373   │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░ 25.4%              │
├─────────────────────────────────────────────────────────┤
│  Cost by Model (pie chart)                               │
│  gpt-4: 65% ($82.8)                                      │
│  gpt-3.5-turbo: 30% ($38.2)                              │
│  claude-3: 5% ($6.4)                                     │
├─────────────────────────────────────────────────────────┤
│  Cost Trend (line chart, 30 dias)                        │
│  $20 ┤        ╭───╮                                       │
│  $15 ┤  ╭────╯   ╰───╮                                   │
│  $10 ┤──╯              ╰─────────────                    │
│  $5  ┤                                                    │
│      └──────────────────────────────                     │
│      1        10        20        30                     │
├─────────────────────────────────────────────────────────┤
│  Token Usage (table)                                     │
│  Model          │ Input    │ Output   │ Cost             │
│  gpt-4          │ 1.2M     │ 340K     │ $82.80           │
│  gpt-3.5-turbo  │ 3.8M     │ 1.2M     │ $38.20           │
│  claude-3       │ 200K     │ 80K      │ $6.40            │
└─────────────────────────────────────────────────────────┘
```

### Painel de Qualidade

```
┌─────────────────────────────────────────────────────────┐
│  Quality & Drift Monitoring                              │
├─────────────────────────────────────────────────────────┤
│  Quality Score Trend (line chart, 14 dias)               │
│  1.0 ┤──────────────────────────────────                  │
│  0.9 ┤              ╭────╮                                │
│  0.8 ┤──────────────╯    ╰─────────                      │
│  0.7 ┤                                                    │
│      └──────────────────────────────                     │
├─────────────────────────────────────────────────────────┤
│  Drift Detection (gauge)                                 │
│  Current: 0.92 | Threshold: 0.85 | Status: OK           │
│  [========================|====] 92%                     │
├─────────────────────────────────────────────────────────┤
│  Hallucination Rate (last 7 days)                        │
│  Week 1: 2.1% | Week 2: 1.8% (↓14%)                     │
├─────────────────────────────────────────────────────────┤
│  SLO Compliance (table)                                  │
│  SLO              │ Target │ Current │ Status            │
│  availability     │ 99%    │ 99.7%   │ ✅ OK             │
│  latency p95      │ <5s    │ 3.2s    │ ✅ OK             │
│  quality          │ >0.9   │ 0.94    │ ✅ OK             │
│  cost/budget      │ <100%  │ 25.4%   │ ✅ OK             │
└─────────────────────────────────────────────────────────┘
```

### Grafana Dashboard JSON (Modelo Base)

```json
{
  "dashboard": {
    "title": "AI Systems Monitoring",
    "panels": [
      {
        "title": "LLM Cost (USD)",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(llm_cost_usd_total)",
            "legendFormat": "Total Cost"
          }
        ]
      },
      {
        "title": "LLM Latency P95",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(llm_latency_seconds_bucket[5m]))",
            "legendFormat": "P95 Latency"
          }
        ]
      },
      {
        "title": "Token Usage by Model",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(llm_tokens_input_total[5m])) by (model)",
            "legendFormat": "{{model}} input"
          },
          {
            "expr": "sum(rate(llm_tokens_output_total[5m])) by (model)",
            "legendFormat": "{{model}} output"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(llm_errors_total[5m])) / sum(rate(llm_requests_total[5m]))",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

---

## Regras

1. **OTEL para distributed tracing** — Prometheus sozinho não é suficiente em sistemas distribuídos
2. **Métricas de LLM são obrigatórias** — tokens, latência, custo e qualidade devem ser monitorados
3. **SLOs antes de dashboards** — definir o que importa antes de medir
4. **Cost tracking por feature** — não apenas por modelo; saber onde o dinheiro vai
5. **Cache reduz custo** — sempre considerar caching de respostas LLM
6. **Drift detection contínua** — monitorar se a qualidade do modelo está degradando
7. **Alertas baseados em SLO** — não em métricas individuais (evitar alert fatigue)
8. **Context propagation** — traces devem seguir a request across services
9. **Budget alerts proativos** — avisar antes de estourar, não depois
10. **Dashboard por audiência** — overview para gerência, detalhado para engenharia
