const tokenService = require("../../service/token-service");
const knex = require("../db");
const cloudinary = require("cloudinary").v2;
const { Posts } = require("../knex_templates/templates");
class PostController {
  async createPost(req, res) {
    try {
      const files = req.files;
      const { title, description, tags, lat, lng } = req.body;
      const user_id = req.user.id;

      if (title?.trim().length === 0) {
        return res.status(400).json({ msg: "Необходимо название" });
      }
      if (files.length === 0) {
        return res.status(400).json({ msg: "Необходимо минимум 1 вложение" });
      }
      const newPost = (
        await knex("post")
          .insert({
            user_id,
            title: title.trim(),
            description: description.trim(),
          })
          .returning("*")
      )[0];
      // const newPost = (
      //   await db.query(
      //     `INSERT INTO post (user_id, title, description) values ($1,$2, $3) RETURNING *`,
      //     [user_id, title.trim(), description.trim()]
      //   )
      // ).rows[0];
      if (files) {
        for (const at of files) {
          const type = at.mimetype.split("/")[0].replace("image", "photo");
          // await db.query(
          //   "insert into post_media (type,url,post_id) values ($1,$2,$3)",
          //   [type, at.path, newPost.id]
          // );
          await knex("post_media").insert({
            type,
            url: at.path,
            post_id: newPost.id,
          });
        }
      }
      if (tags) {
        for (const tag of tags) {
          if (tag.trim().length > 0) {
            await knex("post_tag").insert({ post_id: newPost.id, tag });
            // await db.query(
            //   "insert into post_tag (post_id, tag) values ($1,$2)",
            //   [newPost.id, tag]
            // );
          }
        }
      }
      if (lat && lng) {
        await knex("post_geo").insert({ post_id: newPost.id, lat, lng });
      }
      // console.log(files, req.body.description);
      res.json({ post_id: newPost.id });
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
  }
  async getPostsByUser(req, res) {
    try {
      const id = req.params.id;
      const user = tokenService.validateAccessToken(
        req.headers.authorization?.split(" ")[1]
      );
      if (Number(id) !== parseInt(id)) {
        return res.status(404).end();
      }
      const posts = await Posts()
        .where({ "p.user_id": id })
        .groupBy("p.id", "u.id", "g.id")
        .orderBy("p.created_at", "desc");
      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await knex("post_like")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
          post.userBookmark =
            (
              await knex("bookmark")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
        }
      }
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  }
  async getPostByID(req, res) {
    try {
      const id = req.params.id;
      if (Number(id) !== parseInt(id)) {
        return res.status(404).end();
      }
      const user = tokenService.validateAccessToken(
        req.headers.authorization?.split(" ")[1]
      );
      const post = await Posts()
        .where({ "p.id": id })
        .groupBy("p.id", "u.id", "g.id")
        .orderBy("likes_count", "desc")
        .first();
      if (!post) {
        return res.status(404).end();
      }
      if (user) {
        post.userLike =
          (
            await knex("post_like")
              .count()
              .where({ user_id: user.id, post_id: post.id })
              .first()
          ).count > 0;
        post.userBookmark =
          (
            await knex("bookmark")
              .count()
              .where({ user_id: user.id, post_id: post.id })
              .first()
          ).count > 0;
      }
      res.status(200).json(post);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  async getPosts(req, res) {
    try {
      const { tags, sort } = req.query;
      const user = tokenService.validateAccessToken(
        req.headers.authorization?.split(" ")[1]
      );
      const posts = await Posts()
        .groupBy("p.id", "u.id", "g.id")
        .modify((builder) => {
          if (tags) {
            builder.whereIn("t.tag", tags.split(","));
            builder.havingRaw(
              "count(distinct t.tag) = ?",
              tags.split(",").length
            );
          }

          if (sort) {
            if (sort === "popular") builder.orderBy("likes_count", "desc");
            else builder.orderBy("p.created_at", "desc");
          } else {
            builder.orderBy("p.created_at", "desc");
          }
        });

      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await knex("post_like")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
          post.userBookmark =
            (
              await knex("bookmark")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
        }
      }
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(400).json({ e });
    }
    //console.log(req.hostname);
  }
  async getPopularPosts(req, res) {
    try {
      const user = tokenService.validateAccessToken(
        req.headers.authorization?.split(" ")[1]
      );
      const posts = await Posts()
        .groupBy("p.id", "u.id", "g.id")
        .orderBy("likes_count", "desc");
      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await knex("post_like")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
          post.userBookmark =
            (
              await knex("bookmark")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
          // post.userLike =
          //   (
          //     await db.query(
          //       "select count(*) from post_like where user_id=$1 and post_id=$2",
          //       [user.id, post.id]
          //     )
          //   ).rows[0].count > 0;
        }
      }
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
    //console.log(req.hostname);
  }
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await knex("post").select("*").where({ id }).first();
      if (req.user.id !== post.user_id) {
        return res.status(403).end();
      }
      // const post = (await db.query(`select * from post where id=$1`, [id]))
      //   .rows[0];
      if (!post) {
        return res.status(404).end();
      }
      await knex("post").del().where({ id });
      // await db.query(`delete from post where id=$1`, [id]);
      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
  }
  async likePost(req, res) {
    try {
      const { post_id } = req.body;
      const user = req.user;
      if (!user) {
        res.status(401).end();
      }
      const liked = await knex("post_like")
        .where({
          user_id: user.id,
          post_id,
        })
        .first();
      // const liked = (
      //   await db.query(
      //     "select * from post_like where user_id=$1 and post_id=$2",
      //     [user.id, post_id]
      //   )
      // ).rows[0];
      if (liked) {
        await knex("post_like").del().where({
          user_id: user.id,
          post_id,
        });
        // await db.query(
        //   "delete from post_like where user_id=$1 and post_id=$2",
        //   [user.id, post_id]
        // );
      } else {
        await knex("post_like").insert({ user_id: user.id, post_id });
        // await db.query(
        //   "insert into post_like (user_id, post_id) values ($1,$2)",
        //   [user.id, post_id]
        // );
      }
      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
  }
  async createComment(req, res) {
    try {
      const { user_id, post_id, body, belongsTo } = req.body;

      const { id } = (
        await knex("comment")
          .insert({
            user_id,
            post_id,
            body,
            belonging: belongsTo,
          })
          .returning("id")
      )[0];
      const comment = await knex("comment as c")
        .join("person as u", "c.user_id", "u.id")
        .select(
          "c.id",
          "c.body",
          "c.created_at",
          "c.post_id",
          "c.belonging as belongsTo",
          knex.raw("to_jsonb(u.*) - 'passwordhash' AS USER")
        )
        .where("c.id", id)
        .first();
      // await db.query(
      //   "insert into comment (user_id,post_id,body) values ($1,$2,$3)",
      //   [user_id, post_id, body]
      // );
      res.json(comment);
    } catch (e) {
      console.log(e);
      res.status(400).end();
    }
  }
  async getComments(req, res) {
    try {
      const post_id = req.params.id;
      const comments = await knex("comment as c")
        .join("person as u", "c.user_id", "u.id")
        .select(
          "c.id",
          "c.body",
          "c.created_at",
          "c.post_id",
          "c.belonging as belongsTo",
          knex.raw("to_jsonb(u.*) - 'passwordhash' AS USER")
        )
        .where({ post_id })
        .groupBy("c.id", "u.id")
        .orderBy("c.created_at");
      // const comments = (
      //   await db.query(
      //     `SELECT c.id,c.body,c.created_at, c.post_id,
      //     to_jsonb(u.*) - 'passwordhash' AS USER
      //     FROM comment c
      //     JOIN person u ON c.user_id = u.id
      //     where post_id = $1
      //     GROUP BY c.id, u.id
      //     ORDER BY c.created_at;`,
      //     [post_id]
      //   )
      // ).rows;
      res.json(comments);
    } catch (e) {
      res.status(400).end();
    }
  }
  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const comment = await knex("comment").where({ id }).first();
      // const comment = (
      //   await db.query("select * from comment where id = $1", [id])
      // ).rows[0];
      if (!comment) return res.status(404).end();
      if (req.user.id !== comment.user_id) {
        return res.status(403).end();
      }
      await knex("comment").del().where({ id });
      // await db.query("delete from comment where id=$1", [id]);
      res.end();
    } catch (error) {
      res.status(400).end();
      console.log(error);
    }
  }
  async getSavedPosts(req, res) {
    try {
      const id = req.params.id;
      const user = req.user;
      const posts = await Posts()
        .leftJoin("bookmark as b", "p.id", "b.post_id")
        .where({ "b.user_id": user.id })
        .groupBy("p.id", "u.id", "g.id")
        .orderBy("p.created_at", "desc");
      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await knex("post_like")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
          post.userBookmark =
            (
              await knex("bookmark")
                .count()
                .where({ user_id: user.id, post_id: post.id })
                .first()
            ).count > 0;
        }
      }
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  }
}

module.exports = new PostController();
