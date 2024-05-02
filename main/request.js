async function testPostRequest() {
  const url = "http://localhost:3001/ai-info"; // Adjust the URL to match your server
  const requestBody = {
    name: "new Name",
    referenceURL: "https://Urlexample.com",
    pricingModel: "FREE", // Or "FREEMIUM" or "PAID"
    licensingType: "OpenSource and company Name", // Or "Private and company Name"
    description: "Long Text with all the description",
    shortDescription: "A short description like the one giving for previews",
    urlLogo: "https://example.com/logo.png",
    AITasks: ["List", "of", "possible", "Ai", "tasks"],
    Categories: ["NLP", "Code", "Text"],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json(); // Assuming server responds with JSON

    if (response.status === 201) {
      console.log("Success:", data);
    } else {
      console.log("Failure:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testPostRequest();
