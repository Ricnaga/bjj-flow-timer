---
name: data-pipeline
description: Use when designing or implementing data pipelines, ETL processes, streaming systems, or data quality frameworks. Covers pipeline architecture patterns (ETL vs ELT, streaming vs batch), data quality validation, schema evolution, streaming with Kafka, batch processing with dbt/Spark/Polars, feature engineering with feature stores, and data versioning with DVC. Trigger on keywords like "pipeline", "etl", "elt", "data quality", "streaming", "batch", "kafka", "feature engineering", "feature store", "data versioning", "schema evolution", "ingestion", "data contract".
---

# Data Pipeline — Padrões de Pipelines de Dados

Referência completa de pipelines de dados para sistemas de IA/ML. Foca em arquitetura, qualidade e engenharia de dados.

> `→ Veja ai-architect para pipelines RAG, chunking strategies e embedding models`

---

## 1. Pipeline Architecture Patterns

### Decision Matrix

| Padrão          | Quando usar                                                | Quando NÃO usar                                               |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| **Batch ETL**   | Dados grandes, processamento periódico, latência aceitável | Tempo real, dados em streaming                                |
| **Streaming**   | Dados contínuos, latência < 1s, eventos em tempo real      | Dados estáticos, processamento pontual                        |
| **Micro-batch** | Balance entre batch e streaming, latência ~minutos         | Tempo real sub-second                                         |
| **ELT**         | Dados já no warehouse, transformação no destino            | Dados sensíveis que não podem ser estocados sem transformação |

### ETL vs ELT

```
ETL (Extract → Transform → Load):
┌──────────┐    ┌────────────┐    ┌──────────┐
│  Source   │───▶│ Transform  │───▶│ Warehouse│
└──────────┘    └────────────┘    └──────────┘
                 (dados chegam
                  processados)

ELT (Extract → Load → Transform):
┌──────────┐    ┌──────────┐    ┌────────────┐
│  Source   │───▶│ Warehouse│───▶│ Transform  │
└──────────┘    └──────────┘    └────────────┘
                 (dados chegam
                  crus, transforma no destino)
```

**Quando usar ETL:**

- Dados sensíveis que precisam ser mascarados antes de persistir
- Fontes de dados com schema instável
- Transformações pesadas que não cabem no warehouse

**Quando usar ELT:**

- Warehouse é poderoso (BigQuery, Snowflake)
- Dados precisam ser armazenados crus para auditoria
- Transformações são simples e SQL-friendly

### Orquestração

```yaml
# Exemplo: DAG com Airflow/Dagster
pipeline:
  name: 'ingestion-to-feature-store'
  schedule: '0 */6 * * *' # a cada 6 horas

  steps:
    - name: extract
      operator: http_extract
      config:
        url: '${SOURCE_API_URL}'
        timeout: 300

    - name: validate
      operator: data_quality
      depends_on: [extract]
      config:
        schema: 'schemas/raw_input.json'
        rules:
          - not_null: ['id', 'timestamp']
          - unique: ['id']
          - range: { field: 'amount', min: 0, max: 1000000 }

    - name: transform
      operator: sql_transform
      depends_on: [validate]
      config:
        query: 'transforms/clean_and_enrich.sql'

    - name: load
      operator: warehouse_load
      depends_on: [transform]
      config:
        target: 'feature_store.user_features'
        strategy: 'upsert'
        key_columns: ['user_id', 'feature_date']
```

---

## 2. Data Quality

### Validation Patterns

```ts
import { z } from 'zod'

// Schema como contrato de dados
const UserEventSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().min(1),
  eventType: z.enum(['click', 'view', 'purchase', 'add_to_cart']),
  timestamp: z.string().datetime(),
  properties: z.record(z.unknown()).optional(),
  metadata: z.object({
    source: z.string(),
    version: z.string(),
    createdAt: z.string().datetime(),
  }),
})

type UserEvent = z.infer<typeof UserEventSchema>

// Validação com tratamento de erro
function validateEvent(raw: unknown): Result<UserEvent, ValidationError> {
  const result = UserEventSchema.safeParse(raw)

  if (!result.success) {
    return err(
      new ValidationError('Invalid event schema', 'event', {
        issues: result.error.issues,
        raw,
      }),
    )
  }

  return ok(result.data)
}
```

