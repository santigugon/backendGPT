const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const getFullAITool = require("./getFullAITool.js");

const generativeAIToolRouter = express.Router();

generativeAIToolRouter.get("/", async (req, res) => {
  const rows = await database("GenerativeAITool");
  try {
    const finalResponse = await getFullAITool(rows);
    res.status(200);
    res.send(finalResponse); // 'rows' is an array of objects, where each object represents a row in the 'users' table
  } catch (error) {
    console.error(error);
  }
});

generativeAIToolRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const rows = await database("GenerativeAITool").where("id", id);
  try {
    const finalResponse = await getFullAITool(rows);
    res.status(200);
    res.send(finalResponse); // 'rows' is an array of objects, where each object represents a row in the 'users' table
  } catch (error) {
    console.error(error);
  }
});
module.exports = generativeAIToolRouter;
