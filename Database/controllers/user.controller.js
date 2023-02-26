const knex = require("../db");
const bcrypt = require("bcrypt");
const tokenService = require("../../service/token-service");
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
    const user = await knex("person").where({ id }).first();
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
        return next(ApiError.BadRequestError("NICKNAME_ALREADY_TAKEN"));
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
}
module.exports = new UserController();
