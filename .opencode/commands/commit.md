---
description: Commita alterações em pt-br com conventional commits
---

Faça o commit das alterações seguindo estas regras:

1. **Idioma**: tudo em português brasileiro
2. **Conventional Commits**: use prefixos como `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `style:`
3. **Separe por contextos**: cada contexto diferente (ex: componente, página, hook, etc) deve ser um commit separado
4. **Commits atômicos**: cada commit deve conter apenas alterações de um mesmo contexto
5. **Escopo**: quando aplicável, use escopo após o prefixo para indicar o módulo afetado, ex: `feat(auth):`, `fix(api):`, `refactor(dashboard):`
6. **Formatação**: subject com no máximo 72 caracteres; se houver corpo, separar por linha em branco e limitar a 100 caracteres por linha
7. **Arquivos sensíveis**: nunca commitar `.env`, `*.key`, `*.pem`, `*credentials*`, `*secret*`; usar `.gitignore` ou variáveis de ambiente
8. **Hooks**: antes de commitar, rodar `npm run lint` e `npm test` (ou equivalente) se existirem hooks configurados no projeto

Antes de commitar, analise as alterações com `git status` e `git diff` para entender o que foi modificado e agrupar por contexto.
