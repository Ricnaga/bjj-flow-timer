---
description: Audita todo o codebase em busca de componentes, hooks, utils e services duplicados
agent: staff-engineer
---

Realize uma auditoria completa deste projeto.

Siga o workflow do skill `codebase-audit` no modo completo:

1. Mapeie todos os arquivos fonte com glob (`**/*.{tsx,ts,jsx}`)
2. Catalogue exports de cada arquivo (componentes, hooks, utils, services, types)
3. Identifique duplicações (mesmo nome, assinatura similar, lógica copiada)
4. Ao analisar duplicações, consulte também o skill `design-principles` (DRY, KISS, YAGNI, SOC) para embasar as recomendações
5. Gere relatório consolidado com:
   - Resumo (total de arquivos, componentes, hooks, etc.)
   - Duplicações encontradas (com localização, similaridade e recomendação)
   - Componentes únicos (sem duplicação)
   - Resumo de ações sugeridas
6. Pergunte ao usuário se deseja refatorar para centralizar alguma duplicação
