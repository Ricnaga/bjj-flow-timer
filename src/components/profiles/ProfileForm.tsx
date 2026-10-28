import { Modal, Pressable, Text, TextInput, View } from 'react-native'
import { useState } from 'react'

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

export function ProfileForm({ visible, onClose, onSave }: ProfileFormProps) {
  const [name, setName] = useState('')
  const [prepMin, setPrepMin] = useState('0')
  const [prepSec, setPrepSec] = useState('10')
  const [fightMin, setFightMin] = useState('5')
  const [fightSec, setFightSec] = useState('0')
  const [restMin, setRestMin] = useState('1')
  const [restSec, setRestSec] = useState('0')
  const [rounds, setRounds] = useState('3')
  const [isInfinite, setIsInfinite] = useState(false)

  const handleSave = () => {
    if (!name.trim()) {
      return
    }

    const prepTimeSeconds = (Number(prepMin) || 0) * 60 + (Number(prepSec) || 0)
    const fightTimeSeconds = (Number(fightMin) || 0) * 60 + (Number(fightSec) || 0)
    const restTimeSeconds = (Number(restMin) || 0) * 60 + (Number(restSec) || 0)
    const roundsValue = isInfinite ? 0 : Number(rounds) || 1

    onSave({
      name: name.trim(),
      prepTimeSeconds,
      fightTimeSeconds,
      restTimeSeconds,
      rounds: roundsValue,
      isInfinite,
    })

    setName('')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-card rounded-t-2xl p-4">
          <Text className="text-foreground font-sans text-lg mb-3">Novo perfil</Text>
          <TextInput
            className="rounded-lg border border-border px-3 py-2 text-foreground mb-3"
            placeholder="Nome do perfil"
            placeholderTextColor="#a1a1aa"
            value={name}
            onChangeText={setName}
          />
          <View className="flex-row gap-2 mb-2">
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Prep min" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={prepMin} onChangeText={setPrepMin} />
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Prep seg" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={prepSec} onChangeText={setPrepSec} />
          </View>
          <View className="flex-row gap-2 mb-2">
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Luta min" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={fightMin} onChangeText={setFightMin} />
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Luta seg" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={fightSec} onChangeText={setFightSec} />
          </View>
          <View className="flex-row gap-2 mb-2">
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Descanso min" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={restMin} onChangeText={setRestMin} />
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Descanso seg" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={restSec} onChangeText={setRestSec} />
          </View>
          <View className="flex-row gap-2 mb-3 items-center">
            <TextInput className="flex-1 rounded-lg border border-border px-3 py-2 text-foreground" placeholder="Rounds" placeholderTextColor="#a1a1aa" keyboardType="numeric" value={rounds} onChangeText={setRounds} editable={!isInfinite} />
            <Pressable className="rounded-lg border border-border px-3 py-2" onPress={() => setIsInfinite(!isInfinite)}>
              <Text className="text-foreground font-sans">{isInfinite ? 'Infinito' : 'Fixo'}</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            <Pressable className="flex-1 rounded-lg bg-tertiary px-4 py-3" onPress={onClose}>
              <Text className="text-tertiary-foreground font-sans text-center">Cancelar</Text>
            </Pressable>
            <Pressable className="flex-1 rounded-lg bg-primary px-4 py-3" onPress={handleSave}>
              <Text className="text-primary-foreground font-sans text-center">Salvar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
