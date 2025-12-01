import { View, Text, StyleSheet, Pressable, Image, Alert, PermissionsAndroid, Platform } from 'react-native'
import React, { useContext, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { EmblemContext } from '@/app/context/EmblemContext'
import BluetoothService from '@/app/services/BluetoothService'

const Options = () => {
  const {
    localEmblem,
    visitorEmblem,
    setLocalEmblem,
    setVisitorEmblem,
    resetEmblems
  } = useContext(EmblemContext)

  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  // Solicitar permisos de Bluetooth en Android
  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 11 o menor
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS maneja permisos automáticamente
  };

  // Conectar con el ESP32
  const handleBluetoothConnect = async () => {
    if (isConnected) {
      // Si ya está conectado, desconectar
      Alert.alert(
        'Desconectar',
        '¿Deseas desconectar el dispositivo Bluetooth?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desconectar',
            onPress: async () => {
              await BluetoothService.disconnect();
              setIsConnected(false);
              Alert.alert('Desconectado', 'Dispositivo Bluetooth desconectado');
            }
          }
        ]
      );
      return;
    }

    try {
      setIsScanning(true);

      // Solicitar permisos
      const hasPermissions = await requestBluetoothPermissions();
      if (!hasPermissions) {
        Alert.alert('Error', 'Se necesitan permisos de Bluetooth y ubicación');
        setIsScanning(false);
        return;
      }

      Alert.alert(
        'Buscando dispositivo',
        'Buscando "IndustriesMakunga"...',
        [{ text: 'OK' }]
      );

      // Escanear y buscar el dispositivo
      const device = await BluetoothService.scanForDevices();
      
      if (device) {
        console.log('Dispositivo encontrado:', device.name);
        
        // Conectar al dispositivo
        await BluetoothService.connect(device.id);
        
        setIsConnected(true);
        Alert.alert(
          'Conectado',
          `Conectado exitosamente a ${device.name}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error de Bluetooth:', error);
      Alert.alert(
        'Error',
        `No se pudo conectar al dispositivo: ${error.message}\n\nAsegúrate de que el ESP32 esté encendido y cerca.`
      );
    } finally {
      setIsScanning(false);
    }
  };

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
      
      <Pressable 
        style={[
          styles.bluetoothButton,
          isConnected && styles.bluetoothButtonConnected,
          isScanning && styles.bluetoothButtonScanning
        ]} 
        onPress={handleBluetoothConnect}
        disabled={isScanning}
      >
        <Text style={styles.bluetoothButtonText}>
          {isScanning 
            ? 'Buscando...' 
            : isConnected 
              ? '✓ Conectado - Toca para desconectar' 
              : 'Vincular con Bluetooth'}
        </Text>
      </Pressable>

      {isConnected && (
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>Dispositivo conectado</Text>
        </View>
      )}
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
  bluetoothButtonConnected: {
    backgroundColor: '#4CAF50', // Verde cuando está conectado
  },
  bluetoothButtonScanning: {
    backgroundColor: '#9E9E9E', // Gris cuando está escaneando
  },
  bluetoothButtonText: {
    fontWeight: '700',
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
})

export default Options