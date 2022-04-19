//set up
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");

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

//has to be behind the session
app.use(csrf());

//separate code from above below csrfToken();
app.use(function (err, req, res, next) {
  //if the error code is whatever, we flash the message then redirect back
  //below error is a specific error for custom error message

  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error_messages", "The form has expired. Please try again");
    //it is like press back button in browser
    res.redirect("back");
  } else {
    next();
  }
});

// //global middleshare to share each token applied to all routes
app.use(function (req, res, next) {
  //req.csrfToken generates a new token and saved to current session file
  //then made available to res hbs

  res.locals.csrfToken = req.csrfToken();
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
