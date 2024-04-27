const express = require("express");
const app = express();
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const generativeAIToolRouter = require("../generativeAITool/generativeAIToolRouter.js");
// Select all records from the 'users' table

app.use(express.static("public"));
app.use("/generativeAITool", generativeAIToolRouter);



module.exports = app;
