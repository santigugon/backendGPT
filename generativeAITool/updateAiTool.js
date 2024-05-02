const { createCategories, createTasks } = require("./createAITool.js");
const {
  deleteCategoriesRelation,
  deleteTasksRelation,
} = require("./deleteAITool");

const { insertQuery, asyncQuery } = require("./asyncQueries");

const updateAiTool = async (body, id) => {
  try {
    await deleteCategoriesRelation(id);
    await deleteTasksRelation(id);
    await createCategories(body.Categories, id);
    await createTasks(body.AITasks, id);
    const awaitUpdate = await asyncQuery(
      `UPDATE "GenerativeAITool" SET "name" = $1, "description" = $2, "referenceURL"=$3, "pricingModel"=$4, "licensingType"=$5, "urlLogo"=$6, "shortDescription"=$7 WHERE "id" = $8`,
      [
        body.name,
        body.description,
        body.referenceURL,
        body.pricingModel,
        body.licensingType,
        body.urlLogo,
        body.shortDescription,
        id,
      ]
    );
  } catch (e) {
    console.error("Error updating AI tool:", e);
    throw e;
  }
};

module.exports.updateAiTool = updateAiTool;
