const bookshelf = require("../bookshelf");

//create a table called "product" in organic db as the user "foo"
//modal is called Product (class to the table), while the products is the table name
const Product = bookshelf.model("Product", {
  tableName: "products",

  // this causes withRelated to load
  category() {
    return this.belongsTo("Category");
  },
  tags() {
    return this.belongsToMany("Tag");
  },
});

const Tag = bookshelf.model("Tag", {
  tableName: "tags",
  products() {
    return this.belongsToMany("Product");
  },
});

const Category = bookshelf.model("Category", {
  tableName: "categories",
  products() {
    return this.hasMany("Product");
  },
});

//model is singlular capitalized letter
const User = bookshelf.model("User", {
  tableName: "users",
});

module.exports = { Product, Category, Tag, User };
