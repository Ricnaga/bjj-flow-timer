import { Modal, Pressable, Text, TextInput, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  timerProfileFormSchema,
  type TimerProfileFormValues,
} from '../../../schemas/timer-profile.schema'

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

          <View className="mb-1 gap-1">
            <Text className="font-sans text-xs text-muted-foreground">
              Tempo inicial
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 gap-1">
                <Text className="font-sans text-xs text-muted-foreground">
                  Minutos
                </Text>
                <Controller
                  control={control}
                  name="prepMin"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="rounded-lg border border-border px-3 py-2 text-foreground"
                      placeholder="0"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ''))
                      }
                    />
                  )}
                />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans text-xs text-muted-foreground">
                  Segundos
                </Text>
                <Controller
                  control={control}
                  name="prepSec"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="rounded-lg border border-border px-3 py-2 text-foreground"
                      placeholder="10"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ''))
                      }
                    />
                  )}
                />
              </View>
            </View>
          </View>
          {(errors.prepMin || errors.prepSec) && (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.prepMin?.message || errors.prepSec?.message}
            </Text>
          )}
          {!(errors.prepMin || errors.prepSec) && <View className="mb-2" />}

          <View className="mb-1 gap-1">
            <Text className="font-sans text-xs text-muted-foreground">
              Tempo de luta
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 gap-1">
                <Text className="font-sans text-xs text-muted-foreground">
                  Minutos
                </Text>
                <Controller
                  control={control}
                  name="fightMin"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="rounded-lg border border-border px-3 py-2 text-foreground"
                      placeholder="5"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ''))
                      }
                    />
                  )}
                />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans text-xs text-muted-foreground">
                  Segundos
                </Text>
                <Controller
                  control={control}
                  name="fightSec"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="rounded-lg border border-border px-3 py-2 text-foreground"
                      placeholder="0"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ''))
                      }
                    />
                  )}
                />
              </View>
            </View>
          </View>
          {(errors.fightMin || errors.fightSec) && (
            <Text className="mb-2 font-sans text-xs text-destructive">
              {errors.fightMin?.message || errors.fightSec?.message}
            </Text>
          )}
          {!(errors.fightMin || errors.fightSec) && <View className="mb-2" />}

          <View className="mb-1 gap-1">
            <Text className="font-sans text-xs text-muted-foreground">
              Tempo de descanso
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 gap-1">
                <Text className="font-sans text-xs text-muted-foreground">
                  Minutos
                </Text>
                <Controller
                  control={control}
                  name="restMin"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="rounded-lg border border-border px-3 py-2 text-foreground"
                      placeholder="1"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ''))
                      }
                    />
                  )}
                />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans text-xs text-muted-foreground">
                  Segundos
                </Text>
                <Controller
                  control={control}
                  name="restSec"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="rounded-lg border border-border px-3 py-2 text-foreground"
                      placeholder="0"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ''))
                      }
                    />
                  )}
                />
              </View>
            </View>
          </View>
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
