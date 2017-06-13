var CONFIG_FILENAME = "ble-bridge.json";

/// Load configuration
exports.init = function() {
  var fs = require("fs");
  if (fs.existsSync(CONFIG_FILENAME)) {
    var f = fs.readFileSync(CONFIG_FILENAME).toString();
    var json = {};
    try {
      json = JSON.parse(f);
    } catch (e) {
      console.log("Error parsing "+CONFIG_FILENAME+": "+e);
      return;
    }
    // Load settings
    exports.mqtt = json.mqtt;
    exports.services = json.services;
    console.log("Config loaded");
  } else {
    console.log("No "+CONFIG_FILENAME+" found");
  }
};
