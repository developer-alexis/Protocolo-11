import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import React, { useContext } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { EmblemContext } from '@/app/context/EmblemContext'

const Options = () => {
  const {
    localEmblem,
    visitorEmblem,
    setLocalEmblem,
    setVisitorEmblem,
    resetEmblems
  } = useContext(EmblemContext)

  const pickImage = async (setter) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted)
      return alert('Se necesita permiso para acceder a la galería')

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setter({ uri: result.assets[0].uri })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opciones</Text>

      <View style={styles.row}>
        <Image source={localEmblem} style={styles.teamLogo} />
        <Pressable style={styles.button} onPress={() => pickImage(setLocalEmblem)}>
          <Text style={styles.buttonText}>Cambiar escudo Local</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Image source={visitorEmblem} style={styles.teamLogo} />
        <Pressable style={styles.button} onPress={() => pickImage(setVisitorEmblem)}>
          <Text style={styles.buttonText}>Cambiar escudo Visitante</Text>
        </Pressable>
      </View>

      <Pressable style={styles.resetButton} onPress={resetEmblems}>
        <Text style={styles.resetButtonText}>Restablecer escudos</Text>
      </Pressable>

      <Pressable style={styles.bluetoothButton}>
        <Text style={styles.bluetoothButtonText}>Vincular con Bluetooth</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  teamLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 20,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  bluetoothButton: {
    backgroundColor: 'orange',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  bluetoothButtonText: {
    fontWeight: '700',
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
})

export default Options