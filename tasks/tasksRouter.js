const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);

const taskRouter = express.Router();

taskRouter.get("/", async (req, res) => {
  const rows = await database("Task");
  try {
    res.status(200);
    res.send(rows); // 'rows' is an array of objects, where each object represents a row in the 'users' table
  } catch (error) {
    console.error(error);
  }
});
module.exports = taskRouter;
