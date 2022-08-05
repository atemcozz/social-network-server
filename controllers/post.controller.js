const db = require("../db");

class PostController {
  async createPost(req, res) {
    const { title, description, category, imagesurls, user_id, geo, videourl } =
      req.body;
    const newPost = await db.query(
      `INSERT INTO post (title,description, category, imagesurls, user_id, geo, videourl) values ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, category, imagesurls, user_id, geo, videourl]
    );
    res.json(newPost.rows[0]);
  }
  async getPostsByUser(req, res) {
    const id = req.query.id;
    const posts = await db.query(`select * from post where user_id = $1`, [id]);
    res.json(posts.rows);
  }
  async getOnePost(req, res) {
    const id = req.params.id;
    const post = await db.query(`select * from post where id=$1`, [id]);
    res.json(post.rows[0]);
  }
  async getPosts(req, res) {
    const posts = await db.query(`select * from post`);
    res.json(posts.rows);
  }
  async deletePost(req, res) {
    const id = req.params.id;
    await db.query(`delete from post where id=$1`, [id]);
    res.status(200).end();
  }
}

module.exports = new PostController();
