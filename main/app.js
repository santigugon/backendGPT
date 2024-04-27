const express = require("express");
const app = express();
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const generativeAIToolRouter = require("../generativeAITool/generativeAIToolRouter.js");
const taskRouter = require("../tasks/tasksRouter.js");
const categoriesRouter = require("../categories/categoriesRouter.js");
// Select all records from the 'users' table

app.use(express.static("public"));
app.use("/ai-info", generativeAIToolRouter);
app.use("/ai-task", taskRouter);
app.use("/ai-category", categoriesRouter);

module.exports = app;
