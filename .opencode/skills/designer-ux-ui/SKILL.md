---
name: designer-ux-ui
description: Use when designing interfaces, creating design systems, building UI components, wireframes, prototypes, or making visual/UX decisions. Covers design tokens, component architecture, accessibility, responsive design, and interaction patterns. For implementing UIs with an existing design system (semantic HTML, WCAG) use frontend-patterns instead. Trigger on keywords like "design", "ux", "wireframe", "prototype", "design system", "tokens", "spacing", "color", "typography", "layout", "component library", "interaction", "visual decision".
---

# Designer UX/UI

Referência completa para design de interfaces, design systems e decisões visuais. O designer trabalha junto com o frontend-engineer para garantir consistência visual e experiência do usuário.

---

## Design Tokens

### Estrutura de Tokens

```ts
// tokens/core.ts
export const core = {
  color: {
    // Neutrals
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },
    // Brand
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  transition: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
} as const
```

### Design Tokens no CSS/Tailwind

```ts
// tailwind.config.ts
import { core } from './tokens/core'

export default {
  theme: {
    extend: {
      colors: {
        primary: core.color.primary,
        gray: core.color.gray,
        success: core.color.success,
        warning: core.color.warning,
        error: core.color.error,
      },
      spacing: core.spacing,
      borderRadius: core.radius,
      fontSize: core.fontSize,
      boxShadow: core.shadow,
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
    },
  },
}
```

---

## Component Architecture

### Design System Component Structure

```
src/
├── design-system/
│   ├── tokens/
│   │   └── core.ts
│   ├── primitives/           # Componentes atômicos
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   └── Icon/
│   ├── composites/           # Compostos de primitivos
│   │   ├── TextField/
│   │   ├── Select/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── DataTable/
│   └── patterns/             # Padrões de UI
│       ├── FormLayout/
│       ├── PageHeader/
│       ├── EmptyState/
│       └── ErrorBoundary/
```

### Button Component (Design System)

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500',
        ghost: 'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
        danger:
          'bg-error text-white hover:bg-red-700 focus-visible:ring-red-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}
```

### TextField Component (Composto)

```tsx
interface TextFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>

function TextField({ label, error, hint, required, disabled, id, ...props }: TextFieldProps) {
  const inputId = id || useId()

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-10 rounded-md border px-3 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          error
            ? "border-error focus:ring-error"
            : "border-gray-300 focus:ring-primary-500",
          disabled && "bg-gray-50 text-gray-500"
        )}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  )
}
```

### Card Component (Composição)

```tsx
function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)} {...props}>
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-b border-gray-200 px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-gray-200 px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

// Uso
<Card>
  <Card.Header>
    <h3 className="text-lg font-semibold">Titulo</h3>
  </Card.Header>
  <Card.Body>
    <p>Conteudo</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Salvar</Button>
  </Card.Footer>
</Card>
```

---

## Layout Patterns

### Responsive Grid

```tsx
// Grid responsivo com Tailwind
function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <StatCard title="Receita" value="R$ 12.345" />
      <StatCard title="Pedidos" value="156" />
      <StatCard title="Clientes" value="1.234" />
      <StatCard title="Conversão" value="3.2%" />
    </div>
  )
}
```

### Page Layout

```tsx
// Layout padrão de pagina
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <Navigation />
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

// PageHeader pattern
function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  )
}
```

### Sidebar + Content

```tsx
function SidebarLayout() {
  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
        <nav className="flex flex-col gap-1 p-4">
          <SidebarItem icon={<HomeIcon />} label="Dashboard" active />
          <SidebarItem icon={<UsersIcon />} label="Clientes" />
          <SidebarItem icon={<OrdersIcon />} label="Pedidos" />
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <PageContent />
      </main>
    </div>
  )
}
```

---

## Accessibility (a11y)

### Regras Essenciais

```tsx
// 1. Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/orders">Pedidos</a></li>
  </ul>
</nav>

// 2. ARIA labels em botoes sem texto
<button aria-label="Fechar modal">
  <CloseIcon />
</button>

// 3. Live regions para feedback dinamico
<div aria-live="polite" aria-atomic="true">
  {isLoading ? "Carregando..." : `${results.length} resultados encontrados`}
</div>

// 4. Focus trap em modais
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements?.[0]
      const lastElement = focusableElements?.[focusableElements.length - 1]

      firstElement?.focus()

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }

      modalRef.current?.addEventListener("keydown", handleTab)
      return () => modalRef.current?.removeEventListener("keydown", handleTab)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" ref={modalRef}>
      {children}
    </div>
  )
}

