const knex = require("knex");
const { as } = require("../db/config");
const config = require("../db/knexfile")[process.env.NODE_ENV || "development"];
const database = knex(config);

const getFullAITool = async (rows) => {
  for (const tool of rows) {
    try {
      const questions = await database("peopleAlsoAsk").where(
        "aiToolId",
        tool.id
      );
      const searches = await database("relatedSearches").where(
        "aiToolId",
        tool.id
      );
      const tasks = await getTasks(tool.id);
      const categories = await getCategories(tool.id);

      tool.questions = questions;
      tool.searches = searches;
      tool.tasks = tasks;
      tool.categories = categories;
    } catch (error) {
      console.error(error);
    }
  }
  return rows;
};

const getTasks = async (toolId) => {
  const tasksArr = [];
  const taskIds = await database("ToolTaskRelation")
    .select("taskId")
    .where("toolId", toolId);

  for (const { taskId } of taskIds) {
    const task = await database("Task").select("value").where("id", taskId);
    const value = task[0].value;
    tasksArr.push(value);
  }
  return tasksArr;
};

const getCategories = async (toolId) => {
  const categoriesArr = [];
  const categoriesIds = await database("RelationContentToTool")
    .select("contentTypeId")
    .where("aiToolId", toolId);
  for (const { contentTypeId } of categoriesIds) {
    const category = await database("ContentType")
      .select("value")
      .where("id", contentTypeId);
    const value = category[0].value;

    categoriesArr.push(value);
  }
  console.log(categoriesArr);
  return categoriesArr;
};
module.exports = getFullAITool;
