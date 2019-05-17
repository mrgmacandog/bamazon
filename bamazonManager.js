// Include the dotenv npm package and run the config function
require("dotenv").config();

// Include the keys package
const keys = require("./keys.js");

// Include the mysql package
const mysql = require("mysql");

// Include Bamazon package
const Bamazon = require("./bamazonDB.js");

// Include the inquirer package
const inquirer = require("inquirer");

// Include cli-table package
const Table = require('cli-table');

// Create the way to refer the bamazon database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.rootPassword,
    database: "bamazon"
});

// Instantiate a Bamazon object with the a connection to the Bamazon DB
let bamazon = new Bamazon(connection);

// Connect to the bamazon database
connection.connect(function (err) {
    // If there is an error, throw it
    if (err) throw err;

    promptSelection();
});

/**
 * Get user input for action taken
 */
function promptSelection() {
    inquirer.prompt([
        {
            type: "list",
            message: "Select an action",
            name: "action",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (inquirerResponse) {

        // Decide what action path to take
        switch (inquirerResponse.action) {
            case "View Products for Sale":
                viewAllProd();
                break;
            
            case "View Low Inventory":
                viewLowInv();
                break;
            
            case "Add to Inventory":
                addInv();
                break;
            
            case "Add New Product":
                addProd();
                break;
        }

        // End the connection
        connection.end();
    });
}

function viewAllProd() {
    console.log("Inside: View Products for Sale");
}

function viewLowInv() {
    console.log("Inside: View Low Inventory");
}

function addInv() {
    console.log("Inside: Add to Inventory");
}

function addProd() {
    console.log("Inside: Add New Product");
}