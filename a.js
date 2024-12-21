const puppeteer = require("puppeteer");
require("dotenv").config();

const a = async (res) => {
  console.log("aa");
  res.send("aaaaaaaaaa")
};

module.exports = { a };