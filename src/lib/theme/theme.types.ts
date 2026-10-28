import type { theme, typography } from './theme'

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export type Theme = typeof theme
export type ThemeColors = typeof theme.colors
export type ColorToken = keyof ThemeColors
export type ColorPath = NestedKeyOf<ThemeColors>
export type Typography = typeof typography
export type FontFamily = keyof typeof typography.fontFamily
export type FontWeight = keyof typeof typography.fontWeight
