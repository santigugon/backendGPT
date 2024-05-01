const express = require("express");
const app = express();

const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const generativeAIToolRouter = require("../generativeAITool/generativeAIToolRouter.js");
const taskRouter = require("../tasks/tasksRouter.js");
const categoriesRouter = require("../categories/categoriesRouter.js");
const bodyParser = require("body-parser");
const gitRouter = require("../gitHubTable/getGitHubTable.js");
const cors = require("cors");
app.use(
  cors({
    origin: "*", // or '*' for development only
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Select all records from the 'users' table
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/ai-info", generativeAIToolRouter);
app.use("/ai-task", taskRouter);
app.use("/ai-category", categoriesRouter);
app.use("/git-info", gitRouter);

module.exports = app;
