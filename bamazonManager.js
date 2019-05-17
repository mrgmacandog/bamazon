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
    });
}

/**
 * View all products
 */
function viewAllProd() {
    console.log();

    // Select all records from products table
    bamazon.selectAllFrom("products", function (res) {
        // Print a table with the records
        bamazon.showTable(res);

        // Prompt if another action is desired
        promptAnotherAction();
    });
}

/**
 * View all products that have a stock quantity less than 5
 */
function viewLowInv() {
    console.log();

    // Select all records from products table where stock quantity is less than 5
    bamazon.selectAllFromWhere("products", "stock_quantity", "<", 5, function (res) {
        // Print a table with the records
        bamazon.showTable(res);

        // Prompt if another action is desired
        promptAnotherAction();
    });
}

/**
 * Increase stock quantity of a product
 */
function addInv() {
    console.log();

    // Create a "Prompt" with a series of questions
    inquirer.prompt([
        // Get user input for the ID of the product
        {
            type: "input",
            message: "Product ID?",
            name: "id",
        },
        // Get user input for quantity added to the product
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
        addInv();
    } else {
        // Item stock quantity
        let availableStock = queryRes[0].stock_quantity;

        // Update the quantity of the chosen product
        bamazon.updateStockQuantity(availableStock + parseInt(inquirerResponse.quantity), inquirerResponse.id, function () {
            // Notify manager that it the stock has been increased
            console.log(`\nThe inventory of ${queryRes[0].product_name} has increased from ${availableStock} to ${availableStock + parseInt(inquirerResponse.quantity)}\n`);

            // Prompt if another action is desired
            promptAnotherAction();
        });
    }
}

/**
 * Add new product to the DB
 */
function addProd() {
    console.log();

    // Prompt user for product information
    inquirer.prompt([
        {
            type: "input",
            message: "Product ID?",
            name: "id",
        },
        {
            type: "input",
            message: "Product name?",
            name: "product_name",
        },
        {
            type: "input",
            message: "Department name?",
            name: "department_name",
        },
        {
            type: "input",
            message: "Product price?",
            name: "price",
        },
        {
            type: "input",
            message: "Stock quantity?",
            name: "stock_quantity",

            // Validate input by making sure it's an integer greater than 0;
            validate: function (input) {
                let isValid = Number.isInteger(parseFloat(input)) && input > 0;

                // Give error message if input is not valid
                return isValid || "Please enter a whole number greater than 0.";
            }
        },
    ]).then(function (inquirerResponse) {
        // Create a record in the database with the product information
        bamazon.createProduct(inquirerResponse.id,
            inquirerResponse.product_name,
            inquirerResponse.department_name,
            inquirerResponse.price,
            inquirerResponse.stock_quantity,
            function () {
                console.log("\nProduct successfuly added!\n");

                // Prompt if another action is desired
                promptAnotherAction();
            }
        );
    })
}

/**
 * Asks user if another action is desired
 */
function promptAnotherAction() {
    inquirer.prompt([
        // Prompt user for yes or no
        {
            type: "confirm",
            message: "Would you like to perform another action?",
            name: "anotherAction",
        },
    ]).then(function (inquirerResponse) {
        // If yes to prompt
        if (inquirerResponse.anotherAction) {
            console.log();
            // Show products again
            promptSelection();
        } else {
            console.log("\nGoodbye!\n");

            // End DB connection
            connection.end();
        }
    });
}