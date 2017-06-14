# BLE to MQTT
Bluetooh Low Energy to MQTT bridge for Raspberry Pi3

## Setup
Get the project and install required dependencies
```
git clone git@github.com:ciotlosm/ble-bridge.git
cd ble-bridge
npm install
```

Update your configuration by using the example
```
cp ble-bridge.json.example ble-bridge.json
```

Update ble-bridge.json to fit your mqtt settings
```
"mqtt": {
    "host": "mqtts://example.duckdns.org",
    "options": {
        "username": "example_user",
        "password": "example_pass"
    }
}
```

## Manual startup
```
./index.js
```

## Autostart 
Copy ble-bridge.service file to /etc/systemd/system/ble-bridge.service and then:
```
sudo systemctl enable ble-bridge.service
sudo systemctl start ble-bridge.service
```

## Notes
This project was inspired by two other projects:
- https://github.com/espruino/EspruinoHub
- https://github.com/kartben/ble-uart-to-udp