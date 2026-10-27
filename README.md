# BJJ Flow Timer

Aplicativo mobile para controle de tempo em treinos de Jiu-Jitsu (BJJ).

## Sobre

O BJJ Flow Timer é um aplicativo desenvolvido para auxiliar no controle de tempo durante os treinos de Jiu-Jitsu, permitindo gerenciar rounds, descansos e fluxos de treino de forma prática e intuitiva.

## Stack

- [Expo SDK 58](https://docs.expo.dev/) - Framework para desenvolvimento multiplataforma
- [React Native 0.88](https://reactnative.dev/) - Framework nativo
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Expo Router](https://docs.expo.dev/router/introduction/) - Navegação file-based
- [NativeWind v4](https://www.nativewind.dev/) - Tailwind CSS para React Native
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animações performáticas
- [Gluestack UI](https://ui.gluestack.io/) - Componentes UI acessíveis e estilizados
- [tailwind-variants](https://www.tailwind-variants.org/) - Variantes de componentes com Tailwind

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão compatível com Expo SDK 58)
- [pnpm](https://pnpm.io/) - Gerenciador de pacotes
- [Expo Go](https://expo.dev/go) ou emulador Android/iOS para desenvolvimento

## Instalação e Execução

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm start

# Rodar no Android
pnpm android

# Rodar no iOS
pnpm ios

# Rodar no navegador
pnpm web
```

## Scripts disponíveis

```bash
pnpm lint          # Verificar código com oxlint
pnpm lint:fix      # Corrigir problemas com oxlint
pnpm typecheck     # Verificar tipos TypeScript
pnpm format        # Formatar código com Prettier
pnpm format:check  # Verificar formatação
pnpm check         # Rodar lint + typecheck + format:check
```

## Estrutura do Projeto

```
src/
├── app/           # Rotas do Expo Router
├── components/    # Componentes reutilizáveis
├── hooks/         # Custom hooks
├── lib/           # Utilitários e configurações
└── utils/         # Funções utilitárias
```

## Convenções

- Rotas devem ficar exclusivamente em `src/app/`
- Componentes reutilizáveis em `src/components/`
- Utilizar NativeWind para estilização
- Usar `pnpm` para gerenciar dependências
- Seguir padrões mobile-first e otimizações de performance
- Evitar editar pastas `ios/` e `android/` manualmente (geradas via CNG)

## Licença

Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
