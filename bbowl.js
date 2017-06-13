#!/usr/bin/env node
require("./lib/config.js").init(); // Load configuration
require("./lib/ble.js"); // Enable Advertising packet discovery