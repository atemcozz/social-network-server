const pg = require("pg");
require("dotenv").config();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
});
module.exports = pool;
