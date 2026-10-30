import { z } from 'zod'

export const timerProfileFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome do perfil'),
    prepMin: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(0, 'Deve ser maior ou igual a 0')
      .max(10, 'Máximo de 10 minutos'),
    prepSec: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(0, 'Deve ser maior ou igual a 0')
      .max(59, 'Máximo de 59 segundos'),
    fightMin: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(0, 'Deve ser maior ou igual a 0')
      .max(60, 'Máximo de 60 minutos'),
    fightSec: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(0, 'Deve ser maior ou igual a 0')
      .max(59, 'Máximo de 59 segundos'),
    restMin: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(0, 'Deve ser maior ou igual a 0')
      .max(10, 'Máximo de 10 minutos'),
    restSec: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(0, 'Deve ser maior ou igual a 0')
      .max(59, 'Máximo de 59 segundos'),
    rounds: z.coerce
      .number()
      .int('Deve ser um número inteiro')
      .min(1, 'Deve ser maior ou igual a 1')
      .max(99, 'Máximo de 99 rounds'),
    isInfinite: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const fightTotal = data.fightMin * 60 + data.fightSec
    if (fightTotal < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tempo de luta deve ser maior que 0',
        path: ['fightSec'],
      })
    }
    if (fightTotal > 3600) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Máximo de 60 minutos',
        path: ['fightMin'],
      })
    }
  })

export type TimerProfileFormValues = z.infer<typeof timerProfileFormSchema>
