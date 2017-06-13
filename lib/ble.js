#!/usr/bin/env node
var noble = require('noble');
var settings = require('./config');
var mqttclient = require('./mqttclient');


var perif,
    uids = [];

function publishCharacteristic(device, service, ch) {
    Object.keys(ch).forEach(function (chkey) {
        ch[chkey].notify(true);
        ch[chkey].on('data', function (buff) {
            mqttclient.send("/ble/" + device + "/" + service + "/" + chkey, parseInt(buff.toString('hex'), 16).toString());
        });
    });
}

process.on('exit', function () {
    console.log("goodbye, disconnecting...");
    if (perif != null) {
        console.log("goodbye, disconnecting...");
        perif.forEach(function (peripheral) {
            peripheral.once('disconnect');
        });
    }
})

noble.on('stateChange', function (state) {
    console.log("bluetooth state: [" + state + "]")
    if (state === "poweredOn") {
        noble.startScanning(uids, true, function (error) {
            if (!error) {
                console.log("scanning for bluetooth le devices...")
            } else {
                console.log("problems during scanning for bluetooth le devices: " + error)
            }
        })
    }
})

noble.on('discover', function (p) {
    perif = perif || [];
    perif.push(p);

    console.log("found " + p.advertisement.localName + " " + p.address)

    console.log("trying to connect to " + p.advertisement.localName + "[" + p.address + "]")
    noble.stopScanning(function (error) {
        if (!error) {
            console.log("stopped scanning for bluetooth le devices...")
        } else {
            console.log("problems during stopping of scanning for bluetooth le devices: " + error)
        }
    });
    p.connect(function (error) {
        if (!error) {
            console.log("conected to " + p.advertisement.localName + "[" + p.address + "]")
            p.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
                if (!error) {
                    services.forEach(function (s, serviceId) {
                        Object.keys(settings.services).forEach(function (key) {
                            var known_characteristics;
                            if (s.uuid == settings.services[key].id) {
                                console.log("Found " + key + " service on " + p.advertisement.localName + "[" + p.address + "]");
                                s.characteristics.forEach(function (ch, charId) {
                                    Object.keys(settings.services[key]["characteristics"]).forEach(function (chkey) {
                                        if (ch.uuid === settings.services[key]["characteristics"][chkey]) {
                                            console.log("Found " + chkey + " characteristic on " + p.advertisement.localName + "[" + p.address + "]")
                                            known_characteristics = known_characteristics || {};
                                            known_characteristics[chkey] = ch;
                                        }
                                    })
                                })
                            }
                            if (known_characteristics != null) {
                                // action
                                publishCharacteristic(p.address, key, known_characteristics);
                            }
                        });
                    })

                } else {
                    console.log("Could not discover services for " + p.advertisement.localName + "[" + p.address + "]: " + error);
                }


                //    ready(chrRead, chrWrite)
            })
        }
        else {
            // console.log("Could not connect to " + p.advertisement.localName + "[" + p.id + "]: " + error);
        }
        noble.startScanning(uids, true, function (error) {
            if (!error) {
                console.log("scanning for bluetooth le devices...")
            } else {
                console.log("problems during scanning for bluetooth le devices: " + error)
            }
        })
    })
})