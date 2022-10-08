const pg = require("pg");
require("dotenv").config();
// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
// });
const pool = require("knex")({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
  },
  searchPath: ["knex", "public"],
});

module.exports = pool;
