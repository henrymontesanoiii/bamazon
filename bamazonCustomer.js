const inquirer = require('inquirer');
const mysql = require('mysql');
const {table} = require('table');

// create connection to database
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected!");

  // prompt user to do something
  start();
});

const start = () => {
  db.query("SELECT * FROM products", (err, products) => {
    if (err) throw err;
    
    let productsData = [];
    products.forEach(product => {
      // console.log(`Product ID: ${product.id}`);
      // console.log(`Product Name: ${product.product_name}`);
      // console.log(`Price: ${product.price}`);
      // console.log("\n");
      allProducts = [];
      allProducts.push(product.id);
      allProducts.push(product.product_name);
      allProducts.push(product.price);
      productsData.push(allProducts);
    
    });
    productsTable(productsData);

    inquirer
      .prompt([{
          name: "buyID",
          type: "input",
          message: "Which product would you like to buy? (Input Product ID #)",
          default: "7",
          validate: function (id) {
            if (isNaN(id)) {
              console.log("\n");
              console.log("Please Enter An ID Number!")
              console.log("\n");
              return false;
            }
            else if (id > products.length){
              console.log("\n");
              console.log("Please Enter A Valid ID Number!")
              console.log("\n");
              return false;
            }
            else {
              return true;
            }
          }
        }, {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy?",
          default: "1",
          validate: function (id) {
            if (!isNaN(id)) {
              return true;
            } 

            else {
              console.log("\n");
              console.log("Please Enter A Quantity!")
              console.log("\n");
              return false;
            }
          }
        }]

      )
      .then(function (answer) {
        
        let productID = answer.buyID;
        let quantity = parseInt(answer.quantity);
        db.query("SELECT * FROM products WHERE id = ?", [productID],
          (err, product) => {
            if (err) throw err;
            product.forEach(product => {
              console.log(`You chose to buy ${quantity} of ${product.product_name}!`);
              console.log(`We have ${product.stock_quantity} in stock!`)
              if (product.stock_quantity < parseInt(quantity)) {
                console.log(`Insufficient quantity! Buy something else! `);
                buyAgain();
              }
               else {
                let newQuantity = product.stock_quantity -= quantity;
                db.query("UPDATE products SET ? WHERE ?",

                  [{
                      stock_quantity: newQuantity
                    },
                    {
                      id: productID
                    }
                  ], (err) => {
                    if (err) throw err;
                    db.query("SELECT price FROM products WHERE id = ?", [productID],
                      (err, boughtProduct) => {
                        if (err) throw err;
                        console.log(`That will cost $${product.price}\n`);
                        buyAgain();
                      }
                    )
                  })
              }
            });
          });
      })
  })
};

const buyAgain = () => {
  inquirer
    .prompt([{
      type: "confirm",
      message: "Would you like to buy something else?",
      name: "confirm",
      default: true
      }, ]

    )
    .then(function (answer) {
      if (answer.confirm) {
        start();
      } else {
        console.log(`Come again soon!`)
        db.end();
      }
    })
}

const productsTable = (productsData) => {
  let data,
    output;
    data = productsData;
  /**
 * @typedef {string} table~cell
 */
 
/**
 * @typedef {table~cell[]} table~row
 */
 
/**
 * @typedef {Object} table~columns
 * @property {string} alignment Cell content alignment (enum: left, center, right) (default: left).
 * @property {number} width Column width (default: auto).
 * @property {number} truncate Number of characters are which the content will be truncated (default: Infinity).
 * @property {number} paddingLeft Cell content padding width left (default: 1).
 * @property {number} paddingRight Cell content padding width right (default: 1).
 */
 
/**
 * @typedef {Object} table~border
 * @property {string} topBody
 * @property {string} topJoin
 * @property {string} topLeft
 * @property {string} topRight
 * @property {string} bottomBody
 * @property {string} bottomJoin
 * @property {string} bottomLeft
 * @property {string} bottomRight
 * @property {string} bodyLeft
 * @property {string} bodyRight
 * @property {string} bodyJoin
 * @property {string} joinBody
 * @property {string} joinLeft
 * @property {string} joinRight
 * @property {string} joinJoin
 */
 
/**
 * Used to dynamically tell table whether to draw a line separating rows or not.
 * The default behavior is to always return true.
 *
 * @typedef {function} drawHorizontalLine
 * @param {number} index 
 * @param {number} size 
 * @return {boolean} 
 */
 
/**
 * @typedef {Object} table~config
 * @property {table~border} border
 * @property {table~columns[]} columns Column specific configuration.
 * @property {table~columns} columnDefault Default values for all columns. Column specific settings overwrite the default values.
 * @property {table~drawHorizontalLine} drawHorizontalLine
 */
 
/**
 * Generates a text table.
 *
 * @param {table~row[]} rows 
 * @param {table~config} config 
 * @return {String} 
 */
output = table(data);
 
console.log(output);
}