export const theme = {
  colors: {
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    },
    tertiary: {
      DEFAULT: 'hsl(var(--tertiary))',
      foreground: 'hsl(var(--tertiary-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    },
    success: {
      DEFAULT: 'hsl(var(--success))',
      foreground: 'hsl(var(--success-foreground))',
    },
    warning: {
      DEFAULT: 'hsl(var(--warning))',
      foreground: 'hsl(var(--warning-foreground))',
    },
    muted: {
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    },
    popover: {
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))',
    },
    card: {
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    },
    progress: {
      DEFAULT: 'hsl(var(--progress))',
      warning: 'hsl(var(--progress-warning))',
      danger: 'hsl(var(--progress-danger))',
    },
  },
} as const

export { theme as colors }

export const typography = {
  fontFamily: {
    sans: ['Exo2_400Regular', 'system-ui', 'sans-serif'],
    display: ['Exo2_600SemiBold', 'Exo2_700Bold', 'Exo2_400Regular', 'system-ui', 'sans-serif'],
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const
