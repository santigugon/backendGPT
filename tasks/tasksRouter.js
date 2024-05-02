const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const { createTasks } = require("../generativeAITool/createAITool.js");

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
taskRouter.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newTask } = req.body;
    const technology = await database("GenerativeAITool").where("id", id);
    if (technology.length === 0) {
      res.status(404).send("The ai task was not found");
    } else {
      if (!newTask) {
        res.status(400).send("newTask is required");
      } else {
        createTasks([newTask], id);
        res
          .status(200)
          .send(`The task was properly updated for AI ${technology[0].name}`);
      }
    }
  } catch (error) {
    res
      .status(500)
      .send(
        "There was an internal server error, and there could not be a connection set to the database or there was an exception thrown"
      );
  }
});

taskRouter.post("/", async (req, res) => {
  const { value } = req.body;
  if (!value) {
    res.status(400).send("Value is required");
  } else {
    try {
      const result = await database("Task").insert({ value });
      res.status(201).send("The ai task was properly created");
    } catch (error) {
      res
        .status(500)
        .send(
          "There was an internal server error, and there could not be a connection set to the database or there was an exception thrown"
        );
    }
  }
});

module.exports = taskRouter;
