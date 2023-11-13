import { BleClient, BleService } from '@capacitor-community/bluetooth-le';
import { ref, onMounted } from 'vue';
import { tempValue } from './values';
import { useStore } from 'vuex'



let deviceId = '';

const CO2_SERVICE = {
    uuid: '7C97BB04-3D69-47A2-83D9-485ECFFB58D1',
    characteristics: [
        {
            uuid: '61fac1c0-75c6-4216-a801-9241dea5eac6',
            properties: { notify: true },
            descriptors: [
                {
                    uuid: '6403a2c1-298a-4eca-b283-9df512beeae9',
                }
            ]
        }
    ]
};

const TEMP_CO2_SERVICE = {
    uuid: '7C97BB04-3D69-47A2-83D9-485ECFFB58D1',
    characteristics: [
        {
            uuid: '5dc1191f-0350-4799-a4a8-a9e0eb067335',
            properties: { notify: true, broadcast: true },
            descriptors: [
                {
                    uuid: '656e6636-b999-4250-903b-2211d5e465c1',
                }
            ]
        }
    ]
}

const PM10_SERVICE = {
    uuid: '7C97BB04-3D69-47A2-83D9-485ECFFB58D1',
    characteristics: [
        {
            uuid: '4ad5b788-47a5-483d-8a60-0368ccf4f9cc',
            properties: { notify: true, broadcast: true },
            descriptors: [
                {
                    uuid: 'b58f313d-6bc3-4730-af47-649b4e2af360',
                }
            ]
        }
    ]
};

const PM25_SERVICE = {
    uuid: '7C97BB04-3D69-47A2-83D9-485ECFFB58D1',
    characteristics: [
        {
            uuid: 'e46685f3-2b2c-4097-a7d2-b1898c95950f',
            properties: { notify: true, broadcast: true },
            descriptors: [
                {
                    uuid: '8e71c286-2681-4e1b-be54-3bd27f1d683d',
                }
            ]
        }
    ]
};

const TEMPERATURE_SERVICE = {
    uuid: '7C97BB04-3D69-47A2-83D9-485ECFFB58D1',
    characteristics: [
        {
            uuid: 'cac23601-128a-4790-832e-c182f4a02780',
            properties: { notify: true, broadcast: true },
            descriptors: [
                {
                    uuid: 'd0960df9-62e9-426f-84f0-3e34b7717a4c',
                }
            ]
        }
    ]
};

// Alle Services in einer Liste
const SERVICES = [
    CO2_SERVICE,
    TEMP_CO2_SERVICE,
    PM10_SERVICE,
    PM25_SERVICE,
    TEMPERATURE_SERVICE
];


