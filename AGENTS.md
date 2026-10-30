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

**Regra importante:** Rotas ficam **apenas** em `src/app/`.

O [Expo Router](https://docs.expo.dev/router/introduction/) escaneia **recursivamente** toda a pasta `app/` para montar a navegação. Qualquer arquivo `.tsx` ou `.ts` dentro dela é tratado como candidato a rota. Mesmo com pastas prefixadas por `_` (ex.: `_components`, `_hooks`), o router ainda pode escaneá-los em algumas versões e gerar warnings do tipo `missing the required default export` caso não tenham `export default` de um componente de rota.

Por esse motivo, **nunca** coloque componentes, hooks ou lógica exclusiva dentro de `app/`.

## Organização de pastas

| Caminho                              | Quando usar                                                                                                        | Exemplo                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `src/app/`                           | **Apenas rotas e configuração de navegação.** Deve conter `_layout.tsx`, telas e arquivos próprios do roteamento.  | `src/app/(tabs)/index.tsx`, `src/app/(tabs)/_layout.tsx` |
| `src/features/[feature]/components/` | Componentes **exclusivos** de uma feature/rota. Usados apenas por aquela tela específica.                          | `src/features/timer/components/ProfileForm.tsx`          |
| `src/features/[feature]/hooks/`      | Hooks **exclusivos** de uma feature/rota. Usados apenas por aquela tela específica.                                | `src/features/timer/hooks/useBjjTimer.ts`                |
| `src/components/`                    | Componentes **genéricos e reutilizáveis** entre múltiplas telas/features. UI kit sem lógica de negócio específica. | `src/components/timer/TimerControls.tsx`                 |
| `src/hooks/`                         | Hooks **genéricos e reutilizáveis** entre múltiplas telas/features. Lógica pura e sem acoplamento com uma feature. | `src/hooks/countdown/useCountdown.ts`                    |
| `src/lib/`                           | Configurações, clientes, storage, áudio, tema e integrações.                                                       | `src/lib/storage/profiles.ts`                            |
| `src/utils/`                         | Funções puramente utilitárias, sem estado ou side effects complexos.                                               | `src/utils/time.ts`                                      |

**Regra prática:** Se o componente/hook for usado **apenas** por uma única rota, coloque em `src/features/[feature]/`. Se puder ser usado por **duas ou mais rotas diferentes**, coloque em `src/components/` ou `src/hooks/`.

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
