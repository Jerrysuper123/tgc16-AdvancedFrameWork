//knex is to set up connection
const knex = require("knex")({
  client: process.env.DB_DRIVER,
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  },
});

//bookshelf to carry to knex connection to be used later
const bookshelf = require("bookshelf")(knex);

module.exports = bookshelf;
