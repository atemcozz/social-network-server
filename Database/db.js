const pg = require("pg");
require("dotenv").config();
// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
// });
const pool = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL,
  searchPath: ["knex", "public"],
  ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
});

module.exports = pool;
