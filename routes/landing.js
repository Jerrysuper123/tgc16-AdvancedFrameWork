const express = require("express");
const router = express.Router();

router.get("/about", (req, res) => {
  res.send("About");
});

router.get("/contact", (req, res) => {
  res.send("contact");
});

module.exports = router;
