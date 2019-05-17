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
});

/**
 * Display the current invetory of products in the database including 
 * the product id, the name, department, price, and quantity.
 */
function displayProducts() {
    // Get all the products from the DB
    bamazon.selectAllFrom("products", function (res) {
        // Print all the products in a table
        bamazon.showTable(res);

         // Get user input for additional purchase
        promptPurchase();
    });
}

/**
 * Get user input for the product ID and quantity
 */
function promptPurchase() {
    console.log();

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
        // Search DB for product id
        bamazon.selectAllFromWhere("products", "id", "=", inquirerResponse.id.split(" ").join(""), function (queryRes) {
            // Decide what to do with given id
            handleSearchID(inquirerResponse, queryRes);
        });
    });
}

/**
 * Decides what happens after searching database for product id
 * @param {Object} inquirerResponse 
 * @param {array} queryRes 
 */
function handleSearchID(inquirerResponse, queryRes) {
    if (queryRes.length < 1) {
        // Notify user that the product with the given id could not be found
        console.log(`\nError: Could not find product with id "${inquirerResponse.id}" in the database.\n`);

        // Prompt for another purchase
        promptAnotherPurchase();
    } else {
        // Item stock quantity
        let availableStock = queryRes[0].stock_quantity;

        // If the user the quantity inputs is less the the stock quantity
        if (inquirerResponse.quantity <= availableStock) {
            // Update DB my reducing stock_quantity for the id
            bamazon.updateStockQuantity(availableStock - inquirerResponse.quantity, inquirerResponse.id, function () {
                // Notify user that the order has been placed
                console.log(`\nAn order of ${inquirerResponse.quantity} ${queryRes[0].product_name} has been placed!\n`);

                // Prompt for another purchase
                promptAnotherPurchase();
            });
        } else {
            // Notify user that there are not enough in stock
            console.log("\nError: Insufficient quantity.");
            console.log(`Desired quantity: ${inquirerResponse.quantity}`);
            console.log(`Stock quantity:   ${availableStock}\n`);

            // Prompt for another purchase
            promptAnotherPurchase();
        }
    }
}

/**
 * Asks user if another purchase is needed
 */
function promptAnotherPurchase() {
    inquirer.prompt([
        // Prompt user for yes or no
        {
            type: "confirm",
            message: "Would you like to make another purchase?",
            name: "anotherPurchase",
        },
    ]).then(function (inquirerResponse) {
        // If yes to prompt
        if (inquirerResponse.anotherPurchase) {
            // Show products again
            displayProducts();
        } else {
            console.log("\nThank you for shopping!\n");

            // End DB connection
            connection.end();
        }
    });
}