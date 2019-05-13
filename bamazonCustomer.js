// Include the dotenv npm package and run the config function
require("dotenv").config();

// Include the keys package
const keys = require("./keys.js");

// Test to access MySQL root password
console.log(keys.rootPassword);