### Data Contracts

```ts
// Contrato entre producer e consumer
interface DataContract {
  name: string
  version: string
  schema: z.ZodType
  owner: string
  sla: {
    freshnessMinutes: number // dados devem ser atualizados a cada X minutos
    completeness: number // % mínimo de campos não nulos
    accuracy: number // % de records que passam na validação
  }
}

const USER_FEATURES_CONTRACT: DataContract = {
  name: 'user_features',
  version: '1.2.0',
  schema: z.object({
    userId: z.string(),
    featureDate: z.string().datetime(),
    totalPurchases30d: z.number().int().min(0),
    avgOrderValue: z.number().min(0),
    lastActivityAt: z.string().datetime(),
  }),
  owner: 'data-engineering',
  sla: {
    freshnessMinutes: 60,
    completeness: 0.99,
    accuracy: 0.95,
  },
}
```

### Schema Evolution

| Tipo de Mudança             | Compatível | Exemplo                  |
| --------------------------- | ---------- | ------------------------ |
| Adicionar campo optional    | ✅ Sim     | `age?: number`           |
| Adicionar campo com default | ✅ Sim     | `status = "active"`      |
| Remover campo               | ⚠️ Cuidado | Quebra consumers antigos |
| Renomear campo              | ❌ Não     | Breaking change          |
| Mudar tipo do campo         | ❌ Não     | Breaking change          |
| Tornar campo obrigatório    | ⚠️ Cuidado | Quebra records antigos   |

```ts
// Versionamento de schema
interface SchemaVersion {
  version: string
  schema: z.ZodType
  migration?: (old: unknown) => unknown // migra dados da versão anterior
}

const USER_EVENT_VERSIONS: SchemaVersion[] = [
  {
    version: '1.0.0',
    schema: z.object({
      eventId: z.string(),
      userId: z.string(),
      eventType: z.string(),
      timestamp: z.string(),
    }),
  },
  {
    version: '1.1.0',
    schema: z.object({
      eventId: z.string().uuid(), // adicionado uuid validation
      userId: z.string().min(1), // adicionado min length
      eventType: z.enum(['click', 'view', 'purchase']), // adicionado enum
      timestamp: z.string().datetime(), // adicionado datetime validation
      properties: z.record(z.unknown()).optional(), // campo novo optional
    }),
    migration: (old) => ({
      ...old,
      properties: {}, // default para dados antigos
    }),
  },
]
```

### Data Freshness Checks

```ts
interface FreshnessCheck {
  dataset: string
  expectedFrequencyMs: number
  lastUpdated: Date
}

function checkFreshness(checks: FreshnessCheck[]): FreshnessViolation[] {
  const now = Date.now()
  const violations: FreshnessViolation[] = []

  for (const check of checks) {
    const age = now - check.lastUpdated.getTime()
    if (age > check.expectedFrequencyMs) {
      violations.push({
        dataset: check.dataset,
        expectedMs: check.expectedFrequencyMs,
        actualMs: age,
        severity: age > check.expectedFrequencyMs * 2 ? 'critical' : 'warning',
      })
    }
  }

  return violations
}
```

---

## 3. Streaming Patterns

### Kafka Architecture

```
┌──────────┐    ┌───────────┐    ┌──────────────────┐
│ Producer  │───▶│   Topic   │───▶│    Consumer       │
└──────────┘    │  (parti-  │    │    Group          │
                │   tions)  │    └──────────────────┘
┌──────────┐    │           │    │  ┌──────────────┐ │
│ Producer  │───▶│  orders   │    │  │ Consumer 1   │ │
└──────────┘    │  (6 parts)│    │  │ → partition 0 │ │
                │           │    │  │ → partition 1 │ │
                │           │    │  └──────────────┘ │
                │           │    │  ┌──────────────┐ │
                │           │    │  │ Consumer 2   │ │
                │           │    │  │ → partition 2 │ │
                │           │    │  │ → partition 3 │ │
                │           │    │  └──────────────┘ │
                └───────────┘    └──────────────────┘
```

