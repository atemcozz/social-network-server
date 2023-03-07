const tokenService = require("../service/token-service");
const knex = require("../db/db");
const ApiError = require("../exception/ApiError");
const { Posts } = require("../knex_templates/templates");
class PostController {
  async createPost(req, res, next) {
    const { title, content, tags, preview } = req.body;
    const user_id = req.user.id;

    if (title?.trim().length === 0) {
      return next(ApiError.BadRequestError("ERR_POST_TITLE_REQUIRED"));
    }
    const newPost = (
      await knex("post")
        .insert({
          user_id,
          title: title.trim(),
          content: content,
          preview: preview,
        })
        .returning("*")
    )[0];

    if (tags?.length > 0) {
      const tagsRows = tags
        .filter((tag) => tag.trim().length > 0)
        .map((tag) => ({
          post_id: newPost.id,
          tag,
        }));

      await knex("post_tag").insert(tagsRows);
    }

    res.json({ post_id: newPost.id });
  }
  async getPostsByUser(req, res, next) {
    const id = req.params.id;
    const user = tokenService.validateAccessToken(
      req.headers.authorization?.split(" ")[1]
    );
    if (isNaN(id)) {
      return next(ApiError.NotFoundError());
    }
    const posts = await Posts()
      .where({ "p.user_id": id })
      .groupBy("p.id", "u.id")
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
  }
  async getPostByID(req, res, next) {
    const id = req.params.id;

    if (isNaN(id)) {
      return next(ApiError.NotFoundError());
    }
    const user = tokenService.validateAccessToken(
      req.headers.authorization?.split(" ")[1]
    );
    const post = await Posts()
      .where({ "p.id": id })
      .groupBy("p.id", "u.id")
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
  }
  async getPosts(req, res, next) {
    const { tags, sort } = req.query;
    const user = tokenService.validateAccessToken(
      req.headers.authorization?.split(" ")[1]
    );
    const posts = await Posts()
      .groupBy("p.id", "u.id")
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
  }
  async getPopularPosts(req, res, next) {
    const user = tokenService.validateAccessToken(
      req.headers.authorization?.split(" ")[1]
    );
    const posts = await Posts()
      .groupBy("p.id", "u.id")
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
      }
    }
    res.json(posts);
  }
  async deletePost(req, res, next) {
    const { id } = req.params;
    const post = await knex("post").select("*").where({ id }).first();
    if (req.user.id !== post.user_id) {
      return next(ApiError.ForbiddenError());
    }

    if (!post) {
      return next(ApiError.NotFoundError());
    }
    await knex("post").del().where({ id });

    res.status(200).end();
  }
  async likePost(req, res, next) {
    const { post_id } = req.body;
    const user = req.user;
    if (!user) {
      return next(ApiError.UnauthorizedError());
    }
    const liked = await knex("post_like")
      .where({
        user_id: user.id,
        post_id,
      })
      .first();

    if (liked) {
      await knex("post_like").del().where({
        user_id: user.id,
        post_id,
      });
    } else {
      await knex("post_like").insert({ user_id: user.id, post_id });
    }
    res.status(200).end();
  }
  async createComment(req, res, next) {
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

    res.json(comment);
  }
  async getComments(req, res, next) {
    const post_id = req.params.id;
    if (isNaN(post_id)) {
      return next(ApiError.NotFoundError());
    }
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

    res.json(comments);
  }
  async deleteComment(req, res, next) {
    const { id } = req.params;
    const comment = await knex("comment").where({ id }).first();

    if (!comment) return res.status(404).end();
    if (req.user.id !== comment.user_id) {
      return next(ApiError.ForbiddenError());
    }
    await knex("comment").del().where({ id });

    res.end();
  }
  async getSavedPosts(req, res, next) {
    const id = req.params.id;
    const user = req.user;
    const posts = await Posts()
      .leftJoin("bookmark as b", "p.id", "b.post_id")
      .where({ "b.user_id": user.id })
      .groupBy("p.id", "u.id")
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
  }
}

module.exports = new PostController();
