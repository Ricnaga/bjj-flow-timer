# Bibliotecas do Projeto

Este arquivo registra as bibliotecas utilizadas pelo BJJ Flow Timer para que o agente tenha contexto ao iniciar.

## Core

| Biblioteca                                    | Versão   | Descrição                                                   |
| --------------------------------------------- | -------- | ----------------------------------------------------------- |
| [expo](https://docs.expo.dev/)                | ~58.0.19 | Framework para desenvolvimento React Native multiplataforma |
| [react](https://react.dev/)                   | 19.3.0   | Biblioteca UI                                               |
| [react-native](https://reactnative.dev/)      | 0.88.0   | Framework nativo para React                                 |
| [typescript](https://www.typescriptlang.org/) | ~6.0.3   | Tipagem estática                                            |

## Navegação (Expo Router)

| Biblioteca                                                                                    | Versão   | Descrição                                                          |
| --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| [expo-router](https://docs.expo.dev/router/introduction/)                                     | ^58.0.26 | Roteamento file-based para Expo/React Native (rotas em `src/app/`) |
| [expo-linking](https://docs.expo.dev/versions/latest/sdk/linking/)                            | ^58.0.14 | Deep linking e navegação por URL                                   |
| [expo-constants](https://docs.expo.dev/versions/latest/sdk/constants/)                        | ^58.0.13 | Acesso a constantes do sistema/app                                 |
| [react-native-screens](https://github.com/software-mansion/react-native-screens)              | ^4.30.0  | Otimização de telas nativas                                        |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | ^5.10.1  | Gerenciamento de safe areas                                        |

## UI e Estilização

| Biblioteca                                                                     | Versão  | Descrição                      |
| ------------------------------------------------------------------------------ | ------- | ------------------------------ |
| [nativewind](https://www.nativewind.dev/)                                      | ^4.2.7  | Tailwind CSS para React Native |
| [tailwindcss](https://tailwindcss.com/)                                        | ^3.4.19 | Framework CSS utility-first    |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) | ^4.7.1  | Animações performáticas        |
| [expo-status-bar](https://docs.expo.dev/versions/latest/sdk/status-bar/)       | ~58.0.4 | Controle da barra de status    |

## Desenvolvimento

| Biblioteca                                                                                 | Versão  | Descrição                                |
| ------------------------------------------------------------------------------------------ | ------- | ---------------------------------------- |
| [@types/react](https://www.npmjs.com/package/@types/react)                                 | ~19.3.0 | Tipagens para React                      |
| [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) | ^0.8.1  | Ordenação automática de classes Tailwind |

## Padrões do Projeto

- **Rotas:** Todas as telas ficam em `src/app/` (Expo Router). Arquivos fora de `src/app/` são para componentes, hooks, utils, etc.
- **Estilização:** Priorizar NativeWind (classes Tailwind). Usar `StyleSheet.create` quando necessário para estilos mais complexos ou dinâmicos.
- **Navegação:** Usar `Link`, `router`, `useLocalSearchParams` do `expo-router`
- **Plataformas:** Quando houver código específico de plataforma, usar arquivos `.ios.tsx` / `.android.tsx` ou `Platform.select()`
- **Performance:** Usar `FlatList` ao invés de `ScrollView` com map, `Pressable` ao invés de `TouchableOpacity`
- **Gerenciador:** Este projeto usa `pnpm` (presença de `pnpm-lock.yaml`)
