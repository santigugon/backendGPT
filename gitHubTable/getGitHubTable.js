const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV];
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
  try {
    const readMe = await getReadMe(repo, owner);

    return res.status(200).send(readMe);
  } catch (error) {
    res.status(404).send("No ReadMe found");
  }
});

module.exports = gitHubTable;
