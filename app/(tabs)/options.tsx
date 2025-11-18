import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import React from 'react'

const Options = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opciones</Text>

      <View style={styles.actions}>

        <Pressable style={styles.optionButton}>
          <Text style={styles.optionText}>Cambiar escudo Local</Text>
        </Pressable>

        <Pressable style={styles.optionButton}>
          <Text style={styles.optionText}>Cambiar escudo Visitante</Text>
        </Pressable>

        <Pressable style={styles.bluetoothButton}>
          <Text style={styles.bluetoothText}>Vincular con Bluetooth</Text>
        </Pressable>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },

  title: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 40,
  },

  actions: {
    width: '100%',
    alignItems: 'center',
  },

  optionButton: {
    backgroundColor: 'black',
    width: 260,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 25,
  },

  optionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  bluetoothButton: {
    backgroundColor: 'orange',
    width: 260,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 10,
  },

  bluetoothText: {
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 18,
  },
})

export default Options