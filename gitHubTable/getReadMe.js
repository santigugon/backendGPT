const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.OCTOKIT,
});

const getReadMe = async (owner, repo) => {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: owner,
      repo: repo,
      path: "README.md",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  try {
    const encodedContent = response.data.content;
    const decodedContent = Buffer.from(encodedContent, "base64").toString(
      "utf8"
    );
    console.log(decodedContent);
    return decodedContent;
  } catch (e) {
    console.error(e);
  }
};

module.exports = getReadMe;
