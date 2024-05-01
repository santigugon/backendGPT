const app = require("./app");
const { createProxyMiddleware } = require("http-proxy-middleware");

const PORT = process.env.PORT || 3001;
app.use(
  "/api",
  createProxyMiddleware({ target: "http://genAi.com", changeOrigin: true })
);

app.listen(PORT, () => {
  console.log(`URL: http://localhost:${PORT}`);
});
