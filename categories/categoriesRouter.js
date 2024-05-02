const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV];
const database = knex(config);

const categoriesRouter = express.Router();

categoriesRouter.get("/", async (req, res) => {
  const rows = await database("ContentType");
  try {
    res.status(200);
    res.send(rows); // 'rows' is an array of objects, where each object represents a row in the 'users' table
  } catch (error) {
    console.error(error);
  }
});
module.exports = categoriesRouter;
