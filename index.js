//set up
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

let app = express();
app.set("view engine", "hbs");
app.use(express.static("public"));
//on hbs using waxon
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");
app.use(
  express.urlencoded({
    extended: false,
  })
);

//route
const landingRoutes = require("./routes/landing");
const productRoutes = require("./routes/product");
//if a URL begins with a single forward slash
//then consult the routes registered in the landingRoutes object (which we import in from landingRoutes.js).
async function main() {
  app.get("/", (req, res) => {
    res.render("landing/index");
  });

  app.get("/about-us", (req, res) => {
    res.render("landing/about-us");
  });

  app.get("/contact-us", (req, res) => {
    res.render("landing/contact-us");
  });

  //whenever route is /laning, use landingRoutes
  app.use("/landing", landingRoutes);
  app.use("/products", productRoutes);
}
main();

//listen
app.listen(3000, (req, res) => {
  console.log("server has started");
});
