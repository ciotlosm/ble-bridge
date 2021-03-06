var perif = require('./ble').perif;
var config = require('./config');
var logHistory = [];

function getStatusText() {
    var status = '';
    status += logHistory.join("\n") + "\n\n";
    status += (new Date()).toString() + "\n\n";

    var connect_status = "[---------]";
    Object.keys(perif).forEach(function (key) {
        var now = new Date();
        if (perif[key].connected) {
            connect_status = "[Connected]";
            if (perif[key].has_known_ch) {
              connect_status = "[Receiving]";
            }
        }
        if (((now.getTime() - perif[key]["last_scan"].getTime()) / 1000) > 60) {
            connect_status = "[Stale >1m]"
        }
        status += connect_status + " " + perif[key].rssi + " [" + perif[key].address + "] " + key + " " + perif[key]["localName"] + "\n";
        if (config.show_details) {
            Object.keys(perif[key]["services"]).forEach(function (skey) {
                status += "                [" + perif[key]["services"][skey]["uuid"] + "] " + perif[key]["services"][skey]["name"] + "\n";
                Object.keys(perif[key]["services"][skey]["characteristics"]).forEach(function (ckey) {
                    status += "                  - [" + perif[key]["services"][skey]["characteristics"][ckey]["uuid"] + "] "
                        + "(" + perif[key]["services"][skey]["characteristics"][ckey]["properties"].join(",") + ") "
                        + perif[key]["services"][skey]["characteristics"][ckey]["name"] + "\n";
                });
            });
        }
    });
    return status;
}

function dumpStatus() {
    var status = '\033c'; // clear screen
    // get status text, and fit it to the screen
    status += getStatusText();
    console._log(status);
}

// -----------------------------------------

exports.init = function () {
    console._log = console.log;
    /** Replace existing console.log with something that'll let us
    report status alongside evrything else */
    console.log = function () {
        //var args = Array.from(arguments);
        var args = Array.prototype.slice.call(arguments);
        if (logHistory.length > 20)
            logHistory = logHistory.slice(-5);
        logHistory.push(args.join("\t"));
        dumpStatus();
    };

    // if we have no proper console, don't output status to stdout
    if (process.stdout.getWindowSize !== undefined)
        setInterval(dumpStatus, 1000);
};
exports.getStatusText = getStatusText;
