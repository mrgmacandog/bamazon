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

    // TODO refactor this block
    bamazon.selectAllFrom("products", function (res) {
        bamazon.showTable(res);
        // // Create a table
        // let table = new Table({
        //     head: ["ID", "Product", "Department", "Price (USD)", "Quantity"],
        //     colAligns: ["right", null, null, "right", "right"]
        // });

        // // Loop through each record in the DB table
        // res.forEach(function (product) {
        //     let tableRow = [];

        //     // Loop through each column of a record
        //     for (let key in product) {
        //         tableRow.push(product[key]);
        //     }

        //     // Add record information from DB table
        //     table.push(tableRow);
        // });

        // // Display the table
        // console.log(table.toString());
    });
}

function viewLowInv() {
    console.log("Inside: View Low Inventory");

    // TODO refactor this block
    bamazon.selectAllFromWhere("products", "stock_quantity", "<", 5, function (res) {
        bamazon.showTable(res);
        // // Create a table
        // let table = new Table({
        //     head: ["ID", "Product", "Department", "Price (USD)", "Quantity"],
        //     colAligns: ["right", null, null, "right", "right"]
        // });

        // // Loop through each record in the DB table
        // res.forEach(function (product) {
        //     let tableRow = [];

        //     // Loop through each column of a record
        //     for (let key in product) {
        //         tableRow.push(product[key]);
        //     }

        //     // Add record information from DB table
        //     table.push(tableRow);
        // });

        // // Display the table
        // console.log(table.toString());
    });
}

function addInv() {
    console.log("Inside: Add to Inventory");
}

function addProd() {
    console.log("Inside: Add New Product");
}