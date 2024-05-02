const { Pool } = require("pg");
let pool;

// Configuration for your database pools
const dbConfig = {
  development: {
    host: "aws-0-us-west-1.pooler.supabase.com",
    user: "postgres.rdifswycioilqlusyfqk",
    password: "!GenAI-Map!!",
    database: "postgres",
    port: 5432,
  },
  // production: {
  //   host: "aws-0-us-west-1.pooler.supabase.com",
  //   user: "postgres.rdifswycioilqlusyfqk",
  //   password: "!GenAI-Map!!",
  //   database: "postgres",
  //   port: 5432,
  // },
};

// Initialize the pool based on the environment
if (process.env.NODE_ENV == "development") {
  console.log("Using development database");
  pool = new Pool(dbConfig.development);
} else {
  console.log("Using production database");
  pool = new Pool(dbConfig.production);
}

const asyncQuery = async (query, params) => {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error acquiring client from pool:", err);
        reject(err);
        return;
      }
      client.query(query, params, (error, results) => {
        release(); // Always release the client back to the pool
        if (error) {
          console.error("Error executing query:", error);
          reject(error);
        } else {
          resolve(results.rows); // In pg, results are returned in results.rows
        }
      });
    });
  });
};

const insertQuery = async (query, values) => {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error acquiring client from pool:", err);
        reject(err);
        return;
      }
      client.query(query, values, (error, results) => {
        release(); // Always release the client back to the pool
        if (error) {
          console.error("Error executing insert query:", error);
          reject(error);
        } else {
          resolve(results); // results.rows contains the rows returned by PostgreSQL
        }
      });
    });
  });
};

const environment = {};
module.exports.insertQuery = insertQuery;
module.exports.asyncQuery = asyncQuery;
