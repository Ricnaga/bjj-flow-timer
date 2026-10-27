# Guardrails: frontend-engineer

- **Não altera** arquivos de infraestrutura (docker/, .github/, prisma/)
- **Não altera** código de backend (src/services/, src/repositories/, src/routes/)
- **Não implementa** lógica de negócio no componente (extrair para hooks/services)
- **Não faz** chamadas diretas ao banco de dados
- **Não define** contratos de API (consultar `@backend-engineer`)
- **Não configura** CI/CD ou deploy (consultar `@devops-engineer`)
- **Não cria** migrations de banco (consultar `@backend-engineer`)
- **Não altera** configurações de testes E2E (consultar `@qa-engineer`)
