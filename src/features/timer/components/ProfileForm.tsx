import { Modal, Pressable, Text, TextInput, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  timerProfileFormSchema,
  type TimerProfileFormValues,
} from '../../../schemas/timer-profile.schema'
import { TimeWheelPicker } from './TimeWheelPicker'

type OnSaveData = {
  name: string
  prepTimeSeconds: number
  fightTimeSeconds: number
  restTimeSeconds: number
  rounds: number
  isInfinite: boolean
}

interface ProfileFormProps {
  visible: boolean
  onClose: VoidFunction
  onSave: (data: OnSaveData) => void
}

const defaultValues: TimerProfileFormValues = {
  name: '',
  prepMin: 0,
  prepSec: 10,
  fightMin: 5,
  fightSec: 0,
  restMin: 1,
  restSec: 0,
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
  const prepMin = watch('prepMin') as number
  const prepSec = watch('prepSec') as number
  const fightMin = watch('fightMin') as number
  const fightSec = watch('fightSec') as number
  const restMin = watch('restMin') as number
  const restSec = watch('restSec') as number

  const onSubmit = (values: TimerProfileFormValues) => {
    const prepTimeSeconds = values.prepMin * 60 + values.prepSec
    const fightTimeSeconds = values.fightMin * 60 + values.fightSec
    const restTimeSeconds = values.restMin * 60 + values.restSec

    onSave({
      name: values.name.trim(),
      prepTimeSeconds,
      fightTimeSeconds,
      restTimeSeconds,
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

          <View className="mb-1 gap-1">
            <Text className="font-sans text-xs text-muted-foreground">
              Nome do perfil
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    className="rounded-lg border border-border px-3 py-2 text-foreground"
                    placeholder="Ex.: Aquecimento"
                    placeholderTextColor="#a1a1aa"
                    value={value}
                    onChangeText={onChange}
                  />
                  {errors.name ? (
                    <Text className="font-sans text-xs text-destructive">
                      {errors.name.message}
                    </Text>
                  ) : null}
                </>
              )}
            />
          </View>
          <View className="mb-2" />

          <TimeWheelPicker
            label="Tempo inicial"
            minutes={prepMin}
            seconds={prepSec}
            maxMinutes={10}
            onChangeMinutes={(value) => setValue('prepMin', value)}
            onChangeSeconds={(value) => setValue('prepSec', value)}
          />
          {(errors.prepMin || errors.prepSec) && (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.prepMin?.message || errors.prepSec?.message}
            </Text>
          )}
          {!(errors.prepMin || errors.prepSec) && <View className="mb-2" />}

          <TimeWheelPicker
            label="Tempo de luta"
            minutes={fightMin}
            seconds={fightSec}
            maxMinutes={60}
            onChangeMinutes={(value) => setValue('fightMin', value)}
            onChangeSeconds={(value) => setValue('fightSec', value)}
          />
          {(errors.fightMin || errors.fightSec) && (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.fightMin?.message || errors.fightSec?.message}
            </Text>
          )}
          {!(errors.fightMin || errors.fightSec) && <View className="mb-2" />}

          <TimeWheelPicker
            label="Tempo de descanso"
            minutes={restMin}
            seconds={restSec}
            maxMinutes={10}
            onChangeMinutes={(value) => setValue('restMin', value)}
            onChangeSeconds={(value) => setValue('restSec', value)}
          />
          {(errors.restMin || errors.restSec) && (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.restMin?.message || errors.restSec?.message}
            </Text>
          )}
          {!(errors.restMin || errors.restSec) && <View className="mb-2" />}

          <View className="mb-1 flex-row items-end gap-2">
            <View className="flex-1 gap-1">
              <Text className="font-sans text-xs text-muted-foreground">
                Número de rounds
              </Text>
              <Controller
                control={control}
                name="rounds"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="rounded-lg border border-border px-3 py-2 text-foreground"
                    placeholder="3"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="numeric"
                    value={isInfinite ? '0' : String(value)}
                    editable={!isInfinite}
                    onChangeText={(text) =>
                      onChange(text.replace(/[^0-9]/g, ''))
                    }
                  />
                )}
              />
            </View>
            <Pressable
              className="mb-0.5 rounded-lg border border-border px-3 py-2"
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
