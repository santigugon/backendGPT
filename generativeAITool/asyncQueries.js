const pool = require("../db/db"); // Assuming pool is exported from db.js with PostgreSQL configuration

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

module.exports.insertQuery = insertQuery;
module.exports.asyncQuery = asyncQuery;
