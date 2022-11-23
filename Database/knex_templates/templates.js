const knex = require("../db");
function Posts() {
  return knex("post as p")
    .join("person as u", "p.user_id", "u.id")
    .leftJoin("post_media as pm", "p.id", "pm.post_id")
    .leftJoin("comment as c", "p.id", "c.post_id")
    .leftJoin("post_like as pl", "p.id", "pl.post_id")
    .leftJoin("post_tag as t", "p.id", "t.post_id")
    .leftJoin("post_geo as g", "p.id", "g.post_id")
    .select(
      "p.id",
      "p.title",
      "p.description",
      "p.created_at",
      knex.raw("to_jsonb(u.*) - 'passwordhash' as user"),
      knex.raw(
        "array_agg(distinct to_jsonb(pm.*) - 'id' - 'post_id') AS attachments"
      ),
      knex.raw("array_agg(distinct t.tag) AS tags"),
      knex.raw("to_jsonb(g.*) - 'post_id' - 'id' as geo")
    )
    .countDistinct("pl as likes_count")
    .countDistinct("c as comments_count");
}
module.exports = { Posts };