### Producer Pattern

```ts
import { Kafka, logLevel } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'data-pipeline',
  brokers: ['localhost:9092'],
  logLevel: logLevel.WARN,
})

const producer = kafka.producer({
  idempotent: true, // exactly-once semantics
  maxInFlightRequests: 5, // batching otimizado
})

async function publishEvent<T>(topic: string, event: T): Promise<void> {
  await producer.send({
    topic,
    messages: [
      {
        key: (event as Record<string, unknown>).eventId as string,
        value: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'schema-version': '1.1.0',
          timestamp: new Date().toISOString(),
        },
      },
    ],
  })
}
```

### Consumer Pattern com DLQ

```ts
const consumer = kafka.consumer({ groupId: 'pipeline-worker' })

const MAX_RETRIES = 3

async function consumeWithDLQ(
  topic: string,
  handler: (event: unknown) => Promise<void>,
): Promise<void> {
  await consumer.subscribe({ topic, fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventId = message.headers?.['event-id']?.toString()
      const retryCount = parseInt(
        message.headers?.['retry-count']?.toString() ?? '0',
      )

      try {
        const event = JSON.parse(message.value!.toString())
        await handler(event)
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          // Reenviar com retry
          await producer.send({
            topic,
            messages: [
              {
                key: message.key,
                value: message.value,
                headers: {
                  ...Object.fromEntries(
                    Object.entries(message.headers ?? {}).map(([k, v]) => [
                      k,
                      v?.toString() ?? '',
                    ]),
                  ),
                  'retry-count': String(retryCount + 1),
                  'original-timestamp':
                    message.headers?.['timestamp']?.toString(),
                  'error-message': (error as Error).message,
                },
              },
            ],
          })
        } else {
          // Enviar para Dead Letter Queue
          await producer.send({
            topic: `${topic}.dlq`,
            messages: [
              {
                key: message.key,
                value: message.value,
                headers: {
                  'error-message': (error as Error).message,
                  'error-stack': (error as Error).stack,
                  'failed-at': new Date().toISOString(),
                  'original-topic': topic,
                  'original-partition': String(partition),
                  'retry-count': String(retryCount),
                },
              },
            ],
          })
        }
      }
    },
  })
}
```

### Exactly-Once vs At-Least-Once

| Semântica         | Quando usar                                   | Trade-off                                  |
| ----------------- | --------------------------------------------- | ------------------------------------------ |
| **At-least-once** | A maioria dos casos, idempotência no consumer | Mais simples, pode processar duplicatas    |
| **Exactly-once**  | Pagamentos, contabilidade, dados críticos     | Mais complexo, precisa de idempotency keys |
| **At-most-once**  | Telemetria, logs, dados não-críticos          | Pode perder dados, mais rápido             |

---

## 4. Batch Processing

### dbt Patterns

```sql
-- models/staging/stg_orders.sql
-- Camada de staging: limpeza e tipagem
SELECT
  id AS order_id,
  user_id,
  status,
  total / 100.0 AS total_amount,  -- centavos → reais
  created_at::timestamp AS ordered_at,
  updated_at::timestamp AS updated_at
FROM {{ source('raw', 'orders') }}
WHERE deleted_at IS NULL

-- models/marts/user_features.sql
-- Camada de marts: aggregações e features
SELECT
  u.user_id,
  COUNT(DISTINCT o.order_id) AS total_orders_30d,
  SUM(o.total_amount) AS total_spent_30d,
  AVG(o.total_amount) AS avg_order_value,
  MAX(o.ordered_at) AS last_order_at,
  DATEDIFF('day', MAX(o.ordered_at), CURRENT_DATE) AS days_since_last_order
FROM {{ ref('stg_users') }} u
LEFT JOIN {{ ref('stg_orders') }} o
  ON u.user_id = o.user_id
  AND o.ordered_at >= DATEADD('day', -30, CURRENT_DATE)
GROUP BY 1
```

