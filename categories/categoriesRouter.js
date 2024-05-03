const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV];
const database = knex(config);

const categoriesRouter = express.Router();

categoriesRouter.get("/", async (req, res) => {
  const rows = await database("ContentType");
  if (rows.length === 0) return res.status(404).send("No categories found");
  try {
    res.status(200);
    res.send(rows); // 'rows' is an array of objects, where each object represents a row in the 'users' table
  } catch (error) {
    return res
      .status(500)
      .send({
        status: 500,
        error:
          "There was an internal server error, and there could not be a connection set to the database or there was an exception thrown",
      });
    console.error(error);
  }
});
module.exports = categoriesRouter;
