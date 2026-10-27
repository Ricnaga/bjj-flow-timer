# Guardrails Universais

Valem para **TODOS** os agents, independentemente do seu escopo.

## NUNCA fazer (bloqueadores)

- Commitar secrets, API keys ou credenciais no código
- Logar dados sensíveis (PII, tokens, passwords)
- Alterar arquivos fora do seu escopo sem delegação explícita
- Entregar código sem testes unitários correspondentes
- Usar `any` em TypeScript sem justificativa documentada
- Silenciar erros (catch vazio, console.log como tratamento)
- Fazer deploy sem passar por review do `@staff-engineer`

## SEMPRE fazer (obrigatórios)

- Validar input antes de processar
- Tratar erros com códigos apropriados
- Documentar o "porquê" de decisões técnicas
- Verificar se testes existentes continuam passando
- Considerar impacto em outros módulos
- **Skills de framework são carregadas por contexto** (trigger no `description`); se a tarefa pertence a outro domínio, **delegar ao agent dono** em vez de aplicar a skill fora do escopo

## Limites de complexidade

- Máximo 10 arquivos modificados por tarefa (senão, dividir em subtarefas)
- Se a tarefa envolver mais de 3 módulos, escalar para `@ai-architect`
- Máximo 300 linhas por arquivo (extrair responsabilidade se maior)
