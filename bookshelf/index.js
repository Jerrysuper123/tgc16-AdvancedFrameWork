//knex is to set up connection
const knex = require("knex")({
  client: "mysql",
  connection: {
    user: "foo",
    password: "Bar_199161",
    database: "organic",
  },
});

//bookshelf to carry to knex connection to be used later
const bookshelf = require("bookshelf")(knex);

module.exports = bookshelf;
