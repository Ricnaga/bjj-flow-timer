---
name: design-principles
description: Use when writing, reviewing, or refactoring code and infrastructure configs (IaC, Dockerfile, docker-compose, CI/CD workflows). Covers YAGNI, SOC, KISS, and DRY principles, including template reuse. Trigger on keywords like "refactor", "yagni", "kiss", "dry", "soc", "design principles", "over-engineered", "abstraction", "code quality", "iac", "dockerfile", "workflow", "pipeline", "template reuse".
---

# Design Principles

Princípios de design que devem ser aplicados em todo o código.

## YAGNI — You Aren't Gonna Need It

Não implementar funcionalidades "porque pode ser útil no futuro". Implementar apenas o que for necessário agora.

**Aplicar quando:**

- Criar abstrações prematuras
- Adicionar features que ninguém pediu
- Criar "pontes" para cenários hipotéticos

**Exemplo errado:**

```tsx
// Criar um sistema de permissões completo quando só precisa de admin/user
type Permission = 'read' | 'write' | 'delete' | 'admin' | 'superadmin' | 'owner'
// 6 níveis de permissão quando só existem 2 roles reais
```

**Exemplo correto:**

```tsx
type Role = 'admin' | 'user'
// Só o que é necessário agora
```

---

## SOC — Separation of Concerns

Cada módulo, função ou componente deve ter **uma única responsabilidade**. Separar lógica de apresentação, negócio e dados.

**Aplicar quando:**

- Funções que fazem mais de uma coisa
- Componentes que misturam lógica e UI
- Arquivos muito grandes (>300 linhas)

**Exemplo errado:**

```tsx
async function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) =>
        setUsers(data.map((u) => ({ ...u, name: u.name.toUpperCase() }))),
      )
  }, [])

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
```

**Exemplo correto:**

```tsx
function useUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetchUsers().then(setUsers)
  }, [])
  return users
}

function formatUserName(name: string) {
  return name.toUpperCase()
}

function UserList() {
  const users = useUsers()
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{formatUserName(u.name)}</li>
      ))}
    </ul>
  )
}
```

---

## KISS — Keep It Simple, Stupid

Código deve ser o mais simples possível. Se uma solução complexa existe mas uma simples funciona, usar a simples.

**Aplicar quando:**

- Soluções over-engineered
- Abstrações desnecessárias
- Código que precisa de comentário pra explicar

**Exemplo errado:**

```tsx
abstract class ButtonFactory {
  abstract createButton(): Button
}

class PrimaryButtonFactory extends ButtonFactory {
  createButton() {
    return new PrimaryButton()
  }
}

// ... 50 linhas de código pra um botão
```

**Exemplo correto:**

```tsx
function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button className={cn('rounded px-4 py-2', variants[variant])} {...props}>
      {children}
    </button>
  )
}
```

---

## DRY — Don't Repeat Yourself

Lógica duplicada deve ser extraída para uma função, util ou componente reutilizável. Porém, **não confundir com "não repetir conceitos"** — código similar não é sempre duplicação.

**Aplicar quando:**

- O mesmo bloco aparece 3+ vezes
- Lógica de negócio repetida entre features
- Validações duplicadas

**Não aplicar quando:**

- Código é acidentalmente similar mas serve propósitos diferentes
- Extrair criaria um acoplamento desnecessário
- A "duplicação" é apenas sintática, não semântica

**Exemplo errado:**

```tsx
function processAnything(data: any, type: string, options: any) {
  if (type === 'user') {
    /* ... */
  }
  if (type === 'order') {
    /* ... */
  }
  if (type === 'product') {
    /* ... */
  }
}
```

**Exemplo correto:**

```tsx
function processUser(data: UserInput) {
  /* ... */
}
function processOrder(data: OrderInput) {
  /* ... */
}
function processProduct(data: ProductInput) {
  /* ... */
}
```
