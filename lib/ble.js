var noble = require('noble');
var settings = require('./config');
var mqttclient = require('./mqttclient');


var perif = {};

function publishCharacteristic(device, service, ch) {
    Object.keys(ch).forEach(function (chkey) {
        ch[chkey].notify(true);
        ch[chkey].on('data', function (buff) {
            mqttclient.send("/ble/" + device + "/" + service + "/" + chkey, buff.toString('hex'));
        });
    });
}

process.on('exit', function () {
    console.log("goodbye, disconnecting...");
    if (perif != null) {
      Object.keys(perif).forEach(function (key) {
      	console.log("goodbye, disconnecting ...");
     	 	perif[key]["p"].disconnect();
      });
    }
})

noble.on('stateChange', function (state) {
    console.log("[Bluetooth] " + state);
    if (state === "poweredOn") {
        noble.startScanning(settings.uids, true, function (error) { // allow duplicates to receive rssi updates
            if (!error) {
                console.log("[Bluetooth] scanning ...")
            } else {
                console.log("[Bluetooth] problems during scanning: " + error)
            }
        })
    }
})

noble.on('discover', function (p) {
    var id = p.id;
    if (p.address == "unknown") p.address = "--:--:--:--:--:--" // mac osx unknown better formatting 
    perif[id] = perif[id] || {};
    perif[id]["p"] = p; // push to object for console status display
    perif[id]["services"] = perif[id]["services"] || {}; // create empty services object to add services based on uuid
    perif[id]["address"] = p.address;
    perif[id]["rssi"] = p.rssi;
    perif[id]["last_scan"] = new Date();
    perif[id]["localName"] = p.advertisement.localName;
    if (!perif[id]["connected"]) {
        perif[id]["has_known_ch"] = false;
        p.connect(function (error) {
            if (!error) {
                perif[id]["connected"] = true; // mark current peripheral as connected
                p.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
                    if (!error) {
                        services.forEach(function (s, serviceId) {
                            perif[id]["services"][serviceId] = s;
                            Object.keys(settings.services).forEach(function (key) {
                                var known_characteristics;
                                if (s.uuid == settings.services[key].id) {                                    
                                    s.characteristics.forEach(function (ch, charId) {
                                        Object.keys(settings.services[key]["characteristics"]).forEach(function (chkey) {
                                            if (ch.uuid === settings.services[key]["characteristics"][chkey]) {
            																		perif[id]["has_known_ch"] = true;
                                                known_characteristics = known_characteristics || {};
                                                known_characteristics[chkey] = ch;
                                            }
                                        })
                                    })
                                }
                                if (known_characteristics != null) {
                                    publishCharacteristic(p.address, key, known_characteristics);
                                }
                            });
                        })
                    } else {
                        console.log("[Bluetooth] Could not discover services for: " + perif[id] + " " + error);
                    }
                })
                p.once("disconnect", function () {
                    perif[id]["connected"] = false; // mark peripheral as disconnected to reflect in status
                    perif[id]["rssi"] = "---";
                })
            }
            else {
                if (error != "Error: Peripheral already connected") {
                    console.log("[Bluetooth] Could not connect to " + id + " " + error);
                }
            }
        })
    }
})

exports.perif = perif