// 5. Cores com contraste sufficiente (WCAG AA)
// Texto normal: minimo 4.5:1
// Texto grande: minimo 3:1
// Usar ferramentas como WebAIM Contrast Checker
```

### Keyboard Navigation

```tsx
// Dropdown com navegacao por teclado
function Dropdown({ items, onSelect }: DropdownProps) {
  const [activeIndex, setActiveIndex] = useState(-1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        if (activeIndex >= 0) onSelect(items[activeIndex])
        break
      case 'Escape':
        onClose()
        break
    }
  }

  return (
    <ul role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          className={cn(index === activeIndex && 'bg-primary-50')}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

---

## Interaction Patterns

### Loading States

```tsx
// Skeleton loading
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="mt-4 space-y-3">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  )
}

// Spinner inline
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin text-current', className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
```

### Empty States

```tsx
function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-4">{icon}</div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// Uso
;<EmptyState
  icon={<ShoppingCartIcon className="h-8 w-8 text-gray-400" />}
  title="Nenhum pedido encontrado"
  description="Comece criando seu primeiro pedido."
  action={<Button>Criar Pedido</Button>}
/>
```

### Error States

```tsx
function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertTriangleIcon className="text-error h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Algo deu errado
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
```

### Form Validation UX

```tsx
// Validacao em tempo real
function SmartTextField({ name, validate, ...props }: SmartTextFieldProps) {
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (touched && validate) {
      setError(validate(value))
    }
  }

  const handleBlur = () => {
    setTouched(true)
    if (validate) {
      setError(validate(props.value as string))
    }
  }

  return (
    <TextField
      {...props}
      error={error || undefined}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  )
}

// Rules de UX para forms:
// 1. Labels sempre visíveis (nunca placeholder como label)
// 2. Mensagens de erro específicas ("Email inválido" não "Campo inválido")
// 3. Submit habilitado mesmo com erros (mostrar erros ao submeter)
// 4. Focus no primeiro campo com erro após submit
// 5. Botão de submit com loading state
// 6. Suporte a Enter para submeter
// 7. Auto-focus no primeiro campo (quando apropriado)
```

---

## Responsive Design

### Breakpoints (Tailwind Default)

```
sm: 640px    → Mobile landscape
md: 768px    → Tablet
lg: 1024px   → Desktop
xl: 1280px   → Large desktop
2xl: 1536px  → Extra large
```

### Mobile-First Pattern

```tsx
// Sempre comecar do mobile e escalar
function ResponsiveCard() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold">Titulo</h3>
        <p className="text-sm text-gray-500">Descricao</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Cancelar
        </Button>
        <Button size="sm">Confirmar</Button>
      </div>
    </div>
  )
}

// Tabela responsiva
function ResponsiveTable({ data }: { data: Item[] }) {
  return (
    <>
      {/* Desktop: tabela */}
      <table className="hidden md:table">
        <thead>...</thead>
        <tbody>...</tbody>
      </table>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {data.map((item) => (
          <Card key={item.id}>
            <Card.Body>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </Card.Body>
          </Card>
        ))}
      </div>
    </>
  )
}
```

---

## Color & Typography

### Hierarquia Visual

```
Heading 1: text-2xl font-bold text-gray-900     → Titulos de pagina
Heading 2: text-xl font-semibold text-gray-900  → Seções
Heading 3: text-lg font-medium text-gray-900    → Subseções
Body:      text-base text-gray-700              → Texto corrente
Small:     text-sm text-gray-500                → Metadados, captions
Label:     text-sm font-medium text-gray-700    → Labels de form
```

### Uso de Cor

```tsx
// Status colors — sempre usar com Background + Text
const statusColors = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
}

function StatusBadge({ status }: { status: keyof typeof statusColors }) {
  const colors = statusColors[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      {status}
    </span>
  )
}
```

---

## Regras

1. **Design tokens primeiro** — sempre definir tokens antes de componentes
2. **Consistencia** — seguir o design system, não inventar variações
3. **A11y não é opcional** — todo componente deve ser acessível por teclado e screen reader
4. **Mobile-first** — sempre começar pelo mobile e escalar
5. **Loading/Empty/Error** — todo componente de dados deve ter esses 3 estados
6. **Labels visíveis** — nunca usar placeholder como único label
7. **Contraste WCAG AA** — minimo 4.5:1 para texto normal
8. **Espaçamento consistente** — usar os tokens de spacing, não valores arbitrários
9. **Feedback imediato** — validação em tempo real, loading states, optimistic updates
10. **Componentes pequenos** — extrair e reaproveitar, não duplicar UI

## Referências cruzadas

- **`frontend-patterns`** — implementação semântica da UI (HTML, WCAG, responsividade) com o design system já definido.
- **`react-patterns`** — componentes React, composição e estado (base de implementação).
