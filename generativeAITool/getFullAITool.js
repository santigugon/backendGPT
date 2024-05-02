const knex = require("knex");
const { as } = require("../db/config");
const config = require("../db/knexfile")["development"];
const database = knex(config);
const getRelatedData = async (toolIds) => {
  const [questions, searches, tasksRelations, categoriesRelations] =
    await Promise.all([
      database("peopleAlsoAsk").whereIn("aiToolId", toolIds),
      database("relatedSearches").whereIn("aiToolId", toolIds),
      database("ToolTaskRelation").whereIn("toolId", toolIds),
      database("RelationContentToTool").whereIn("aiToolId", toolIds),
    ]);

  const taskIds = [...new Set(tasksRelations.map((t) => t.taskId))];
  const tasks = await database("Task")
    .select("id", "value")
    .whereIn("id", taskIds);

  const contentIds = [
    ...new Set(categoriesRelations.map((c) => c.contentTypeId)),
  ];
  const categories = await database("ContentType")
    .select("id", "value")
    .whereIn("id", contentIds);

  return {
    questions,
    searches,
    tasks,
    categories,
    tasksRelations,
    categoriesRelations,
  };
};

const getFullAITool = async (tools) => {
  const toolIds = tools.map((t) => t.id);
  const relatedData = await getRelatedData(toolIds);

  const updatedRows = tools.map((tool) => {
    const toolQuestions = relatedData.questions.filter(
      (q) => q.aiToolId === tool.id
    );
    const toolSearches = relatedData.searches.filter(
      (s) => s.aiToolId === tool.id
    );
    const toolTasks = relatedData.tasksRelations
      .filter((t) => t.toolId === tool.id)
      .map((t) => relatedData.tasks.find((task) => task.id === t.taskId).value);
    const toolCategories = relatedData.categoriesRelations
      .filter((c) => c.aiToolId === tool.id)
      .map(
        (c) =>
          relatedData.categories.find((cat) => cat.id === c.contentTypeId).value
      );

    return {
      ...tool,
      questions: toolQuestions,
      searches: toolSearches,
      tasks: toolTasks,
      categories: toolCategories,
    };
  });

  return updatedRows;
};
module.exports = getFullAITool;
