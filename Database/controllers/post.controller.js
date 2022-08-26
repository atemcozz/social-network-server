const db = require("../db");

class PostController {
  async createPost(req, res) {
    const { user_id, description, attachments } = req.body;
    const newPost = (
      await db.query(
        `INSERT INTO post (description, user_id) values ($1,$2) RETURNING *`,
        [description, user_id]
      )
    ).rows[0];

    for (const at of attachments) {
      await db.query(
        "insert into post_media (type,url,post_id) values ($1,$2,$3)",
        [at.type, at.url, newPost.id]
      );
    }
    res.json(newPost);
  }
  async getPostsByUser(req, res) {
    const id = req.query.id;
    const posts = await db.query(`select * from post where user_id = $1`, [id]);
    res.json(posts.rows);
  }
  async getOnePost(req, res) {
    const id = req.params.id;
    const { user_id, ...post } = (
      await db.query(`select * from post where id=$1`, [id])
    ).rows[0];
    const attachments = (
      await db.query(`select type, url from post_media where post_id=$1`, [id])
    ).rows;
    const user = (
      await db.query(
        `select id, name,surname,nickname,avatar_url from person where id=$1`,
        [user_id]
      )
    ).rows[0];
    const likesCount = (
      await db.query(`select count(*) from post_like where post_id=$1`, [
        post.id,
      ])
    ).rows[0].count;
    const commentsCount = (
      await db.query(`select count(*) from comment where post_id=$1`, [post.id])
    ).rows[0].count;
    res.json({ ...post, user, likesCount, commentsCount, attachments });
  }
  async getPosts(req, res) {
    const posts = (
      await db.query(`select * from post order by created_at desc`)
    ).rows;

    const postsData = await Promise.all(
      posts.map(async ({ user_id, ...post }) => {
        const attachments = (
          await db.query(`select type, url from post_media where post_id=$1`, [
            post.id,
          ])
        ).rows;
        const user = (
          await db.query(
            `select id, name,surname,nickname,avatar_url from person where id=$1`,
            [user_id]
          )
        ).rows[0];
        const likesCount = (
          await db.query(`select count(*) from post_like where post_id=$1`, [
            post.id,
          ])
        ).rows[0].count;
        const commentsCount = (
          await db.query(`select count(*) from comment where post_id=$1`, [
            post.id,
          ])
        ).rows[0].count;

        return {
          ...post,
          user,
          likesCount,
          commentsCount,
          attachments,
        };
      })
    );
    res.json(postsData);
  }
  async deletePost(req, res) {
    const id = req.params.id;
    await db.query(`delete from post where id=$1`, [id]);
    res.status(200).end();
  }
  async likePost(req, res) {
    const { user_id, post_id } = req.body;
    const liked = (
      await db.query(
        "select * from post_like where user_id=$1 and post_id=$2",
        [user_id, post_id]
      )
    ).rows[0];
    if (liked) {
      await db.query("delete from post_like where user_id=$1 and post_id=$2", [
        user_id,
        post_id,
      ]);
    } else {
      await db.query(
        "insert into post_like (user_id, post_id) values ($1,$2)",
        [user_id, post_id]
      );
    }
    res.status(200).end();
  }
  async getLikeStatus(req, res) {
    const { user_id, post_id } = req.query;
    const liked = (
      await db.query(
        "select * from post_like where user_id=$1 and post_id=$2",
        [user_id, post_id]
      )
    ).rows[0];
    if (liked) {
      return res.status(200).json({ liked: true });
    }
    res.status(200).json({ liked: false });
  }
}

module.exports = new PostController();