### Spark/Polars Patterns

```python
# Polars para processamento batch eficiente
import polars as pl

def process_batch(input_path: str, output_path: str):
    df = pl.read_parquet(input_path)

    # Transformação lazy (otimizada)
    result = (
        df.lazy()
        .filter(pl.col("status") == "completed")
        .with_columns([
            (pl.col("amount") / 100).alias("amount_brl"),
            pl.col("created_at").str.to_datetime().alias("timestamp"),
        ])
        .group_by("user_id")
        .agg([
            pl.col("order_id").n_unique().alias("order_count"),
            pl.col("amount_brl").sum().alias("total_spent"),
            pl.col("amount_brl").mean().alias("avg_order_value"),
            pl.col("timestamp").max().alias("last_order_at"),
        ])
        .collect()
    )

    result.write_parquet(output_path)
```

### Windowing para Batch

```python
# Sliding window para features temporais
def compute_windowed_features(df: pl.LazyFrame) -> pl.LazyFrame:
    return df.with_columns([
        # Janela de 7 dias
        pl.col("amount").rolling_sum(
            window_size="7d",
            by="timestamp",
            closed="left",
        ).alias("spend_7d"),

        # Janela de 30 dias
        pl.col("amount").rolling_sum(
            window_size="30d",
            by="timestamp",
            closed="left",
        ).alias("spend_30d"),

        # Janela de 90 dias
        pl.col("amount").rolling_sum(
            window_size="90d",
            by="timestamp",
            closed="left",
        ).alias("spend_90d"),
    ])
```

---

## 5. Feature Engineering

### Feature Store Architecture

```
┌─────────────────────────────────────────────────┐
│                Feature Store                     │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │  Offline Store    │  │  Online Store    │     │
│  │  (Batch features) │  │  (Real-time)     │     │
│  │                   │  │                  │     │
│  │  Parquet/Delta    │  │  Redis/DynamoDB  │     │
│  │  Spark/BigQuery   │  │  < 10ms latency  │     │
│  └──────────────────┘  └──────────────────┘     │
│         ▲                        ▲               │
│         │                        │               │
│  ┌──────────────┐        ┌──────────────┐       │
│  │ Batch Pipeline│        │Stream Pipeline│       │
│  │ (airflow)     │        │(kafka/flink)  │       │
│  └──────────────┘        └──────────────┘       │
└─────────────────────────────────────────────────┘
```

### Online vs Offline Features

| Aspecto         | Offline Store                | Online Store             |
| --------------- | ---------------------------- | ------------------------ |
| **Latência**    | Minutos-horas                | < 10ms                   |
| **Uso**         | Treinamento, batch inference | Serving em tempo real    |
| **Storage**     | Parquet, Delta Lake          | Redis, DynamoDB          |
| **Atualização** | Batch (diário/por hora)      | Streaming ou micro-batch |
| **Volume**      | TB-PB                        | GB-TB                    |

### Point-in-Time Correctness

```ts
// ❌ Errado: usar features futuras (data leakage)
const features = await featureStore.getFeatures(userId)
// features.totalPurchases30d inclui a compra atual → leakage!

// ✅ Correto: excluir o evento atual
const features = await featureStore.getFeatures(userId, {
  excludeEventId: currentEvent.eventId,
  asOf: currentEvent.timestamp, // snapshot no momento do evento
})
```

### Feature Pipeline

