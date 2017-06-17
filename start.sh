# Restart bluetooth adapter before starting scanner to remove hanging connections from a bad stop
sudo hciconfig hci0 down
sudo hciconfig hci0 up
./index.js
