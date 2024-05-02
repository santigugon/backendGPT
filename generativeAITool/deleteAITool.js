const { insertQuery, asyncQuery } = require("./asyncQueries");
const knex = require("knex");
const config = require("../db/knexfile")["development"];
const database = knex(config);

const deleteCategoriesRelation = async (aiToolId) => {
  try {
    await asyncQuery(
      `DELETE FROM "RelationContentToTool" WHERE "aiToolId" = $1`,
      [aiToolId]
    );
  } catch (error) {
    console.error("Error deleting categories relation:", error);
    throw error;
  }
};

const deleteTasksRelation = async (aiToolId) => {
  try {
    await asyncQuery(`DELETE FROM "ToolTaskRelation" WHERE "toolId" = $1`, [
      aiToolId,
    ]);
  } catch (error) {
    console.error("Error deleting tasks relation:", error);
    throw error;
  }
};

const deleteAITool = async (aiToolId) => {
  try {
    await deleteCategoriesRelation(aiToolId);
    await deleteTasksRelation(aiToolId);
    await database("GenerativeAITool").where("id", aiToolId).del();
  } catch (error) {
    console.error("Error deleting AI tool:", error);
    throw error;
  }
};

module.exports.deleteCategoriesRelation = deleteCategoriesRelation;
module.exports.deleteTasksRelation = deleteTasksRelation;
module.exports.deleteAITool = deleteAITool;
