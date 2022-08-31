const pg = require("pg");
require("dotenv").config();
// const pool = new pg.Pool({
//   user: "postgres",
//   password: "S0602k",
//   host: "localhost",
//   port: 5432,
//   database: "social_network",
// });
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
module.exports = pool;
