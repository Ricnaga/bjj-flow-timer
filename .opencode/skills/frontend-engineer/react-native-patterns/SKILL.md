---
name: react-native-patterns
description: Use when working with React Native components, Expo, navigation, platform-specific code, native modules, or mobile UI patterns. Trigger on keywords like "react native", "expo", "react-native", "mobile", "ios", "android", "navigation", "react navigation", "expo router", " StyleSheet", "flatlist", "scrollview", "platform".
---

# React Native Patterns

Referência completa de padrões para React Native com Expo.

## Expo Setup

### Expo Router (recomendado)

```bash
npx create-expo-app@latest my-app --template tabs
```

```
app/
├── _layout.tsx          # Root layout
├── index.tsx            # Home
├── (tabs)/
│   ├── _layout.tsx      # Tab layout
│   ├── index.tsx        # Tab 1
│   └── explore.tsx      # Tab 2
├── modal.tsx            # Modal screen
└── +not-found.tsx       # 404
```

### Expo Config (`app.json`)

```json
{
  "expo": {
    "name": "my-app",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "plugins": ["expo-router", "expo-font"],
    "experiments": { "typedRoutes": true }
  }
}
```

## Component Patterns

### Componente Nativo Básico

```tsx
import { View, Text, StyleSheet } from 'react-native'

interface GreetingProps {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Olá, {name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  text: { fontSize: 18, fontWeight: '600' },
})
```

### Componente com Estado

```tsx
import { useState } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <Button title="Incrementar" onPress={() => setCount((c) => c + 1)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12 },
  count: { fontSize: 48, fontWeight: 'bold' },
})
```

### Lista com FlatList

```tsx
import { FlatList, View, Text, StyleSheet } from 'react-native'

interface Item {
  id: string
  title: string
}

interface ItemListProps {
  data: Item[]
}

export function ItemList({ data }: ItemListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  )
}

const styles = StyleSheet.create({
  item: { padding: 16 },
  title: { fontSize: 16 },
  separator: { height: 1, backgroundColor: '#eee' },
})
```

**Regras FlatList**:

- Sempre usar `keyExtractor` com ID único
- Nunca usar `ScrollView` com listas grandes (use `FlatList`)
- Usar `getItemLayout` quando items têm altura fixa para performance

### Input Controlado

```tsx
import { useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'

interface EmailInputProps {
  value: string
  onChangeText: (text: string) => void
  error?: string
}

export function EmailInput({ value, onChangeText, error }: EmailInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
  inputError: { borderColor: 'red' },
  error: { color: 'red', fontSize: 12 },
})
```

## Navigation

### Expo Router - Tabs

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
```

### Expo Router - Stack

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal', title: 'Detalhes' }}
      />
    </Stack>
  )
}
```

### Navegação entre telas

```tsx
import { useRouter } from 'expo-router'

export function ProductCard({ id }: { id: string }) {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.push(`/product/${id}`)}>
      <Text>Ver produto</Text>
    </Pressable>
  )
}
```

### Parâmetros de rota

```tsx
// app/product/[id].tsx
import { useLocalSearchParams } from 'expo-router'

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <Text>Produto: {id}</Text>
}
```

## Platform-Specific Code

### Arquivo separado por plataforma

```
components/
├── VideoPlayer.tsx         # Fallback compartilhado
├── VideoPlayer.ios.tsx    # Implementação iOS
└── VideoPlayer.android.tsx # Implementação Android
```

### Platform API

```tsx
import { Platform, StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
})
```

### Verificação inline

```tsx
import { Platform } from 'react-native'

export function Header() {
  return <Text>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
}
```

## Hooks Nativos

### useWindowDimensions

```tsx
import { useWindowDimensions } from 'react-native'

export function ResponsiveLayout() {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  return (
    <View style={{ flexDirection: isLandscape ? 'row' : 'column' }}>
      <View style={{ flex: 1 }}>
        <Text>Menu</Text>
      </View>
      <View style={{ flex: 2 }}>
        <Text>Content</Text>
      </View>
    </View>
  )
}
```

### useColorScheme

```tsx
import { useColorScheme, View, Text } from 'react-native'

export function ThemedCard() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View style={{ backgroundColor: isDark ? '#333' : '#fff', padding: 16 }}>
      <Text style={{ color: isDark ? '#fff' : '#000' }}>Temático</Text>
    </View>
  )
}
```

## Gestures

### Pressable (recomendado ao invés de TouchableOpacity)

```tsx
import { Pressable, Text, StyleSheet } from 'react-native'

export function Button({
  title,
  onPress,
}: {
  title: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  pressed: { opacity: 0.7 },
  text: { color: '#fff', textAlign: 'center', fontWeight: '600' },
})
```

## Performance

### FlatList Otimizada

```tsx
<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

### Memoização

```tsx
import { memo } from 'react'

export const ProductCard = memo(function ProductCard({
  product,
  onPress,
}: {
  product: Product
  onPress: (id: string) => void
}) {
  return (
    <Pressable onPress={() => onPress(product.id)}>
      <Text>{product.name}</Text>
    </Pressable>
  )
})
```

## Tips

- Usar Expo Router para navigation (não React Navigation manualmente)
- Preferir `Pressable` ao invés de `TouchableOpacity`
- `FlatList` para listas, nunca `ScrollView` com map
- Usar `StyleSheet.create` para estilos (melhor performance)
- Testar em ambos os platforms (iOS e Android)
- Usar `expo-font` para fonts customizadas
- Considerar `expo-haptics` para feedback tátil
- Usar `Platform.OS` ou arquivos separados para platform-specific code
