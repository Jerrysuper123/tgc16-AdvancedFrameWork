const bookshelf = require("../bookshelf");

//create a table called "product" in organic db as the user "foo"
//modal is called Product (class to the table), while the products is the table name
const Product = bookshelf.model("Product", {
  tableName: "products",
});

const Category = bookshelf.model("Category", {
  tableName: "categories",
});

module.exports = { Product, Category };
