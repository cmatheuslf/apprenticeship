import React, { useEffect, useState } from 'react';
import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform, View, Button, Text, FlatList } from 'react-native';
import BleManager from 'react-native-ble-manager';

const App = () => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

  useEffect(() => {
    BleManager.start({ showAlert: false });

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        .then((result) => {
          if (result) {
            console.log("Permissão de localização concedida.");
          } else {
            console.log("Permissão de localização negada.");
          }
        });
    }

    const handleDiscoverPeripheral = (peripheral) => {
      console.log('Dispositivo descoberto:', peripheral);
      setDevices((prevDevices) => {
        if (!prevDevices.some(device => device.id === peripheral.id)) {
          return [...prevDevices, peripheral];
        }
        return prevDevices;
      });
    };

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

    return () => {
      bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    };
  }, []);

  const startScan = () => {
    if (!scanning) {
      setDevices([]);
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scanning...');
          setScanning(true);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.name}</Text>
      <Button title="Conectar" onPress={() => connectToDevice(item.id)} />
    </View>
  );

  const connectToDevice = (id) => {
    BleManager.connect(id)
      .then(() => {
        console.log('Conectado ao dispositivo:', id);
      })
      .catch((error) => {
        console.error('Erro ao conectar:', error);
      });
  };

  return (
    <View>
      <Button title="Iniciar Scan" onPress={startScan} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default App;
