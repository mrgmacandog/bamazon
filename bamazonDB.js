// Include cli-table package
const Table = require('cli-table');

/**
 * Bamazon object used to access data from the Bamazon DB connection
 * @param {Object} bamazonConnection 
 */
function Bamazon(bamazonConnection) {
    /**
     * Selects all records from the DB with all the columns in the given table
     * @param {String} table Table name in the Bamazon DB
     * @param {function} callback Callback function for the response
     */
    this.selectAllFrom = function (table, callback) {
        bamazonConnection.query(
            `SELECT * FROM ${table}`,  // Select all the records from the table
            function (err, res) {
                // If there is an error, throw it
                if (err) throw err;

                // Callback for the response
                callback(res);
            }
        )
    }

    /**
     * Filter records from the passed in table where the records have
     * the passed in value for the passed in column.
     * @param {String} table Table name in the Bamazon DB
     * @param {String} column Column name in the Bamazon DB
     * @param {String} operator Operator ("<", "<=", "=", ">=", ">")
     * @param {String} value Filter value
     * @param {function} callback Callback function for the response
     */
    this.selectAllFromWhere = function (table, column, operator, value, callback) {
        bamazonConnection.query(
            `SELECT * FROM ${table} WHERE ${column} ${operator} ?`,
            [value],
            function (err, res) {
                // If there is an error, throw it
                if (err) throw err;

                // Callback for the response
                callback(res);
            }
        )
    }

    /**
     * Updates the given ID's stock quantity
     * @param {String} newQuantity New value for the stock quantity in Bamazon DB
     * @param {String} chosenID ID that needs to have its stock updated
     * @param {function} callback Callback function for the response
     */
    this.updateStockQuantity = function (newQuantity, chosenID, callback) {
        // Update record of ID given
        bamazonConnection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: newQuantity
                },
                {
                    id: chosenID
                }
            ],
            function (err, res) {
                // If there is an error, throw it
                if (err) throw err;

                // Callback for the response
                callback(res);
            }
        )
    }

    this.showTable = function (res) {
        // Create a table
        let table = new Table({
            head: ["ID", "Product", "Department", "Price (USD)", "Quantity"],
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
    }
}

// Export Bamazon object
module.exports = Bamazon;