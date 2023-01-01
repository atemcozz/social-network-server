const knex = require("../db");
const UserController = require("./user.controller");
const bcrypt = require("bcrypt");
const TokenService = require("../../service/token-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exception/ApiError");
class AuthController {
  async register(req, res, next) {
    const errors = validationResult(req); //Проверяем валидность запроса
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequestError(errors.array().at(0).msg));
    }
    const { name, surname, nickname, password } = req.body;
    const candidate = await knex("person").where({ nickname }).first();
    if (candidate) {
      return next(ApiError.BadRequestError("NICKNAME_ALREADY_TAKEN"));
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = (
      await knex("person")
        .insert({
          name,
          surname,
          nickname,
          passwordhash: passwordHash,
        })
        .returning("*")
    )[0];
    const { accessToken, refreshToken } = TokenService.generateTokens(
      user.id,
      nickname
    );
    await TokenService.saveToken(user.id, refreshToken);
    res.status(200).json({ user, accessToken, refreshToken });
  }
  async login(req, res, next) {
    const { nickname, password } = req.body;
    const user = await knex("person").where({ nickname }).first();
    if (!user) {
      return next(ApiError.BadRequestError("ERR_WRONG_NICKNAME_PASSWORD"));
    }
    const validPassword = await bcrypt.compare(password, user.passwordhash);
    if (!validPassword) {
      return next(ApiError.BadRequestError("ERR_WRONG_NICKNAME_PASSWORD"));
    }
    const { accessToken, refreshToken } = TokenService.generateTokens(
      user.id,
      nickname
    );
    if (req.body.refreshToken) {
      await TokenService.removeToken(req.body.refreshToken);
    }
    await TokenService.saveToken(user.id, refreshToken);
    res.json({ user, accessToken, refreshToken });
  }
  async logout(req, res) {
    const { refreshToken } = req.body;
    await TokenService.removeToken(refreshToken);
    res.status(200).end();
  }
  async refresh(req, res, next) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(ApiError.BadRequestError("ERR_TOKEN_NOT_FOUND"));
    }
    const user = TokenService.validateRefreshToken(refreshToken);
    if (!user) {
      return next(ApiError.BadRequestError("ERR_TOKEN_NOT_FOUND"));
    }
    const newTokens = TokenService.generateTokens(user.id, user.nickname);
    await TokenService.removeToken(refreshToken);
    await TokenService.saveToken(user.id, newTokens.refreshToken);

    return res.json({ user, ...newTokens });
  }
}
module.exports = new AuthController();
