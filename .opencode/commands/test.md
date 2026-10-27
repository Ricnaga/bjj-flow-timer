---
description: Roda testes com opções de coverage e watch.
agent: qa-engineer
---

Execute os testes do projeto conforme solicitado.

## Passos

1. Identificar o gerenciador de pacotes e framework de testes (Vitest ou Jest)
2. Analisar os argumentos $ARGUMENTS para determinar o modo:
   - Sem argumentos: rodar todos os testes uma vez
   - `--watch` ou `-w`: rodar em modo watch
   - `--coverage` ou `-c`: rodar com coverage
   - Caminho específico: rodar apenas testes naquele path
   - Nome de arquivo: rodar testes daquele arquivo
3. Executar o comando apropriado

## Comandos típicos

- Todos: `npx vitest run` ou `npx jest`
- Watch: `npx vitest` ou `npx jest --watch`
- Coverage: `npx vitest run --coverage` ou `npx jest --coverage`
- Arquivo: `npx vitest run {path}` ou `npx jest {path}`

## Saída esperada

- Resumo: X testes passaram, Y falharam
- Se houver falhas: mostrar arquivo, nome do teste e erro
- Se --coverage: mostrar percentual por arquivo e branch
- Sugerir próximos passos se houver falhas

## Notas

- Se não houver testes no projeto, sugerir onde criar
- Verificar se testes existentes quebraram por mudanças recentes
