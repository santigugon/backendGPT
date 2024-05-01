const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);
const getFullAITool = require("./getFullAITool.js");
const createAiTool = require("./createAITool.js");

// Middleware to fetch AI tools
async function fetchAITools(req, res, next) {
  try {
    req.tools = await database("GenerativeAITool");
    next();
  } catch (error) {
    next(error);
  }
}

// Middleware to fetch AI tool by ID
async function fetchAIToolById(req, res, next) {
  try {
    const { id } = req.params;
    const tool = await database("GenerativeAITool").where("id", id);
    req.tools = tool;
    next();
  } catch (error) {
    next(error);
  }
}

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send({ error: "Internal server error" });
}

const generativeAIToolRouter = express.Router();

// Use fetchAITools middleware for routes that need all tools
generativeAIToolRouter.get("/", fetchAITools, async (req, res) => {
  const finalResponse = await getFullAITool(req.tools);
  if (finalResponse.length === 0) res.status(404).send("No tools found");
  res.status(200).send(finalResponse);
});

generativeAIToolRouter.get("/:id", fetchAIToolById, async (req, res) => {
  const finalResponse = await getFullAITool(req.tools);
  if (finalResponse.length === 0)
    res.status(404).send("No tool found with the given ID");
  else {
    res.status(200).send(finalResponse);
  }
});

generativeAIToolRouter.get("/task/:task", fetchAITools, async (req, res) => {
  const { task } = req.params;
  const finalResponse = await getFullAITool(req.tools);
  const filteredResponse = finalResponse.filter((tool) =>
    tool.tasks.includes(task)
  );
  if (filteredResponse.length === 0)
    res.status(404).send("No tools found with the given task");
  else {
    res.status(200).send(filteredResponse);
  }
});

generativeAIToolRouter.get(
  "/category/:category",
  fetchAITools,
  async (req, res) => {
    const { category } = req.params;
    const finalResponse = await getFullAITool(req.tools);
    const filteredResponse = finalResponse.filter((tool) =>
      tool.categories.includes(category)
    );
    if (filteredResponse.length === 0)
      res.status(404).send("No tools found with the given category");
    else {
      res.status(200).send(filteredResponse);
    }
  }
);
generativeAIToolRouter.get("/trending/:trending", async (req, res) => {
  const { trending } = req.params;

  if (!trending) {
    return res.status(400).send("Please provide a trending parameter");
  }

  try {
    // Assuming "ranking" is a column that exists and lower numbers are better.
    // Adjust "orderBy" and "ascending/descending" based on your database schema.
    const tools = await database("GenerativeAITool")
      .where("ranking", ">", 0) // Filtering by trending
      .orderBy("ranking", "asc") // Sorting by ranking ascending (best rank first)
      .limit(50); // Limiting to the top 50 results

    const finalResponse = await getFullAITool(tools);
    res.status(200).send(finalResponse);
  } catch (error) {
    console.error("Error fetching top 50 AI tools:", error);
    res.status(500).send("An error occurred while fetching the data.");
  }
});

generativeAIToolRouter.post("/", async (req, res) => {
  const {
    name,
    referenceURL,
    pricingModel,
    licensingType,
    description,
    shortDescription,
    urlLogo,
    AITasks,
    Categories,
  } = req.body;

  // Simple validation check
  if (
    !name ||
    !referenceURL ||
    !pricingModel ||
    !licensingType ||
    !description ||
    !shortDescription ||
    !urlLogo ||
    !AITasks ||
    !Categories
  ) {
    return res
      .status(400)
      .json({ status: 400, message: "All fields are required." });
  }

  try {
    // Assume a function saveAITechnology exists to save data to a database
    const savedTechnology = await createAiTool(req.body);
    res.status(201).json({
      status: 201,
      message: "The AI tool was properly created",
      data: savedTechnology,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({
      status: 500,
      message:
        "There was an internal server error, and there could not be a connection set to the database or there was an exception thrown",
    });
  }
});

// Use error handling middleware at the end of your routes
generativeAIToolRouter.use(errorHandler);

module.exports = generativeAIToolRouter;
