const knex = require("../db/db");
function Posts() {
  return knex("post as p")
    .join("person as u", "p.user_id", "u.id")
    .leftJoin("comment as c", "p.id", "c.post_id")
    .leftJoin("post_like as pl", "p.id", "pl.post_id")
    .leftJoin("post_tag as t", "p.id", "t.post_id")
    .select(
      "p.id",
      "p.title",
      "p.created_at",
      "p.content",
      "p.preview",
      knex.raw("to_jsonb(u.*) - 'passwordhash' as user"),
      knex.raw("array_agg(distinct t.tag) AS tags")
    )
    .countDistinct("pl as likes_count")
    .countDistinct("c as comments_count");
}
module.exports = { Posts };
