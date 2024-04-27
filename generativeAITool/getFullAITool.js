const knex = require("knex");
const { as } = require("../db/config");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);

const getFullAITool = async (rows) => {
  const updatedRows = await Promise.all(
    rows.map(async (tool) => {
      try {
        const [questions, searches, tasks, categories] = await Promise.all([
          database("peopleAlsoAsk").where("aiToolId", tool.id),
          database("relatedSearches").where("aiToolId", tool.id),
          getTasks(tool.id),
          getCategories(tool.id),
        ]);

        return {
          ...tool,
          questions,
          searches,
          tasks,
          categories,
        };
      } catch (error) {
        console.error(error);
        return tool; // Return tool without modifications if an error occurs
      }
    })
  );

  return updatedRows;
};
const getTasks = async (toolId) => {
  const taskIds = await database("ToolTaskRelation")
    .select("taskId")
    .where("toolId", toolId);

  const tasks = await database("Task")
    .select("value")
    .whereIn(
      "id",
      taskIds.map((t) => t.taskId)
    );

  return tasks.map((t) => t.value);
};

const getCategories = async (toolId) => {
  const categoryIds = await database("RelationContentToTool")
    .select("contentTypeId")
    .where("aiToolId", toolId);

  const categories = await database("ContentType")
    .select("value")
    .whereIn(
      "id",
      categoryIds.map((c) => c.contentTypeId)
    );

  return categories.map((c) => c.value);
};

module.exports = getFullAITool;
