const express = require("express");
const app = express();
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const generativeAIToolRouter = require("../generativeAITool/generativeAIToolRouter.js");
// Select all records from the 'users' table

app.use(express.static("public"));
app.use("/generativeAITool", generativeAIToolRouter);

// database("GenerativeAITool")
//   .then((rows) => {
//     console.log(rows); // 'rows' is an array of objects, where each object represents a row in the 'users' table
//   })
//   .catch((error) => {
//     console.error(error);
//   });

module.exports = app;
