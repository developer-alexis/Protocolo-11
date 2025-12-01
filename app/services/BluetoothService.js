// app/services/BluetoothService.js
import { BleManager } from 'react-native-ble-plx';

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const CHARACTERISTIC_UUID = 'abcd1234-5678-90ab-cdef-1234567890ab';
const DEVICE_NAME = 'IndustriesMakunga';

class BluetoothService {
  constructor() {
    this.manager = null;
    this.device = null;
    this.characteristic = null;
  }

  // Initialize manager only when needed
  getManager() {
    if (!this.manager) {
      this.manager = new BleManager();
    }
    return this.manager;
  }

  async scanForDevices(onDeviceFound) {
    const manager = this.getManager();
    
    return new Promise((resolve, reject) => {
      const devices = [];
      
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Error scanning:', error);
          reject(error);
          return;
        }

        if (device && device.name === DEVICE_NAME) {
          manager.stopDeviceScan();
          resolve(device);
        }

        if (device && device.name && !devices.find(d => d.id === device.id)) {
          devices.push(device);
          onDeviceFound && onDeviceFound(devices);
        }
      });

      setTimeout(() => {
        manager.stopDeviceScan();
        if (!this.device) {
          reject(new Error('Dispositivo no encontrado'));
        }
      }, 10000);
    });
  }

  async connect(deviceId) {
    try {
      const manager = this.getManager();
      console.log('Conectando al dispositivo:', deviceId);
      
      this.device = await manager.connectToDevice(deviceId);
      console.log('Conectado, descubriendo servicios...');
      
      await this.device.discoverAllServicesAndCharacteristics();
      console.log('Servicios descubiertos');
      
      this.characteristic = {
        serviceUUID: SERVICE_UUID,
        characteristicUUID: CHARACTERISTIC_UUID
      };

      return true;
    } catch (error) {
      console.error('Error al conectar:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.device) {
      try {
        await this.device.cancelConnection();
        this.device = null;
        this.characteristic = null;
        console.log('Desconectado');
      } catch (error) {
        console.error('Error al desconectar:', error);
      }
    }
  }

  async sendCommand(command) {
    if (!this.device || !this.characteristic) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      // Convert string to base64
      const commandBase64 = btoa(command);
      
      await this.device.writeCharacteristicWithResponseForService(
        this.characteristic.serviceUUID,
        this.characteristic.characteristicUUID,
        commandBase64
      );
      
      console.log('Comando enviado:', command);
    } catch (error) {
      console.error('Error al enviar comando:', error);
      throw error;
    }
  }

  isConnected() {
    return this.device !== null;
  }

  destroy() {
    if (this.manager) {
      this.manager.destroy();
    }
  }
}

export default new BluetoothService();