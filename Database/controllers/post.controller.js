const tokenService = require("../../service/token-service");
const db = require("../db");
const cloudinary = require("cloudinary").v2;
class PostController {
  async createPost(req, res) {
    try {
      const files = req.files;
      const { description, nsfw } = req.body;
      const user_id = req.user.id;
      if (
        (!files || files?.length === 0) &&
        (!description || description?.trim() === "")
      ) {
        return res.status(400).json({ msg: "Empty post" });
      }
      const newPost = (
        await db.query(
          `INSERT INTO post (description, user_id, nsfw) values ($1,$2, $3) RETURNING *`,
          [description ? description : "", user_id, nsfw]
        )
      ).rows[0];
      if (files) {
        for (const at of files) {
          const type = at.mimetype.split("/")[0].replace("image", "photo");
          await db.query(
            "insert into post_media (type,url,post_id) values ($1,$2,$3)",
            [type, at.path, newPost.id]
          );
        }
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
      const posts = (
        await db.query(
          `SELECT p.id,p.description,p.created_at, p.nsfw,
      to_jsonb(u.*) - 'passwordhash' AS USER,
      array_agg(to_jsonb(pm.*) - 'id' - 'post_id') AS attachments,
      (SELECT count(*) FROM post_like WHERE post_id = p.id ) AS likes_count,
      (SELECT count(*) FROM COMMENT WHERE post_id = p.id ) AS comments_count
      FROM post p
      JOIN person u ON p.user_id = u.id
      LEFT JOIN post_media pm ON p.id = pm.post_id
      WHERE p.user_id = $1
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`,
          [id]
        )
      ).rows;
      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await db.query(
                "select count(*) from post_like where user_id=$1 and post_id=$2",
                [user.id, post.id]
              )
            ).rows[0].count > 0;
        }
      }
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(400).end();
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
      const post = (
        await db.query(
          `SELECT p.id,p.description,p.created_at, p.nsfw,
      to_jsonb(u.*) - 'passwordhash' AS USER,
      array_agg(to_jsonb(pm.*) - 'id' - 'post_id') AS attachments,
      (SELECT count(*) FROM post_like WHERE post_id = p.id ) AS likes_count,
      (SELECT count(*) FROM COMMENT WHERE post_id = p.id ) AS comments_count
      FROM post p
      JOIN person u ON p.user_id = u.id
      LEFT JOIN post_media pm ON p.id = pm.post_id
      WHERE p.id=$1
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`,
          [id]
        )
      ).rows[0];
      if (!post) {
        return res.status(404).end();
      }
      if (user) {
        post.userLike =
          (
            await db.query(
              "select count(*) from post_like where user_id=$1 and post_id=$2",
              [user.id, post.id]
            )
          ).rows[0].count > 0;
      }
      res.status(200).json(post);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  async getPosts(req, res) {
    try {
      const user = tokenService.validateAccessToken(
        req.headers.authorization?.split(" ")[1]
      );
      const posts = (
        await db.query(`SELECT p.id,p.description,p.created_at, p.nsfw,
      to_jsonb(u.*) - 'passwordhash' AS USER,
      array_agg(to_jsonb(pm.*) - 'id' - 'post_id') AS attachments,
      (SELECT count(*) FROM post_like WHERE post_id = p.id ) AS likes_count,
      (SELECT count(*) FROM COMMENT WHERE post_id = p.id ) AS comments_count
      FROM post p
      JOIN person u ON p.user_id = u.id
      LEFT JOIN post_media pm ON p.id = pm.post_id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`)
      ).rows;
      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await db.query(
                "select count(*) from post_like where user_id=$1 and post_id=$2",
                [user.id, post.id]
              )
            ).rows[0].count > 0;
        }
      }
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
    //console.log(req.hostname);
  }
  async getPopularPosts(req, res) {
    try {
      const user = tokenService.validateAccessToken(
        req.headers.authorization?.split(" ")[1]
      );
      const posts = (
        await db.query(`SELECT p.id,p.description,p.created_at, p.nsfw,
      to_jsonb(u.*) - 'passwordhash' AS USER,
      array_agg(to_jsonb(pm.*) - 'id' - 'post_id') AS attachments,
      (SELECT count(*) FROM post_like WHERE post_id = p.id ) AS likes_count,
      (SELECT count(*) FROM COMMENT WHERE post_id = p.id ) AS comments_count
      FROM post p
      JOIN person u ON p.user_id = u.id
      LEFT JOIN post_media pm ON p.id = pm.post_id
      GROUP BY p.id, u.id
      ORDER BY likes_count DESC`)
      ).rows;
      if (user) {
        for (const post of posts) {
          post.userLike =
            (
              await db.query(
                "select count(*) from post_like where user_id=$1 and post_id=$2",
                [user.id, post.id]
              )
            ).rows[0].count > 0;
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
      const post = (await db.query(`select * from post where id=$1`, [id]))
        .rows[0];
      if (!post) {
        return res.status(404).end();
      }

      await db.query(`delete from post where id=$1`, [id]);
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
      const liked = (
        await db.query(
          "select * from post_like where user_id=$1 and post_id=$2",
          [user.id, post_id]
        )
      ).rows[0];
      if (liked) {
        await db.query(
          "delete from post_like where user_id=$1 and post_id=$2",
          [user.id, post_id]
        );
      } else {
        await db.query(
          "insert into post_like (user_id, post_id) values ($1,$2)",
          [user.id, post_id]
        );
      }
      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
  }
  async createComment(req, res) {
    try {
      const { user_id, post_id, body } = req.body;
      await db.query(
        "insert into comment (user_id,post_id,body) values ($1,$2,$3)",
        [user_id, post_id, body]
      );
      res.end();
    } catch (e) {
      res.status(400).end();
    }
  }
  async getComments(req, res) {
    try {
      const post_id = req.params.id;
      const comments = (
        await db.query(
          `SELECT c.id,c.body,c.created_at, c.post_id,
          to_jsonb(u.*) - 'passwordhash' AS USER
          FROM comment c
          JOIN person u ON c.user_id = u.id
          where post_id = $1
          GROUP BY c.id, u.id
          ORDER BY c.created_at;
    ;
  
  `,
          [post_id]
        )
      ).rows;
      res.json(comments);
    } catch (e) {
      res.status(400).end();
    }
  }
  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      const comment = (
        await db.query("select * from comment where id = $1", [id])
      ).rows[0];
      if (!comment) return res.status(404).end();
      if (req.user.id !== comment.user_id) {
        return res.status(403).end();
      }
      await db.query("delete from comment where id=$1", [id]);
      res.end();
    } catch (error) {
      req.status(400).end();
    }
  }
  // async getPostMQ(req, res) {
  //   try {
  //     const id = req.params.id;
  //     if (Number(id) !== parseInt(id)) {
  //       return res.status(404).end();
  //     }
  //     const user = tokenService.validateAccessToken(
  //       req.headers.authorization?.split(" ")[1]
  //     );
  //     // const post = (
  //     //   await db.query(
  //     //     `SELECT p.id,p.description,p.created_at, p.nsfw,
  //     // to_jsonb(u.*) - 'passwordhash' AS USER,
  //     // array_agg(to_jsonb(pm.*) - 'id' - 'post_id') AS attachments,
  //     // (SELECT count(*) FROM post_like WHERE post_id = p.id ) AS likes_count,
  //     // (SELECT count(*) FROM COMMENT WHERE post_id = p.id ) AS comments_count
  //     // FROM post p
  //     // JOIN person u ON p.user_id = u.id
  //     // LEFT JOIN post_media pm ON p.id = pm.post_id
  //     // WHERE p.id=$1
  //     // GROUP BY p.id, u.id
  //     // ORDER BY p.created_at DESC`,
  //     //     [id]
  //     //   )
  //     // ).rows[0];
  //     const { user_id, ...post } = (
  //       await db.query(
  //         `select *, (SELECT count(*) FROM post_like WHERE post_id = p.id ) AS likes_count,
  //        (SELECT count(*) FROM COMMENT WHERE post_id = p.id ) AS comments_count from post p where id=$1`,
  //         [id]
  //       )
  //     ).rows[0];
  //     const user_info = (
  //       await db.query(
  //         `select id, name, surname, nickname, avatar_url from person where id=$1`,
  //         [user_id]
  //       )
  //     ).rows[0];
  //     const attachments = (
  //       await db.query(`select type, url from post_media where post_id = $1`, [
  //         id,
  //       ])
  //     ).rows;
  //     if (!post) {
  //       return res.status(404).end();
  //     }
  //     if (user) {
  //       post.userLike =
  //         (
  //           await db.query(
  //             "select count(*) from post_like where user_id=$1 and post_id=$2",
  //             [user.id, post.id]
  //           )
  //         ).rows[0].count > 0;
  //     }
  //     res.status(200).json({ ...post, user: user_info, attachments });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).end();
  //   }
  // }
}

module.exports = new PostController();
