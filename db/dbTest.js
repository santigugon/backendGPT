const { Pool } = require("pg");

// Create a connection pool
const pool = new Pool({
  host: "aws-0-us-west-1.pooler.supabase.com",
  user: "postgres.rdifswycioilqlusyfqk",
  password: "!GenAI-Map!!",
  database: "postgres",
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  // Query to list all tables in the current database
});

module.exports = pool;
