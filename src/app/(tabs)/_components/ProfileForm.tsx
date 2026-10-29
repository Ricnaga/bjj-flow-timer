import { Modal, Pressable, Text, TextInput, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  timerProfileFormSchema,
  type TimerProfileFormValues,
} from '../../../schemas/timer-profile.schema'

interface ProfileFormProps {
  visible: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    prepTimeSeconds: number
    fightTimeSeconds: number
    restTimeSeconds: number
    rounds: number
    isInfinite: boolean
  }) => void
}

const defaultValues: TimerProfileFormValues = {
  name: '',
  prepTimeSeconds: 10,
  fightTimeSeconds: 300,
  restTimeSeconds: 60,
  rounds: 3,
  isInfinite: false,
}

export function ProfileForm({ visible, onClose, onSave }: ProfileFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(timerProfileFormSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  const isInfinite = watch('isInfinite')
  const rounds = watch('rounds')

  const onSubmit = (values: TimerProfileFormValues) => {
    onSave({
      name: values.name.trim(),
      prepTimeSeconds: values.prepTimeSeconds,
      fightTimeSeconds: values.fightTimeSeconds,
      restTimeSeconds: values.restTimeSeconds,
      rounds: values.isInfinite ? 0 : values.rounds,
      isInfinite: values.isInfinite,
    })
    reset(defaultValues)
    onClose()
  }

  const handleClose = () => {
    reset(defaultValues)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <View className="rounded-t-2xl bg-card p-4">
          <Text className="mb-3 font-sans text-lg text-foreground">
            Novo perfil
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  className="mb-1 rounded-lg border border-border px-3 py-2 text-foreground"
                  placeholder="Nome do perfil"
                  placeholderTextColor="#a1a1aa"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.name ? (
                  <Text className="mb-2 font-sans text-xs text-destructive">
                    {errors.name.message}
                  </Text>
                ) : (
                  <View className="mb-2" />
                )}
              </>
            )}
          />

          <View className="mb-1 flex-row gap-2">
            <Controller
              control={control}
              name="prepTimeSeconds"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground"
                  placeholder="Tempo inicial (seg)"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="numeric"
                  value={String(value)}
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                />
              )}
            />
            <Controller
              control={control}
              name="fightTimeSeconds"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground"
                  placeholder="Luta (seg)"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="numeric"
                  value={String(value)}
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                />
              )}
            />
          </View>
          <View className="mb-2 flex-row gap-2">
            {errors.prepTimeSeconds ? (
              <Text className="flex-1 font-sans text-xs text-destructive">
                {errors.prepTimeSeconds.message}
              </Text>
            ) : (
              <View className="flex-1" />
            )}
            {errors.fightTimeSeconds ? (
              <Text className="flex-1 font-sans text-xs text-destructive">
                {errors.fightTimeSeconds.message}
              </Text>
            ) : (
              <View className="flex-1" />
            )}
          </View>

          <Controller
            control={control}
            name="restTimeSeconds"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="mb-1 rounded-lg border border-border px-3 py-2 text-foreground"
                placeholder="Descanso (seg)"
                placeholderTextColor="#a1a1aa"
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
              />
            )}
          />
          {errors.restTimeSeconds ? (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.restTimeSeconds.message}
            </Text>
          ) : (
            <View className="mb-2" />
          )}

          <View className="mb-1 flex-row items-center gap-2">
            <Controller
              control={control}
              name="rounds"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground"
                  placeholder="Rounds"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="numeric"
                  value={isInfinite ? '0' : String(value)}
                  editable={!isInfinite}
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                />
              )}
            />
            <Pressable
              className="rounded-lg border border-border px-3 py-2"
              onPress={() => {
                const next = !isInfinite
                setValue('isInfinite', next)
                if (next) {
                  setValue('rounds', 0)
                } else if (rounds === 0) {
                  setValue('rounds', 3)
                }
              }}
            >
              <Text className="font-sans text-foreground">
                {isInfinite ? 'Infinito' : 'Fixo'}
              </Text>
            </Pressable>
          </View>
          {errors.rounds && !isInfinite ? (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.rounds.message}
            </Text>
          ) : (
            <View className="mb-2" />
          )}

          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 rounded-lg bg-tertiary px-4 py-3"
              onPress={handleClose}
            >
              <Text className="text-center font-sans text-tertiary-foreground">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-lg bg-primary px-4 py-3"
              onPress={() => void handleSubmit(onSubmit)()}
            >
              <Text className="text-center font-sans text-primary-foreground">
                Salvar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
