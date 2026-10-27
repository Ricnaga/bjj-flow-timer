---
description: Gera scaffold de uma screen/feature no Expo Router.
agent: frontend-engineer
---

Gere a estrutura completa de uma screen ou feature no projeto usando Expo Router.

## Argumentos

`$ARGUMENTS` deve conter o caminho da rota/feature (ex: `auth/login`, `profile/settings`, `(tabs)/home`).

## Passos

1. Analisar estrutura existente (`src/app/`, `src/components/`, `src/hooks/`, `src/utils/`)
2. Criar a rota em `src/app/` seguindo file-based routing do Expo Router
3. Seguir a convenção de organização: componentes/hooks/utils específicos da tela vão em subpastas `_*` dentro da rota; compartilhados vão em `src/`

## Convenção de organização

| Tipo                           | Local                                                                | Uso                                  |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| **Rotas/Telas**                | `src/app/**`                                                         | Sempre em rotas do Expo Router       |
| **Componentes da tela**        | `src/app/[rota]/_components/<nome-componente>/<nome-componente>.tsx` | Usado apenas naquela tela específica |
| **Componentes compartilhados** | `src/components/<nome-componente>/<nome-componente>.tsx`             | Usado em mais de uma tela            |
| **Hooks da tela**              | `src/app/[rota]/_hooks/<nome-hook>/<nome-hook>.ts`                   | Usado apenas naquela tela específica |
| **Hooks compartilhados**       | `src/hooks/<nome-hook>/<nome-hook>.ts`                               | Usado em mais de uma tela            |
| **Utils da tela**              | `src/app/[rota]/_utils/<nome-util>/<nome-util>.ts`                   | Usado apenas naquela tela específica |
| **Utils compartilhados**       | `src/utils/<nome-util>/<nome-util>.ts`                               | Usado em mais de uma tela            |

## Nomenclatura

- **Pastas e arquivos**: usar `kebab-case`
- **Componentes React**: nome da função/componente em `PascalCase`
- **Hooks**: pasta/arquivo com prefixo `use-` em `kebab-case`, função em `camelCase` com prefixo `use`
- **Utils**: `kebab-case` para pasta/arquivo, exports em `camelCase` quando aplicável
- **Route groups**: `(group)` e rotas dinâmicas `[param]` seguem convenções do Expo Router

## Estrutura padrão

### Rota simples

```
src/app/auth/login.tsx
```

### Rota com grupo (route group)

```
src/app/(auth)/
├── _layout.tsx
└── login.tsx
```

### Rota com componentes/hooks/utils específicos da tela

```
src/app/profile/settings/
├── index.tsx
├── _components/
│   └── settings-form/
│       └── settings-form.tsx
├── _hooks/
│   └── use-settings/
│       └── use-settings.ts
└── _utils/
    └── validate-settings/
        └── validate-settings.ts
```

### Componentes/hooks/utils compartilhados

```
src/components/button/button.tsx
src/hooks/use-auth/use-auth.ts
src/utils/format-date/format-date.ts
```

## Padrão da screen

```tsx
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-lg font-bold">Login</Text>
      </View>
    </SafeAreaView>
  )
}
```

## Regras

- **Rotas SEMPRE em `src/app/`** - nunca criar rotas fora de `src/app/`
- **Código não-rotas fora de `src/app/`** quando compartilhados
- **Se for usado APENAS naquela tela**: colocar em `src/app/[rota]/_components/`, `src/app/[rota]/_hooks/`, `src/app/[rota]/_utils/`
- **Se for usado em MAIS de uma tela**: colocar em `src/components/`, `src/hooks/`, `src/utils/`
- **Pasta do componente/hook/utils**: sempre criar pasta com nome igual ao arquivo (ex: `button/button.tsx`, `use-auth/use-auth.ts`)
- Usar NativeWind para estilização quando possível
- Usar TypeScript com tipos explícitos
- Seguir convenções já existentes no projeto
- Usar `Pressable` ao invés de `TouchableOpacity`, `FlatList` ao invés de `ScrollView` com map
- Usar `Link`, `router`, `useLocalSearchParams` do `expo-router` quando necessário
- Não gerar `loading.tsx`, `error.tsx`, `not-found.tsx` como padrão Next.js
- Não gerar Server Actions
- Respeitar route groups `(group)` quando apropriado
