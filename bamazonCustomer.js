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

    displayProducts();

    connection.end();
});

/**
 * Display the current invetory of products in the database including 
 * the product id, the name, department, price, and quantity.
 */
function displayProducts() {
    // Get all the products from the DB
    bamazon.selectAllFrom("products", function (res) {
        // Create a table
        let table = new Table({
            head: ["ID", "Product", "Department", "Price (USD)", "Quantity"],
            // colWidths: [10, 25, 25, 13, 10],
            colAligns: ["right", null, null, "right", "right"]
        });

        // Loop through each record in the DB table
        res.forEach(function (product) {
            let tableRow = [];

            // Loop through each column of a record
            for (let key in product) {
                tableRow.push(product[key]);
            }

            // Add record information from DB table
            table.push(tableRow);
        });

        // Display the table
        console.log(table.toString());

        // Get user input for purchase
        promptPurchase();
    });
}

/**
 * Get user input for the product ID and quantity
 */
function promptPurchase() {
    // Create a "Prompt" with a series of questions
    inquirer.prompt([
        // Get user input for the ID of the product
        {
            type: "input",
            message: "Product ID?",
            name: "id",
        },
        // Get user input for quantity of the product
        {
            type: "input",
            message: "Quantity?",
            name: "quantity",

            // Validate input by making sure it's an integer greater than 0;
            validate: function (input) {
                let isValid = Number.isInteger(parseFloat(input)) && input > 0;

                // Give error message if input is not valid
                return isValid || "Please enter a whole number greater than 0.";
            }
        }
    ]).then(function (inquirerResponse) {
        console.log(`\nCART`);
        console.log(`ID:       ${inquirerResponse.id}`);
        console.log(`Quantity: ${inquirerResponse.quantity}`);
    });
}
