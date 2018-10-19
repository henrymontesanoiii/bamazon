const inquirer = require('inquirer');
const mysql = require('mysql');
const {
  table
} = require('table');

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
  inquirer
    .prompt([
      // Here we create a basic text prompt
      // Here we give the user a list to choose from.
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
        name: "action"
      },

    ]).then(answer => {

      switch (answer.action) {
        case "View Products for Sale":
          productsForSale();
          break;
        case "View Low Inventory":
          lowInventory();
          break;
        case "Add to Inventory":
          addToInventory();
          break;
        case "Add New Product":
          addNewProduct();
          break;

      }

    })
};

const productsForSale = () => {
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
      allProducts.push(product.department_name);
      allProducts.push(product.price);
      allProducts.push(product.stock_quantity);
      productsData.push(allProducts);

    });
    productsTable(productsData);
    start();
  })
};

const lowInventory = () => {
  db.query("SELECT * FROM products WHERE stock_quantity  < 8 ORDER BY stock_quantity ", (err, products) => {
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
      allProducts.push(product.department_name);
      allProducts.push(product.price);
      allProducts.push(product.stock_quantity);
      productsData.push(allProducts);

    });
    productsTable(productsData);
    start();
  })
};

const addToInventory = () => {
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
      allProducts.push(product.stock_quantity);
      productsData.push(allProducts);

    });
    productsTable(productsData);

    inquirer
      .prompt([{
          name: "id",
          type: "input",
          message: "Which product would you like to add inventory to? (Input Product ID #)",
          default: "8",
          validate: function (id) {
            if (isNaN(id)) {
              console.log("\n");
              console.log("Please Enter An ID Number!")
              console.log("\n");
              return false;
            } else if (id > products.length) {
              console.log("\n");
              console.log("Please Enter A Valid ID Number!")
              console.log("\n");
              return false;
            } else {
              return true;
            }
          }
        }, {
          name: "quantity",
          type: "input",
          message: "How much inventory would you like to add?",
          default: "1",
          validate: function (id) {
            if (!isNaN(id)) {
              return true;
            } else {
              console.log("\n");
              console.log("Please Enter A Number!")
              console.log("\n");
              return false;
            }
          }
        }]

      )
      .then(function (answer) {
        let productID = answer.id;
        let quantity = parseInt(answer.quantity);
        db.query("SELECT * FROM products WHERE id = ?", [productID],
          (err, product) => {
            if (err) throw err;
            product.forEach(product => {
              let newQuantity = product.stock_quantity += quantity;
              db.query("UPDATE products SET ? WHERE ?",

                [{
                    stock_quantity: newQuantity
                  },
                  {
                    id: productID
                  }
                ], (err) => {
                  if (err) throw err;
                  console.log(`You have added ${quantity} more to Product ID: ${productID}.`)
                  start();
                }
              )
            })
          })
      });
  });
}

const addNewProduct = () => {
    inquirer
      .prompt([{
          name: "name",
          type: "input",
          message: "What product would you like to add to the inventory?",
          validate: function (name) {
            if (name == null) {
              console.log("\n");
              console.log("Please Enter a Product Name!")
              console.log("\n");
              return false;
            } else {
              return true;
            }
          }
        }, {
          name: "department",
          type: "input",
          message: "What department would you like to add this to?",
          validate: function (department) {
            if (department == null) {
              console.log("\n");
              console.log("Please Enter a Department!")
              console.log("\n");
              return false;
            } else {
              return true;
            }
          }
        }, {
          name: "price",
          type: "input",
          message: "What should this item be priced at?",
          default: "1.99",
          // validate: function (id) {
          //   if (!isNaN(id)) {
          //     return true;
          //   } else {
          //     console.log("\n");
          //     console.log("Please Enter A Number!")
          //     console.log("\n");
          //     return false;
          //   }
          // }
        }, {
          name: "quantity",
          type: "input",
          message: "How much of this item are we adding?",
          default: "1",
          validate: function (id) {
            if (!isNaN(id)) {
              return true;
            } else {
              console.log("\n");
              console.log("Please Enter A Number!")
              console.log("\n");
              return false;
            }
          }
        }]

      )
      .then(function (answer) {
        let productName = answer.name;
        let department = answer.department;
        let price = answer.price;
        let quantity = parseInt(answer.quantity);
        db.query("INSERT INTO products SET ?",
          {
            product_name: productName,
            department_name: department,
            price: price,
            stock_quantity: quantity
          },
          (err, product) => {
            if (err) throw err;
            console.log("Item added!");
            start();
          })
      })};



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