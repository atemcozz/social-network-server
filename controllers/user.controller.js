const knex = require("../db/db");
const bcrypt = require("bcrypt");
const tokenService = require("../service/token-service");
const ApiError = require("../exception/ApiError");
const { validationResult } = require("express-validator");
class UserController {
  async getUsers(req, res, next) {
    const users = await knex("person");
    res.json(users.rows);
  }
  async getUserByNickname(req, res, next) {
    const nickname = req.query.nickname;
    const user = await knex("person").where({ username }).first();
    res.json(user);
  }
  async getOneUser(req, res, next) {
    const id = req.params.id;
    let user = await knex("person").where({ id }).first();
    if (req.user) {
      const sub = await knex("person_subscription")
        .where({ subject_id: req.user.id, object_id: user.id })
        .first();
      if (sub) {
        user.subscribed = true;
      }
    }
    res.json(user);
  }
  async updateUser(req, res, next) {
    const { name, surname, nickname, password, avatar } = req.body;
    const errors = validationResult(req);
    const id = req.params.id;
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequestError(errors.array().at(0).msg));
    }
    if (Number(id) !== parseInt(id)) {
      return next(ApiError.NotFoundError());
    }
    if (name) {
      console.log(name);
      await knex("person").update({ name }).where({ id });
    }
    if (surname) {
      await knex("person").update({ surname }).where({ id });
    }
    if (nickname) {
      const user = await knex("person").where({ nickname }).first();

      if (user && user.nickname !== req.user.nickname) {
        return next(ApiError.BadRequestError("ERR_NICKNAME_ALREADY_TAKEN"));
      }
      await knex("person").update({ nickname }).where({ id });
    }
    if (password) {
      await tokenService.removeAllTokens(id);
      const passwordHash = await bcrypt.hash(password, 10);
      await knex("person").update({ passwordhash: passwordHash }).where({ id });
    }
    if (avatar) {
      await knex("person").update({ avatar_url: avatar }).where({ id });
    }
    const user = await knex("person").where({ id }).first();

    res.json(user);
  }
  async deleteUser(req, res, next) {
    const id = req.params.id;
    await knex("person").del().where({ id });
    res.status(200).end();
  }
  async addBookmark(req, res, next) {
    const user = req.user;
    const { post_id } = req.body;
    if (!user) {
      return next(ApiError.UnauthorizedError());
    }
    const bookmark = await knex("bookmark")
      .where({
        user_id: user.id,
        post_id,
      })
      .first();
    if (bookmark) {
      await knex("bookmark").del().where({
        user_id: user.id,
        post_id,
      });
    } else {
      await knex("bookmark").insert({ user_id: user.id, post_id });
    }
    res.status(200).end();
  }
  async subscribeUser(req, res, next) {
    const user = req.user;
    const object_id = req.params.id;
    if (!/^[1-9]\d*$/.test(object_id)) {
      return next(ApiError.BadRequestError());
    }
    const subscription = await knex("person_subscription")
      .where({ subject_id: user.id, object_id })
      .first();
    if (subscription) {
      await knex("person_subscription")
        .del()
        .where({ subject_id: user.id, object_id });
    } else {
      await knex("person_subscription").insert({
        subject_id: user.id,
        object_id,
      });
    }
    return res.status(200).end();
  }
  async getUserSubscriptions(req, res, next) {
    const id = req.params.id;
    console.log(id);
    const subscriptions = await knex("person_subscription").where({
      subject_id: id,
    });
    res.json(subscriptions);
  }
}

module.exports = new UserController();
