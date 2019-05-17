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

        // // End the connection
        // connection.end();
    });
}

function viewAllProd() {
    console.log("Inside: View Products for Sale");

    // TODO refactor this block
    bamazon.selectAllFrom("products", function (res) {
        bamazon.showTable(res);

        // End the connection
        connection.end();
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

        // End the connection
        connection.end();
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
        addInv();
    } else {
        // Item stock quantity
        let availableStock = queryRes[0].stock_quantity;

        bamazon.updateStockQuantity(availableStock + parseInt(inquirerResponse.quantity), inquirerResponse.id, function () {
            // Notify manager that it the stock has been increased
            console.log(`\nAn order of ${inquirerResponse.quantity} ${queryRes[0].product_name} has been placed!\n`);
            console.log(`\nThe inventory of ${queryRes[0].product_name} has increased from ${availableStock} to ${availableStock + parseInt(inquirerResponse.quantity)}\n`);

            // End the connection
            connection.end();
        });
    }
}

function addProd() {
    console.log("Inside: Add New Product");

    // End the connection
    connection.end();
}