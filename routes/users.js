const express = require("express");
const router = express.Router();

const crypto = require("crypto");

const { User } = require("../models");

const {
  bootstrapField,
  createRegistrationForm,
  createLoginForm,
} = require("../forms");

router.get("/register", (req, res) => {
  const registerForm = createRegistrationForm();
  res.render("users/register", {
    form: registerForm.toHTML(bootstrapField),
  });
});

router.post("/register", (req, res) => {
  const registerForm = createRegistrationForm();

  registerForm.handle(req, {
    success: async (form) => {
      // create a new row in the User table/class
      const user = new User({
        username: form.data.username,
        password: form.data.password,
        email: form.data.email,
      });
      await user.save();
      req.flash("success_messages", "User signed up successfully!");
      res.redirect("/users/login");
    },
    //rerender the form again with the validation error
    error: (form) => {
      res.render("users/register", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

router.get("/login", (req, res) => {
  const loginForm = createLoginForm();
  res.render("users/login", {
    form: loginForm.toHTML(bootstrapField),
  });
});

router.post("/login", (req, res) => {
  const loginForm = createLoginForm();

  loginForm.handle(req, {
    success: async (form) => {
      //process the login

      let user = await User.where({
        email: form.data.email,
      }).fetch({
        require: false,
      });

      //if there such a user by email
      if (!user) {
        req.flash("error_messages", "Sorry, the auth details does not work");
        res.redirect("/users/login");
      } else {
        //check if password matches
        if (user.get("password") === form.data.password) {
          //store user details in session
          req.session.user = {
            id: user.get("id"),
            username: user.get("username"),
            email: user.get("email"),
          };
          req.flash(
            "success_messages",
            "welcome back, " + user.get("username")
          );
          res.redirect("/users/profile");
        } else {
          req.flash("error_messages", "Sorry, the auth details does not work");
          req.redirect("/users/login");
        }
      }
    },
    error: (form) => {
      req.flash("error_messages", "Login fails, fill in the form again");
      res.render("users/login", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

router.get("/profile", (req, res) => {
  const user = req.session.user;
  if (!user) {
    req.flash("error_messages", "You do not have permission to view this");
    res.redirect("/users/login");
  } else {
    res.render("users/profile", {
      user: user,
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash("success_messages", "good bye");
  res.redirect("/users/login");
});

module.exports = router;
