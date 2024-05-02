const request = require("supertest");
const app = require("../main/app");
const { asyncQuery } = require("../generativeAITool/asyncQueries");
const knex = require("knex");
const e = require("express");
const config = require("../db/knexfile")["development"];
const database = knex(config);

async function generateAITools() {
  // Starting index for name
  let nameIndex = 1;
  const totalRequests = 5; // Total number of requests to send

  for (let i = 0; i < 5; i++) {
    const postData = {
      name: `new Name ${nameIndex + i}`, // Increment name in each iteration
      referenceURL: "https://Urlexample.com",
      pricingModel: "FREE or FREEMIUM or PAID",
      licensingType: "(Private or OpenSource) and company Name",
      description: "Long Text with all the description",
      shortDescription: "A short description like the one giving for previews",
      urlLogo: "A logo for the url to be post",
      AITasks: ["List", "of", "possible", "Ai", "tasks"],
      Categories: ["NLP", "Code", "Text"],
    };

    // Perform POST request with each modified postData object
    const response = await request(app)
      .post("/ai-info")
      .send(postData)
      .expect(201) // 201 is the proper status code for a successful POST request according to our documentation
      .catch((err) => {
        console.error(`Error when sending request ${i + 1}: ${err.message}`);
        return res
          .status(500)
          .json({ error: "Internal server error during testing" });
      });
  }
}

if (process.env.NODE_ENV === "development") {
  describe("Generative AI Tool API Tests", () => {
    // Setup a known state before any tests run

    beforeAll(async () => {
      await asyncQuery('DELETE FROM "ToolTaskRelation" ', []);
      await asyncQuery('DELETE FROM "RelationContentToTool" ', []);
      await asyncQuery('DELETE FROM "GenerativeAITool" ', []); // Clear the table
      //await generateAITools();
    }, 30000);

    // Clean up or reset the state after each test
    afterEach(async () => {
      // Code to clear or reset the database state
    });

    // Final cleanup after all tests are done
    afterAll(async () => {
      await asyncQuery('DELETE FROM "ToolTaskRelation" WHERE "toolId"<$1', [
        17,
      ]);
      await asyncQuery(
        'DELETE FROM "RelationContentToTool" WHERE "aiToolId"<$1',
        [17]
      );
      // Code to close database connections or other cleanup actions
    });

    describe("GET /ai-info-empty", () => {
      it("should return 404 when no AI tools are found", async () => {
        const response = await request(app).get("/ai-info");
        expect(response.statusCode).toEqual(404);
      });
      it("should return 404 when no trending AI tools are found", async () => {
        const response = await request(app).get("/ai-info/trending/true");
        expect(response.statusCode).toEqual(404);
      });
      it("should return 404 when no AI tools are found by category", async () => {
        const response = await request(app).get("/ai-info/category/NLP");
        expect(response.statusCode).toEqual(404);
      });
      it("should return 404 when no AI tools are found by task", async () => {
        const response = await request(app).get("/ai-info/task/task1");
        expect(response.statusCode).toEqual(404);
      });
    });

    // TEST CASE for POST /ai-info
    describe("POST /ai-info", () => {
      // CASE, when the data is invalid
      it("should return an error for invalid AI tool data", async () => {
        const invalidData = {}; // Empty data to simulate a bad request
        const response = await request(app).post("/ai-info").send(invalidData);
        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty("message");
      });

      // CASE, when the data is valid
      it("should create a new AI tool", async () => {
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
        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty(
          "message",
          "The AI tool was properly created"
        );
      });
    });

    describe("GET /ai-info", () => {
      it("should fetch all AI tools", async () => {
        const response = await request(app).get("/ai-info");
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(Array.isArray(response.body)).toBeTruthy();
      });
    });

    describe("GET /ai-info/:id", () => {
      //CASE valid id
      it("should fetch an AI tool by ID", async () => {
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
    });

    describe("GET /ai-info/task/:task", () => {
      //CASE valid task
      it("should return 200 when fetching AI tools by task", async () => {
        const response = await request(app).get("/ai-info/task/task1");
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(Array.isArray(response.body)).toBeTruthy();
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

    describe("GET /ai-info/trending", () => {
      //CASE valid and double check the past patch check by ensuring the ranking is properly set
      it("should fetch all AI tools in trending order and return status 200, ", async () => {
        const response = await request(app).get("/ai-info/trending/true");
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("ranking", "1");
      });
      //CASE valid where we check by category
      it("should return ranking by category and return status 200", async () => {
        const response = await request(app).get(
          "/ai-info/trending/category/NLP"
        );
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].categories).toContain("NLP");
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
      generateAITools();
    }, 30000);
    //Case when the data is valid
    describe("GET/ai-task", () => {
      it("should return all tasks an array and status 200", async () => {
        const response = await request(app).get("/ai-task");
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
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
    it("Should return all categories and status 200", async () => {
      const response = await request(app).get("/ai-category");
      expect(response.statusCode).toEqual(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
} else {
  console.log("Tests are only for development environment");
}
