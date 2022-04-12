const bookshelf = require("../bookshelf");

//create a table called "product" in organic db as the user "foo"
//modal is called Product (class to the table), while the products is the table name
const Product = bookshelf.model("Product", {
  tableName: "products",

  category() {
    return this.belongsTo("Category");
  },
});

const Category = bookshelf.model("Category", {
  tableName: "categories",
  products() {
    return this.hasMany("Product");
  },
});

module.exports = { Product, Category };
