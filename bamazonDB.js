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
     * @param {String} value Filter value
     * @param {function} callback Callback function for the response
     */
    this.selectAllFromWhere = function (table, column, value, callback) {
        bamazonConnection.query(
            // "SELECT * FROM products WHERE id = ?",  // Select all the records from the table
            `SELECT * FROM ${table} WHERE ${column} = ?`,
            [value],
            function (err, res) {
                // If there is an error, throw it
                if (err) throw err;
                
                // Callback for the response
                callback(res);
            }
        )
    }
}

// Export Bamazon object
module.exports = Bamazon;