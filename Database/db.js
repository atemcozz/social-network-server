const pg = require("pg");

const pool = new pg.Pool({
  user: "postgres",
  password: "S0602k",
  host: "localhost",
  port: 5432,
  database: "social_network",
});

module.exports = pool;
