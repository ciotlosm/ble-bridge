var config = require('./config');
var mqtt = require('mqtt');

var client;
try {
    client = mqtt.connect(config.mqtt.host, config.mqtt.options);
}
catch (e) {
    client = mqtt.connect("mqtt://127.0.0.1");
}

var connected = false;

client.on('connect', function () {
    console.log("MQTT Connected");
    connected = true;

});

exports.send = function (topic, message) {
    if (connected) client.publish(topic, message);
};

function convertMessage(data) {
    data = data.toString();
    try {
        data = JSON.parse(data);
    } catch (e) {
        // if it's not parseable, we just use the string as-is
    }
    return data;
}