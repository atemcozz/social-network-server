const tokenService = require("../../service/token-service");
const db = require("../db");

class PostController {
  async createPost(req, res) {
    try {
      const files = req.files;
      const description = req.body.description;
      const user_id = req.user.id;
      if (
        (!files || files?.length === 0) &&
        (!description || description?.trim() === "")
      ) {
        return res.status(400).json({ msg: "Empty post" });
      }

      const newPost = (
        await db.query(
          `INSERT INTO post (description, user_id) values ($1,$2) RETURNING *`,
          [description ? description : "", user_id]
        )
      ).rows[0];
      if (files) {
        for (const at of files) {
          const type = at.mimetype.split("/")[0].replace("image", "photo");

          await db.query(
            "insert into post_media (type,url,post_id) values ($1,$2,$3)",
            [type, `http://localhost:4000/uploads/${at.filename}`, newPost.id]
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
    const id = req.params.id;
    const user = tokenService.validateAccessToken(
      req.headers.authorization?.split(" ")[1]
    );
    const posts = (
      await db.query(
        `SELECT p.id,p.description,p.created_at,
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
          `SELECT p.id,p.description,p.created_at,
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
    //console.log(req.hostname);
    const user = tokenService.validateAccessToken(
      req.headers.authorization?.split(" ")[1]
    );
    const posts = (
      await db.query(`SELECT p.id,p.description,p.created_at,
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
  }
  async deletePost(req, res) {
    const id = req.params.id;
    await db.query(`delete from post_media where post_id=$1`, [id], (err) => {
      if (err) {
        return res.status(400).end();
      }
    });
    await db.query(`delete from post where id=$1`, [id], (err) => {
      if (err) {
        return res.status(400).end();
      }
    });
    res.status(200).end();
  }
  async likePost(req, res) {
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
      await db.query("delete from post_like where user_id=$1 and post_id=$2", [
        user.id,
        post_id,
      ]);
    } else {
      await db.query(
        "insert into post_like (user_id, post_id) values ($1,$2)",
        [user.id, post_id]
      );
    }
    res.status(200).end();
  }

  async test(req, res) {
    const query = `select
      p.id,
      p.description,
      p.created_at,
      to_jsonb(u.*) - 'passwordhash' as user,
      array_agg(to_jsonb(pm.*) - 'id' - 'post_id') as attachments,
      (
        select
          count(*)
        from
          post_like
        where
          post_id = p.id
      ) as likes_count
    from
      post p
      join person u on p.user_id = u.id
      left join post_media pm on p.id = pm.post_id
      left join post_like pl on p.id = pl.post_id
    group by
      p.id,
      u.id`;
    const testres = (await db.query(query)).rows;
    res.json(testres);
  }
}

module.exports = new PostController();