```ts
interface FeatureDefinition {
  name: string
  entity: string // "user", "product", "order"
  freshness: 'realtime' | 'batch'
  aggregation?: {
    function: 'count' | 'sum' | 'avg' | 'max' | 'min' | 'distinct'
    window: string // "7d", "30d", "90d"
    field: string
  }
  transformation?: (raw: unknown) => unknown
}

const USER_FEATURES: FeatureDefinition[] = [
  {
    name: 'total_purchases_30d',
    entity: 'user',
    freshness: 'batch',
    aggregation: { function: 'count', window: '30d', field: 'order_id' },
  },
  {
    name: 'avg_order_value_30d',
    entity: 'user',
    freshness: 'batch',
    aggregation: { function: 'avg', window: '30d', field: 'amount' },
  },
  {
    name: 'last_activity',
    entity: 'user',
    freshness: 'realtime',
    transformation: (event) => (event as UserEvent).timestamp,
  },
]
```

---

## 6. Data Versioning e Lineage

### DVC (Data Version Control)

```bash
# Inicializar DVC
dvc init

# Rastrear arquivo grande
dvc add data/training/dataset.parquet
git add data/training/dataset.parquet.dvc .gitignore

# Versionar com tag
dvc tag v1.0.0
git tag v1.0.0

# Reproduzir pipeline
dvc repro

# Comparar versões
dvc diff v1.0.0 v1.1.0
```

### Data Lineage

```ts
interface DataLineage {
  dataset: string
  version: string
  source: {
    type: 'file' | 'api' | 'database' | 'stream'
    location: string
    ingestedAt: Date
  }
  transformations: {
    step: string
    code: string // hash do código que transformou
    input: string[] // datasets de entrada
    output: string // dataset de saída
  }[]
  quality: {
    records: number
    completeness: number
    validity: number
  }
  metadata: {
    createdAt: Date
    createdBy: string
    tags: string[]
  }
}

// Exemplo de lineage para um feature
const FEATURE_LINEAGE: DataLineage = {
  dataset: 'user_features_v2',
  version: '2.1.0',
  source: {
    type: 'database',
    location: 'postgres://analytics/orders',
    ingestedAt: new Date('2024-01-15T06:00:00Z'),
  },
  transformations: [
    {
      step: 'staging',
      code: 'abc123', // hash do stg_orders.sql
      input: ['raw.orders'],
      output: 'staging.stg_orders',
    },
    {
      step: 'marts',
      code: 'def456', // hash do user_features.sql
      input: ['staging.stg_orders', 'staging.stg_users'],
      output: 'marts.user_features_v2',
    },
  ],
  quality: {
    records: 1_250_000,
    completeness: 0.992,
    validity: 0.987,
  },
  metadata: {
    createdAt: new Date('2024-01-15T06:30:00Z'),
    createdBy: 'airflow-pipeline',
    tags: ['user-features', 'ml-training'],
  },
}
```

### Reproducibility

```ts
// Toda feature pipeline deve ser reproduzível
interface ReproduciblePipeline {
  name: string
  version: string
  codeHash: string // hash do código da pipeline
  dataHash: string // hash dos dados de entrada
  configHash: string // hash da configuração
  dependencies: string[] // versões das dependências
  environment: {
    python: string
    packages: Record<string, string>
  }
}

// Para reproduzir um resultado específico:
// 1. Checkout do código na versão correta
// 2. Instalar dependências da versão registrada
// 3. Baixar dados da versão registrada
// 4. Executar pipeline
// 5. Verificar que output = resultado registrado
```

---

## Regras

1. **Data contracts primeiro** — definir schema antes de implementar pipeline
2. **Schema versioning** — toda mudança de schema deve ser backwards-compatible
3. **Data quality checks** — validar antes de processar, não depois
4. **DLQ para streaming** — erros devem ser capturados, não ignorados
5. **Point-in-time correctness** — evitar data leakage em features
6. **Reproducibility** — toda pipeline deve ser reproduzível com os mesmos inputs
7. **Data lineage** — rastrear de onde veio cada dado e como foi transformado
8. **Freshness monitoring** — alertar quando dados estão desatualizados
9. **Idempotência** — pipelines devem poder ser re-executadas sem efeitos colaterais
10. **Separar staging de marts** — nunca transformar dados crus diretamente em features
