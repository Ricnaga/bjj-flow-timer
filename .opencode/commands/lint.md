---
description: Roda lint, format check e typecheck no projeto ou diretório especificado.
agent: frontend-engineer
---

Execute as verificações de qualidade de código no projeto.

## Passos

1. Identificar o gerenciador de pacotes lendo o lockfile (pnpm neste projeto)
2. Rodar o linter: `pnpm lint`. Se $ARGUMENTS tiver um path, rodar `pnpm exec oxlint $ARGUMENTS`
3. Rodar verificação de formatação: `pnpm format:check`. Se $ARGUMENTS tiver um path, rodar `pnpm exec prettier --check $ARGUMENTS`
4. Rodar typecheck: `pnpm typecheck` (`tsc --noEmit`). O typecheck sempre roda em todo o projeto, pois o TypeScript precisa do contexto completo para validar tipos corretamente
5. Reportar resultados

## Saída esperada

- Reportar erros com arquivo/linha quando possível
- Sugerir correções com `pnpm lint:fix` e `pnpm format` quando aplicável
- Se tudo estiver limpo, confirmar com "Todas as verificações passaram"

## Notas

- Preferir sempre os scripts do `package.json`
- Seguir o setup do projeto: oxlint + prettier-plugin-tailwindcss + TypeScript
- Esse comando é manual - não segue a regra "somente staged files" dos hooks
