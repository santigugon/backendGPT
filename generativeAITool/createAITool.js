const { insertQuery, asyncQuery } = require("./asyncQueries");
const database = require("../db/db");

const createCategories = async (categories, toolId) => {
  try {
    for (const category of categories) {
      const query = await asyncQuery(
        `SELECT id FROM "ContentType" WHERE value = $1`,
        [category]
      );
      let contentId;
      if (query.length === 0) {
        const sql = `INSERT INTO "ContentType" (value) VALUES ($1) RETURNING id;`;
        const values = [category];
        const resultContent = await insertQuery(sql, values);
        contentId = resultContent.rows[0].id;
      } else {
        contentId = query[0].id;
      }

      await insertQuery(
        `INSERT INTO "RelationContentToTool" ("contentTypeId", "aiToolId") VALUES ($1, $2);`,
        [contentId, toolId]
      );
    }
  } catch (error) {
    console.error("Error creating categories:", error);
    throw error; // Re-throw the error to handle it further up the call stack
  }
};

const createTasks = async (tasks, toolId) => {
  try {
    for (const task of tasks) {
      const query = await asyncQuery(`SELECT id FROM "Task" WHERE value = $1`, [
        task,
      ]);
      let taskId;
      if (query.length === 0) {
        const sql = `INSERT INTO "Task" (value) VALUES ($1) RETURNING id;`;
        const values = [task];
        const resultTask = await insertQuery(sql, values);
        taskId = resultTask.rows[0].id;
      } else {
        taskId = query[0].id;
      }

      await insertQuery(
        `INSERT INTO "ToolTaskRelation" ("taskId", "toolId") VALUES ($1, $2)`,
        [taskId, toolId]
      );
    }
  } catch (error) {
    console.error("Error creating tasks:", error);
    throw error; // Re-throw the error to handle it further up the call stack
  }
};

const createAiTool = async (body) => {
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
  } = body;

  try {
    let prexists = await asyncQuery(
      `SELECT name FROM "GenerativeAITool" WHERE name = $1`,
      [name]
    );
    if (prexists.length > 0) {
      console.log("Tool already exists in the database");
      return "Exists";
    }
    let insertIdAiTool = -1;
    const sql = `INSERT INTO "GenerativeAITool" (name, "referenceURL", "pricingModel", "licensingType", description, "shortDescription", "urlLogo" ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`;
    const values = [
      name,
      referenceURL,
      pricingModel,
      licensingType,
      description,
      shortDescription,
      urlLogo,
    ];

    const resultsAiTool = await insertQuery(sql, values);

    if (resultsAiTool.rowCount > 0) {
      insertIdAiTool = resultsAiTool.rows[0].id; // Assuming that an ID is returned
    } else {
      throw new Error("Error inserting data into the database");
    }
    await createCategories(Categories, insertIdAiTool);
    await createTasks(AITasks, insertIdAiTool);
    return true;
    console.log("Data inserted successfully");
  } catch (error) {
    throw error;
    return false;
  }
};

module.exports.createAiTool = createAiTool;
module.exports.createCategories = createCategories;
module.exports.createTasks = createTasks;
