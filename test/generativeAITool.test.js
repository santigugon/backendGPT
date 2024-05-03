const request = require("supertest");
const app = require("../main/app");
const { asyncQuery } = require("../generativeAITool/asyncQueries");
const knex = require("knex");
const e = require("express");
const config = require("../db/knexfile")["development"];
const database = knex(config);

async function generateAITools() {
  try {
    // Assume 'database' function returns the last index or max index used so far
    const validData = {
      name: "New AI Tool",
      referenceURL: "https://example.com",
      pricingModel: "FREE",
      licensingType: "OpenSource",
      description: "A useful AI tool",
      shortDescription: "Useful tool",
      urlLogo: "https://example.com/logo.png",
      AITasks: ["task1", "task2"],
      Categories: ["NLP", "Text"],
    };
    const response = await request(app).post("/ai-info").send(validData);
  } catch (e) {
    console.error("Error generating AI tools:", e);
    throw e;
  }
}

const deleteAITools = async () => {
  await asyncQuery('DELETE FROM "ToolTaskRelation" ', []);
  await asyncQuery('DELETE FROM "RelationContentToTool" ', []);
  await asyncQuery('DELETE FROM "GenerativeAITool" ', []); // Clear the table
};

if (process.env.NODE_ENV === "development") {
  describe("Generative AI Tool API Tests", () => {
    beforeAll(async () => {
      await deleteAITools();
    }, 30000);

    // Clean up or reset the state after each test creating a single tool
    beforeEach(async () => {
      await deleteAITools();
      await generateAITools();
    });
    afterEach(async () => {
      // Code to clear or reset the database state
      await deleteAITools();
    });

    // Final cleanup after all tests are done
    afterAll(async () => {
      await deleteAITools();
    });

    // TEST CASE for POST /ai-info
    describe("POST /ai-info", () => {
      // CASE, when the data is invalid
      it("should return an status error 400 for invalid AI tool data payload ", async () => {
        const invalidData = {}; // Empty data to simulate a bad request
        const response = await request(app).post("/ai-info").send(invalidData);
        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty("message");
      });

      // CASE, when the data is valid
      it("should create a new AI tool and return status 201", async () => {
        const validData = {
          name: "New AI Tool POST",
          referenceURL: "https://example.com",
          pricingModel: "FREE",
          licensingType: "OpenSource",
          description: "A useful AI tool",
          shortDescription: "Useful tool",
          urlLogo: "https://example.com/logo.png",
          AITasks: ["task1", "task2"],
          Categories: ["NLP", "Text"],
        };
        const response = await request(app).post("/ai-info").send(validData);
        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty(
          "message",
          "The AI tool was properly created"
        );
      });
    });

    describe("GET /ai-info", () => {
      it("should fetch all AI tools and return status 200", async () => {
        const response = await request(app).get("/ai-info");
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(Array.isArray(response.body)).toBeTruthy();
      });
      it("should return 404 when no AI tools are found", async () => {
        await deleteAITools();
        const response = await request(app).get("/ai-info");
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("GET /ai-info/:id", () => {
      //CASE valid id
      it("should fetch an AI tool by ID and return status 200", async () => {
        const responseQ = await database("GenerativeAITool").limit(1); // Assuming this ID exists

        const aiToolId = responseQ[0].id;
        const response = await request(app).get(`/ai-info/${aiToolId}`);

        expect(response.statusCode).toEqual(200);
        expect(response.body[0].id).toEqual(aiToolId);
      });
      //Case invalid id
      it("should return 404 if the tool does not exist", async () => {
        const response = await request(app).get("/ai-info/9999"); // Non-existent ID
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("GET /ai-info/category/:category", () => {
      //CASE valid category
      it("should return 200 when fetching AI tools by category", async () => {
        const response = await request(app).get("/ai-info/category/NLP");
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(Array.isArray(response.body)).toBeTruthy();
      });
      it("should return 404 when no AI tools are found by category", async () => {
        await deleteAITools();
        const response = await request(app).get("/ai-info/category/NLP");
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("GET /ai-info/task/:task", () => {
      //CASE valid task
      it("should return 200 when fetching AI tools by task", async () => {
        const response = await request(app).get("/ai-info/task/task1");
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(Array.isArray(response.body)).toBeTruthy();
      });
      it("should return 404 when no AI tools are found by task", async () => {
        await deleteAITools();
        const response = await request(app).get("/ai-info/task/task1");
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("PATCH /ai-info/trending/:id", () => {
      //CASE valid id
      it("should update the ranking of an AI tool and return status 200", async () => {
        const responseQ = await database("GenerativeAITool").limit(1); // Assuming this ID exists

        const aiToolId = responseQ[0].id;
        const updateData = { ranking: 1 };
        const response = await request(app)
          .patch(`/ai-info/trending/${aiToolId}`)
          .send(updateData);
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual(
          `The tool with name ${responseQ[0].name} was properly updated`
        );
      });
      //Case invalid id
      it("should return 404 when trying to update a non-existent AI tool", async () => {
        const response = await request(app).patch("/ai-info/trending/9999"); // Non-existent ID
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("GET /ai-info/trending/:bool", () => {
      it("should return 404 when no trending AI tools are found", async () => {
        const response = await request(app).get("/ai-info/trending/true");
        expect(response.statusCode).toEqual(404);
      });
      //CASE valid and double check the past patch check by ensuring the ranking is properly set
      it("should fetch all AI tools in trending order and return status 200, ", async () => {
        const responseQ = await database("GenerativeAITool").limit(1); // Assuming this ID exists

        const aiToolId = responseQ[0].id;
        await request(app)
          .patch(`/ai-info/trending/${aiToolId}`)
          .send({ ranking: 1 });
        const response = await request(app).get("/ai-info/trending/true");
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("ranking", "1");
      });

      //CASE valid where we check by category
      it("should return ranking by category and return status 200", async () => {
        const responseQ = await database("GenerativeAITool").limit(1); // Assuming this ID exists

        const aiToolId = responseQ[0].id;
        await request(app)
          .patch(`/ai-info/trending/${aiToolId}`)
          .send({ ranking: 1 });
        const response = await request(app).get(
          "/ai-info/trending/category/NLP"
        );
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].categories).toContain("NLP");
      });
      it("should return 404 when no trending AI tools are found", async () => {
        await deleteAITools();
        const response = await request(app).get("/ai-info/trending/true");
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("PUT /ai-info/:id", () => {
      // CASE: Successfully updating an AI technology
      it("should update AI technology information and return status 200", async () => {
        const responseQ = await database("GenerativeAITool").limit(1);
        const aiToolId = responseQ[0].id;
        const updateData = {
          name: "Updated Name",
          referenceURL: "https://updated-url.com",
          shortDescription: "shortDescription",
          pricingModel: "PAID",
          licensingType: "OpenSource ExampleCompany",
          description: "Updated long description.",
          urlLogo: "https://example.com/updated-logo.png",
          AITasks: ["Updated Task 1", "Updated Task 2"],
          Categories: ["Updated Category 1", "Updated Category 2"],
        };

        const response = await request(app)
          .put(`/ai-info/${aiToolId}`)
          .send(updateData)
          .expect(200); // Expecting HTTP status code 200

        expect(response.body).toEqual({
          status: 200,
          message: "The AI tool was properly updated",
        });
      });

      // CASE: AI technology not found (Invalid ID)
      it("should return 404 if the AI technology does not exist", async () => {
        const nonExistentId = 9999; // Assumed non-existent ID for testing
        const response = await request(app)
          .put(`/ai-info/${nonExistentId}`)
          .send({
            name: "Updated Name",
            referenceURL: "https://updated-url.com",
            shortDescription: "shortDescription",
            pricingModel: "PAID",
            licensingType: "OpenSource ExampleCompany",
            description: "Updated long description.",
            urlLogo: "https://example.com/updated-logo.png",
            AITasks: ["Updated Task 1", "Updated Task 2"],
            Categories: ["Updated Category 1", "Updated Category 2"],
          })
          .expect(404); // Expecting HTTP status code 404

        expect(response.body).toEqual({
          status: 404,
          message: "AI tool not found.",
        });
      });
    });

    describe("DELETE /ai-info/:id", () => {
      it("should delete an AI technology and return status 200", async () => {
        const responseQ = await database("GenerativeAITool").limit(1); // Assuming this ID exists

        const aiToolId = responseQ[0].id;
        const response = await request(app).delete(`/ai-info/${aiToolId}`);
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual("The tool was properly deleted");
      });

      it("should return 404 when trying to delete a non-existent AI technology", async () => {
        const response = await request(app).delete("/ai-info/9999"); // Non-existent ID
        expect(response.statusCode).toEqual(404);
      });
    });
  });

  describe("TASK API TESTS", () => {
    beforeAll(async () => {
      await generateAITools();
    }, 30000);
    //Case when the data is valid
    describe("GET/ai-task", () => {
      it("should return all tasks an array and status 200", async () => {
        const response = await request(app).get("/ai-task");
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
      });
      it("should return 404 when no tasks are found", async () => {
        await asyncQuery('DELETE FROM  "ToolTaskRelation"', []); // Clear the table
        await asyncQuery('DELETE FROM "Task" ', []); // Clear the table
        const response = await request(app).get("/ai-task");
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("POST/ai-task", () => {
      it("should create a new task return success message and status 201", async () => {
        const response = await request(app)
          .post("/ai-task")
          .send({ value: "New Task" });
        expect(response.statusCode).toEqual(201);
        expect(response.text).toEqual("The ai task was properly created");
      });

      it("should return 400 if the task is not provided", async () => {
        const response = await request(app).post("/ai-task").send({});
        expect(response.statusCode).toEqual(400);
      });
    });

    describe("PATCH/ai-task/:id", () => {
      //CASE valid id
      it("should update a task and return status 200", async () => {
        const responseQ = await database("GenerativeAITool").limit(1);
        const aiToolId = responseQ[0].id;
        const response = await request(app)
          .patch(`/ai-task/${aiToolId}`)
          .send({ newTask: "Updated Task" });
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual(
          `The task was properly updated for AI ${responseQ[0].name}`
        );
      });
      //Case invalid id
      it("should return 404 if the task does not exist", async () => {
        const response = await request(app).patch("/ai-task/9999"); // Non-existent ID
        expect(response.statusCode).toEqual(404);
      });
    });
  });

  describe("Category API Tests", () => {
    describe("GET /ai-category", () => {
      it("Should return all categories and status 200", async () => {
        const response = await request(app).get("/ai-category");
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
      });
      it("Should return 404 when no categories are found", async () => {
        await deleteAITools();
        await asyncQuery('DELETE FROM "ContentType" ', []); // Clear the table
        const response = await request(app).get("/ai-category");
        expect(response.statusCode).toEqual(404);
      });
    });
  });
} else {
  console.log("Tests are only for development environment");
}
