//set up
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);

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

//if a URL begins with a single forward slash
//then consult the routes registered in the landingRoutes object (which we import in from landingRoutes.js).

//set up sessions before routes
app.use(
  session({
    //store session in file on server
    store: new FileStore(),
    //hash session id
    secret: "keyboard cat",
    resave: false,
    //create new session id there is none
    saveUninitialized: true,
  })
);

//for this app to use flash message
app.use(flash());

//add global middlewares
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Register Flash middleware
app.use((req, res, next) => {
  //make messages below available to the variables in the HBS
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

//route
const landingRoutes = require("./routes/landing");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/users");
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
  app.use("/users", userRoutes);
}
main();

//listen
app.listen(3000, (req, res) => {
  console.log("server has started");
});
