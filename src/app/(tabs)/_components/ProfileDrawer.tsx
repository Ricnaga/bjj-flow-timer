import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { TimerProfile } from '../../../lib/storage/profiles'

interface ProfileDrawerProps {
  visible: boolean
  profiles: TimerProfile[]
  onClose: () => void
  onSelect: (profile: TimerProfile) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export function ProfileDrawer({
  visible,
  profiles,
  onClose,
  onSelect,
  onCreate,
  onDelete,
}: ProfileDrawerProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="h-[70%] rounded-t-2xl bg-card p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-sans text-lg text-foreground">Perfis</Text>
            <Pressable onPress={onClose}>
              <X color="#fafafa" size={20} />
            </Pressable>
          </View>
          <Pressable
            className="mb-3 rounded-lg bg-primary px-4 py-3"
            onPress={onCreate}
          >
            <Text className="text-center font-sans text-primary-foreground">
              Adicionar perfil
            </Text>
          </Pressable>
          <ScrollView className="flex-1">
            {profiles.map((profile) => (
              <View
                key={profile.id}
                className="mb-2 rounded-lg border border-border p-3"
              >
                <Pressable onPress={() => onSelect(profile)}>
                  <Text className="font-sans text-foreground">
                    {profile.name}
                  </Text>
                  <Text className="mt-1 font-sans text-sm text-muted-foreground">
                    Prep {Math.floor(profile.prepTimeSeconds / 60)}:
                    {String(profile.prepTimeSeconds % 60).padStart(2, '0')} |
                    Luta {Math.floor(profile.fightTimeSeconds / 60)}:
                    {String(profile.fightTimeSeconds % 60).padStart(2, '0')} |
                    Descanso {Math.floor(profile.restTimeSeconds / 60)}:
                    {String(profile.restTimeSeconds % 60).padStart(2, '0')} |{' '}
                    {profile.isInfinite
                      ? 'Infinito'
                      : `${profile.rounds} rounds`}
                  </Text>
                </Pressable>
                <Pressable
                  className="mt-2"
                  onPress={() => onDelete(profile.id)}
                >
                  <Text className="font-sans text-sm text-destructive">
                    Remover
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
