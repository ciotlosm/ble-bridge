var perif = require('./ble').perif;
var logHistory = [];

function getStatusText(maxHeight) {
    // if no height specified, dump everything
    if (maxHeight === undefined)
        maxHeight = 1000;

    var status = '';
    status += logHistory.join("\n") + "\n\n";
    status += (new Date()).toString() + "\n\n";

    var amt = 3;
    Object.keys(perif).forEach(function (key) {
        if (++amt > maxHeight) { console.log("..."); return; }
        status += (perif[key].connected ? "[Connected] " : "[---------] ") + perif[key].rssi + " [" + perif[key].address + "] " + key + " " + perif[key]["localName"] + "\n";
        Object.keys(perif[key]["services"]).forEach(function (skey) {
                status += "                [" + perif[key]["services"][skey]["uuid"] + "] " + perif[key]["services"][skey]["name"] + "\n";
        });
    });
    return status;
}

function dumpStatus() {
    var status = '\033c'; // clear screen
    // get status text, and fit it to the screen
    status += getStatusText(process.stdout.getWindowSize()[1]);
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