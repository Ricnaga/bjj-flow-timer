---
name: devops-workflow
description: Use when working with Docker, CI/CD, GitHub Actions, deployment, environment variables, Kubernetes, monitoring, logging, secrets management, or infrastructure configuration. Trigger on keywords like "docker", "ci", "cd", "github actions", "deploy", "vercel", "env", "environment", "pipeline", "container", "kubernetes", "k8s", "monitoring", "prometheus", "logging", "pino", "vault", "secrets", "canary", "rollback", "health check".
---

# DevOps Workflow

Referência para DevOps em projetos Next.js/Node.js com TypeScript.

## Docker

### Dockerfile (Next.js)

```dockerfile
FROM node:20-alpine AS base

# Instalar dependências
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

volumes:
  postgres_data:
```

### .dockerignore

```
node_modules
.next
.git
.env
.env.local
*.md
docker-compose.yml
```

## GitHub Actions

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

### Deploy Workflow (Vercel)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Environment Variables

### Estrutura

```env
# .env.local (não commitar)
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_SECRET="secret"
NEXTAUTH_URL="http://localhost:3000"

# .env.example (commitar)
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

### Validação com Zod

```ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

## Deploy

### Vercel (Next.js)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Self-hosted

```bash
# Build
docker build -t myapp .

# Run
docker run -p 3000:3000 --env-file .env myapp
```

## Secret Management

### Validação com Zod (recap)

```ts
// Nunca acessar process.env diretamente no código
// Sempre validar no bootstrap da aplicação
const env = envSchema.parse(process.env)
```

### Vault Pattern (HashiCorp Vault)

```ts
// infrastructure/secrets/vault.ts
interface SecretProvider {
  getSecret(path: string): Promise<Record<string, string>>
}

class VaultSecretProvider implements SecretProvider {
  constructor(
    private readonly vaultAddr: string,
    private readonly token: string,
  ) {}

  async getSecret(path: string): Promise<Record<string, string>> {
    const response = await fetch(`${this.vaultAddr}/v1/secret/data/${path}`, {
      headers: { 'X-Vault-Token': this.token },
    })
    const { data } = await response.json()
    return data.data
  }
}

// Uso
const secrets = await vault.getSecret('production/database')
const dbUrl = secrets.DATABASE_URL
```

### Sealed Secrets (Kubernetes)

```yaml
# SealedSecret — secrets criptografados no git
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  encryptedData:
    DATABASE_URL: AgBy3i4OJSWK+PiTySYZZA9rO...
```

### Environment Injection

```yaml
# Docker Compose — secrets do host
services:
  app:
    env_file:
      - .env
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt

# GitHub Actions — secrets do repo
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Kubernetes

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myapp:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: DATABASE_URL
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service + Ingress

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp-service
                port:
                  number: 80
```

### HPA (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## Monitoring & Observability

### Health Check Endpoint

```ts
// api/health/route.ts
import { prisma } from '@/lib/db'

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }

  const healthy = Object.values(checks).every((c) => c !== 'error')

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  })
}

async function checkDatabase(): Promise<string> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return 'ok'
  } catch {
    return 'error'
  }
}
```

### Prometheus Metrics

```ts
import { Counter, Histogram, Gauge } from 'prom-client'

// Request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
})

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

// Business metrics
export const ordersCreated = new Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
})

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
})

// Middleware para coletar metricas automaticamente
function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpRequestDuration.startTimer({
    method: req.method,
    route: req.route?.path ?? 'unknown',
  })

  res.on('finish', () => {
    end({ status: String(res.statusCode) })
    httpRequestTotal.inc({
      method: req.method,
      route: req.route?.path ?? 'unknown',
      status: String(res.statusCode),
    })
  })

  next()
}
```

### Alerting Rules (Prometheus)

```yaml
# prometheus/alerts.yml
groups:
  - name: app-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate detected'
          description: 'Error rate is {{ $value }}% over the last 5 minutes'

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High latency detected'
          description: 'P95 latency is {{ $value }}s'

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'Pod is crash looping'
```

---

## Structured Logging

### Pino (recomendado — rápido)

```ts
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
  base: {
    service: 'myapp',
    version: process.env.APP_VERSION,
  },
})

// Uso
logger.info({ userId: '123', action: 'login' }, 'User logged in')
logger.error({ err: error, orderId: '456' }, 'Failed to process order')
```

### Correlation ID (Request Tracking)

```ts
// middleware/correlation.ts
import { randomUUID } from 'crypto'

function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const correlationId =
    (req.headers['x-correlation-id'] as string) || randomUUID()

  req.correlationId = correlationId
  res.setHeader('X-Correlation-ID', correlationId)

  // Logger com contexto de request
  req.log = logger.child({
    correlationId,
    method: req.method,
    path: req.url,
  })

  next()
}

// Uso em qualquer lugar
logger.info({ correlationId: req.correlationId }, 'Processing order')
```

### Log Levels

| Level   | Quando usar                      | Exemplo                        |
| ------- | -------------------------------- | ------------------------------ |
| `fatal` | Sistema vai parar                | Database connection lost       |
| `error` | Algo quebrou, precisa de atenção | Order processing failed        |
| `warn`  | Algo inesperado, mas não quebrou | Rate limit approaching         |
| `info`  | Eventos importantes do negócio   | Order created, user registered |
| `debug` | Informações para debugging       | Query executed, cache hit/miss |
| `trace` | Detalhes extremos                | Every function call            |

---

## Deploy Strategies

### Blue-Green Deploy

```yaml
# Dois ambientes idênticos: blue (atual) e green (novo)
# Traffic vai para blue; green é testado; depois traffic muda para green

# Strategy no Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
        - name: myapp
          image: myapp:v2.0.0
```

### Canary Deploy

```yaml
# 10% do traffic vai para a nova versão, 90% para a atual
# Se métricas estiverem OK, aumenta gradualmente

# Nginx Ingress - canary
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: 'true'
    nginx.ingress.kubernetes.io/canary-weight: '10'
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp-canary
                port:
                  number: 80
```

### Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/myapp

# Verificar histórico
kubectl rollout history deployment/myapp

# Rollback para versão específica
kubectl rollout undo deployment/myapp --to-revision=3
```

---

## Tips

- Usar multi-stage builds para imagens menores
- Nunca commitar secrets
- Usar GitHub Secrets para CI/CD
- Manter `.env.example` atualizado
- Health checks em todas as services
- Logs estruturados (JSON) em produção
- Rollback automático em falhas de deploy
- Secrets nunca em ConfigMap — usar Sealed Secrets ou Vault
- Liveness probe ≠ Readiness probe (liveness = "está vivo?", readiness = "está pronto?")
- HPA baseado em CPU E memory, não só um
- Canary deploy antes de blue-green para reduzir risco
- Correlation ID em todo request para tracing

---

## Skills relacionadas

- **`design-principles` (DRY, KISS, YAGNI, SOC)**: consultar ao decidir extrair templates ou avaliar duplicação. Extrair somente quando o mesmo padrão semântico se repete em 3+ locais e evolui como unidade (regra do 3) — código/config acidentalmente similar não é duplicação (DRY ≠ "não repetir conceitos"); duplicação intencional é preferível a abstração prematura (KISS/YAGNI).
- **`security-review`**: consultar ao revisar secrets, exposição de portas e hardening de imagens.
- **`observability`**: consultar ao definir logs, métricas e tracing.