export function useBluetooth() {
    let initialAutoConnect = false;
    const autoConnect = ref(initialAutoConnect);
    initialAutoConnect = localStorage.getItem('autoConnect') === 'true';
    const isConnected = ref(false);
    const services = ref<BleService[]>([]);
    const decoder = new TextDecoder('utf-8');
    let dataString = '';
    const store = useStore();


    const connectToSensor = async () => {
        try {
            console.log('connectToSensor aufgerufen');
            await BleClient.initialize();
            console.log('Initialisierung erfolgreich');
            const device = await BleClient.requestDevice({
                services: SERVICES.map(service => service.uuid),
            });
            deviceId = device.deviceId;
            console.log('Device angefragt:', device.deviceId);
            await BleClient.connect(device.deviceId);
            console.log('Gerät verbunden:', device.deviceId);
            services.value = await BleClient.getServices(device.deviceId);
            console.log('Services: ' + services.value);
            console.log('isConnected zu Beginn:', isConnected.value);

            const co2Characteristic = CO2_SERVICE.characteristics.find(
                (c) => c.uuid === '61fac1c0-75c6-4216-a801-9241dea5eac6'
            );

            // const allServices = await BleClient.getServices(device.deviceId);
            // console.log("Alle verfügbaren Dienste:", allServices);

            console.log('CO2_Characteristik?: ' + co2Characteristic?.uuid);
            if (co2Characteristic) {
                try {
                    BleClient.startNotifications(
                        device.deviceId,
                        CO2_SERVICE.uuid,
                        co2Characteristic.uuid,
                        (notifValue) => {
                            console.log('CO2_Benachrichtigung erhalten:');
                            dataString = decoder.decode(notifValue.buffer);
                            console.log('Daten als String:', dataString);
                            const value = parseFloat(dataString);
                            store.commit('addCo2Value', value);
                            store.commit('removeEmptyAndDuplicate');
                            console.log("Aktuelle Werte im Vuex-Store: " + store.state.co2Values);
                        }
                    );
                } catch (error) {
                    console.error('Fehler beim Starten der CO2-Benachrichtigungen:', error);
                }
            } else {
                console.error("CO2 charakteristik nicht gefunden");
            }

            const temp_co2Characteristic = TEMP_CO2_SERVICE.characteristics.find(
                (c) => c.uuid === '5dc1191f-0350-4799-a4a8-a9e0eb067335'
            );

            console.log('TEMP_CO2_Characteristik?: ' + temp_co2Characteristic?.uuid);
            if (temp_co2Characteristic) {
                try {
                    BleClient.startNotifications(
                        device.deviceId,
                        TEMP_CO2_SERVICE.uuid,
                        temp_co2Characteristic.uuid,
                        (notifValue) => {
                            console.log('TEMP_CO2_Benachrichtigung erhalten:');
                            dataString = decoder.decode(notifValue.buffer);
                            const value = parseFloat(dataString);
                            store.commit('addtempCo2Value', value);
                            store.commit('removeEmptyAndDuplicate');
                            console.log("Aktuelle Werte im Vuex-Store: " + store.state.temp_co2Values);
                        }
                    );
                } catch (error) {
                    console.error('Fehler beim Starten der TEMP_CO2-Benachrichtigungen:', error);
                }
            } else {
                console.error("TEMP_CO2 charakteristik nicht gefunden");
            }

            const pm10Characteristic = PM10_SERVICE.characteristics.find(
                (c) => c.uuid === '4ad5b788-47a5-483d-8a60-0368ccf4f9cc'
            );
            console.log('PM10_Characteristik?: ' + pm10Characteristic?.uuid);
            if (pm10Characteristic) {
                BleClient.startNotifications(
                    device.deviceId,
                    PM10_SERVICE.uuid,
                    pm10Characteristic.uuid,
                    (notifValue) => {
                        console.log('PM10_Benachrichtigung erhalten:');
                        dataString = decoder.decode(notifValue.buffer);
                        console.log('Daten als String:', dataString);
                        const value = parseFloat(dataString);
                        store.commit('addPM10Value', value);
                        store.commit('removeEmptyAndDuplicate');
                        console.log("Aktuelle Werte im Vuex-Store: " + store.state.pm10Values);
                    }
                );
            } else {
                console.error("PM10 Charakteristik nicht gefunden");
            }

            const pm25Characteristic = PM25_SERVICE.characteristics.find(
                (c) => c.uuid === 'e46685f3-2b2c-4097-a7d2-b1898c95950f'
            );
            console.log('PM25_Characteristik?: ' + pm10Characteristic?.uuid);
            if (pm25Characteristic) {
                BleClient.startNotifications(
                    device.deviceId,
                    PM25_SERVICE.uuid,
                    pm25Characteristic.uuid,
                    (notifValue) => {
                        console.log('PM25_Benachrichtigung erhalten:');
                        dataString = decoder.decode(notifValue.buffer);
                        console.log('Daten als String:', dataString);
                        const value = parseFloat(dataString);
                        store.commit('addPM25Value', value);
                        store.commit('removeEmptyAndDuplicate');
                        console.log("Aktuelle Werte im Vuex-Store: " + store.state.pm25Values);
                    }
                );
            } else {
                console.error("PM25 Charakteristik nicht gefunden");
            }

            const tempCharacteristic = TEMPERATURE_SERVICE.characteristics.find(
                (c) => c.uuid === 'cac23601-128a-4790-832e-c182f4a02780'
            );
            console.log('Temperature_Characteristik?: ' + tempCharacteristic?.uuid);
            if (tempCharacteristic) {
                BleClient.startNotifications(
                    device.deviceId,
                    TEMPERATURE_SERVICE.uuid,
                    tempCharacteristic.uuid,
                    (notifValue) => {
                        console.log('Temperature Benachrichtigung erhalten');
                        dataString = decoder.decode(notifValue.buffer);
                        console.log('Daten als String:', dataString);
                        const value = parseFloat(dataString);
                        tempValue.value = value;
                    }
                );
            } else {
                console.error("Temperature Charakteristik nicht gefunden");
            }
            isConnected.value = true;
            console.log('isConnected am Ende:', isConnected.value);

        } catch (error) {
            console.error('Verbindung fehlgeschlagen:', error);
        }
    }

    const disconnectFromSensor = async () => {
        isConnected.value = false;
        console.log("Verbindung getrennt.");
        await BleClient.disconnect(deviceId);
    }

    const connectIfAuto = async () => {
        if (autoConnect.value) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wartet 1 Sekunde
            await connectToSensor();
        }
    };

    onMounted(connectIfAuto);

    // Zustand der automatischen Verbindung umschalten
    const toggleAutoConnect = () => {
        localStorage.setItem('autoConnect', autoConnect.value.toString());
        console.log('autoConnect toggled, new value:', autoConnect.value);
    }

    return { isConnected, connectToSensor, disconnectFromSensor, toggleAutoConnect, autoConnect };
}