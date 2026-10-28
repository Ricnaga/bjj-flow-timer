import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { TimerProfile } from '../../lib/storage/profiles'

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/70">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-card h-[70%] rounded-t-2xl p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-foreground font-sans text-lg">Perfis</Text>
            <Pressable onPress={onClose}>
              <X color="#fafafa" size={20} />
            </Pressable>
          </View>
          <Pressable className="rounded-lg bg-primary px-4 py-3 mb-3" onPress={onCreate}>
            <Text className="text-primary-foreground font-sans text-center">Adicionar perfil</Text>
          </Pressable>
          <ScrollView className="flex-1">
            {profiles.map((profile) => (
              <View key={profile.id} className="rounded-lg border border-border p-3 mb-2">
                <Pressable onPress={() => onSelect(profile)}>
                  <Text className="text-foreground font-sans">{profile.name}</Text>
                  <Text className="text-muted-foreground font-sans text-sm mt-1">
                    Prep {Math.floor(profile.prepTimeSeconds / 60)}:{String(profile.prepTimeSeconds % 60).padStart(2, '0')} | Luta{' '}
                    {Math.floor(profile.fightTimeSeconds / 60)}:{String(profile.fightTimeSeconds % 60).padStart(2, '0')} | Descanso{' '}
                    {Math.floor(profile.restTimeSeconds / 60)}:{String(profile.restTimeSeconds % 60).padStart(2, '0')} |{' '}
                    {profile.isInfinite ? 'Infinito' : `${profile.rounds} rounds`}
                  </Text>
                </Pressable>
                <Pressable className="mt-2" onPress={() => onDelete(profile.id)}>
                  <Text className="text-destructive font-sans text-sm">Remover</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
