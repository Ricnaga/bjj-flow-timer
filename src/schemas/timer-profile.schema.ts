import { z } from 'zod'

export const timerProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do perfil'),
  prepTimeSeconds: z.coerce
    .number()
    .int('Deve ser um número inteiro')
    .min(0, 'Deve ser maior ou igual a 0')
    .max(600, 'Máximo de 600 segundos'),
  fightTimeSeconds: z.coerce
    .number()
    .int('Deve ser um número inteiro')
    .min(1, 'Deve ser maior que 0')
    .max(3600, 'Máximo de 3600 segundos'),
  restTimeSeconds: z.coerce
    .number()
    .int('Deve ser um número inteiro')
    .min(0, 'Deve ser maior ou igual a 0')
    .max(600, 'Máximo de 600 segundos'),
  rounds: z.coerce
    .number()
    .int('Deve be um número inteiro')
    .min(1, 'Deve be o melhor que 1')
    .max(99, 'Máximo de 99 rounds'),
  isInfinite: z.boolean(),
})

export type TimerProfileFormValues = z.infer<typeof timerProfileFormSchema>
