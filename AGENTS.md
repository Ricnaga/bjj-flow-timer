# BJJ Flow Timer

Aplicativo mobile para controle de tempo em treinos de Jiu-Jitsu (BJJ). Desenvolvido com Expo SDK 58, React Native 0.88, TypeScript e NativeWind v4.

## Stack

- **Framework:** [Expo](https://docs.expo.dev/) ~58.0.19 (SDK 58)
- **UI:** [React Native](https://reactnative.dev/) 0.88.0 + [NativeWind](https://www.nativewind.dev/) v4 + [Tailwind CSS](https://tailwindcss.com/) v3
- **Navegação:** [Expo Router](https://docs.expo.dev/router/introduction/) ^58.0.26 (file-based routing)
- **Animações:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) ^4.7.1
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) ~6.0.3
- **Gerenciador de pacotes:** pnpm

## Estrutura do Projeto

```
bjj-flow-timer/
├── src/
│   ├── app/           # Rotas do Expo Router (telas e layouts)
│   ├── components/    # Componentes reutilizáveis (UI kit)
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilitários, helpers e configurações
│   └── utils/         # Funções utilitárias
├── assets/            # Imagens, ícones e assets estáticos
├── app.json           # Configuração do Expo
└── global.css         # Estilos globais do Tailwind/NativeWind
```

**Regra importante:** Rotas ficam apenas em `src/app/`. Componentes, hooks, utils e demais lógica fora das rotas devem ir em `src/components/`, `src/hooks/`, `src/lib/`, `src/utils/`.

## Comandos

Use sempre `pnpm`. Para instalar pacotes com compatibilidade com o SDK do Expo, use `npx expo install`.

```bash
# Desenvolvimento
pnpm start              # Inicia o dev server do Expo
pnpm android            # Abre no Android
pnpm ios                # Abre no iOS
pnpm web                # Abre no navegador

# Qualidade de código
pnpm lint               # Roda oxlint
pnpm lint:fix           # Corrige problemas do oxlint
pnpm typecheck          # Verifica tipos com TypeScript
pnpm format             # Formata com Prettier
pnpm format:check       # Verifica formatação
pnpm check              # Roda lint + typecheck + format:check

# Expo
npx expo install <pkg>  # Instalar pacotes compatíveis com SDK 58
npx expo-doctor         # Diagnóstico de dependências
npx expo install --fix  # Corrigir versões incompatíveis
```

## Convenções

- **Estilização:** Priorizar NativeWind com classes Tailwind. Usar `StyleSheet.create` apenas quando necessário.
- **Navegação:** Usar `Link`, `router`, `useLocalSearchParams` do `expo-router`.
- **Componentes:** Seguir padrão de componentes reutilizáveis em `src/components/`. UI kit baseado em [react-native-reusables](https://rnr.show/).
- **Performance mobile-first:** Usar `FlatList` ao invés de `ScrollView` com `.map()`. Preferir `Pressable` ao invés de `TouchableOpacity`.
- **Plataforma específica:** Usar arquivos `.ios.tsx`/`.android.tsx` ou `Platform.select()` quando houver diferenças entre plataformas.
- **TypeScript:** Sempre tipado. Evitar `any`.
- **Imports:** Usar path aliases quando configurados.

## Expo - Avisos importantes

- **Nunca editar** pastas `ios/` e `android/` manualmente - são geradas automaticamente (CNG).
- **Expo Go** não inclui módulos nativos customizados. Após adicionar libs com código nativo, usar development build (`npx expo run:ios/android`) ou EAS Build.
- **Sempre checar docs da versão correta** do Expo SDK antes de usar APIs. Consultar `https://docs.expo.dev/versions/v58.0.0/`.
- **Antes de adicionar dependências:** Verificar se já existe algo no projeto e consultar skills disponíveis.

## UI Kit

Utilizamos **[react-native-reusables](https://rnr.show/)** - componentes copiados e colados, headless/accessíveis baseados em [rn-primitives](https://rn-primitives.vercel.app/), integrados com NativeWind e estilo similar ao shadcn/ui.
