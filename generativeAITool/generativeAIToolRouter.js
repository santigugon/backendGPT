const express = require("express");
const knex = require("knex");
const config = require("../db/knexfile")[process.env.NODE_ENV];
const database = knex(config);
const getFullAITool = require("./getFullAITool.js");
const { createTasks, createAiTool } = require("./createAITool.js");
const { as } = require("../db/config.js");
const { updateAiTool } = require("./updateAiTool.js");
const { deleteAITool } = require("./deleteAITool.js");

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
async function fieldsValidation(req, res, next) {}

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send({ error: "Internal server error" });
}

const generativeAIToolRouter = express.Router();

// Use fetchAITools middleware for routes that need all tools
generativeAIToolRouter.get("/", fetchAITools, async (req, res) => {
  const finalResponse = await getFullAITool(req.tools);
  if (finalResponse.length === 0) return res.status(404).send("No tools found");
  return res.status(200).send(finalResponse);
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
    return res.status(404).send("No tools found with the given task");
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
      return res.status(404).send("No tools found with the given category");
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
    if (finalResponse.length === 0) {
      return res.status(404).send("No tools found");
    }
    res.status(200).send(finalResponse);
  } catch (error) {
    console.error("Error fetching top 50 AI tools:", error);
    res.status(500).send("An error occurred while fetching the data.");
  }
});

generativeAIToolRouter.get("/trending/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const categories = await database("ContentType").where("value", category);
    if (categories.length === 0) {
      return res.status(404).send("No category found with the given name");
    } else {
      const rows = await database("GenerativeAITool")
        .where("ranking", ">", 0, "AND", "category", "=", category)
        .orderBy("ranking", "asc")
        .limit(50);
      const finalResponse = await getFullAITool(rows);
      res.status(200).send(finalResponse);
    }
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

    if (savedTechnology === "Exists") {
      return res.status(409).json({
        status: 409,
        message: "The AI tool already exists.",
      });
    }

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

generativeAIToolRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
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
    const technology = await database("GenerativeAITool").where("id", id);
    if (technology.length === 0) {
      return res
        .status(404)
        .json({ status: 404, message: "AI tool not found." });
    }
    // Assume a function saveAITechnology exists to save data to a database
    const updatedTechnology = await updateAiTool(req.body, id);
    res.status(200).json({
      status: 200,
      message: "The AI tool was properly updated",
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

generativeAIToolRouter.patch("/trending/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const technology = await database("GenerativeAITool").where("id", id);
    if (technology.length === 0) {
      return res.status(404).send("No tool found with the given ID");
    } else {
      await database("GenerativeAITool").where("id", id).update({
        ranking: req.body.ranking,
      });
      res
        .status(200)
        .send(`The tool with name ${technology[0].name} was properly updated`);
    }
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({
      status: 500,
      message:
        "There was an internal server error, and there could not be a connection set to the database or there was an exception thrown",
    });
  }
});

generativeAIToolRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await database("GenerativeAITool").where("id", id);
    if (response.length === 0) {
      return res.status(404).send("No tool found with the given ID");
    }
    await deleteAITool(id);
    res.status(200).send("The tool was properly deleted");
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
