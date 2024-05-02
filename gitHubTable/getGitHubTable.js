const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")["development"];
const database = knex(config);
const getReadMe = require("./getReadMe.js");

const gitHubTable = express.Router();

gitHubTable.get("/", async (req, res) => {
  const finalResponse = await database("GitHubTopAi's");
  if (finalResponse.length === 0) res.status(404).send("No tools found");
  res.status(200).send(finalResponse);
});

gitHubTable.get("/repo/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;
  console.log(`Owner: ${owner}, Repository: ${repo}`);
  const readMe = await getReadMe(owner, repo);
  res.status(200).send(readMe);
});

module.exports = gitHubTable;
