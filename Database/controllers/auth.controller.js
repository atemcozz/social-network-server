const knex = require("../db");
const UserController = require("./user.controller");
const bcrypt = require("bcrypt");
const TokenService = require("../../service/token-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exception/ApiError");
const MailService = require("../../service/MailService");
const generate = require("../../utils/passwordGenerator");
class AuthController {
  async register(req, res, next) {
    const errors = validationResult(req); //Проверяем валидность запроса
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequestError(errors.array().at(0).msg));
    }
    const { name, surname, nickname, password, email } = req.body;
    const nicknameCandidate = await knex("person").where({ nickname }).first();
    if (nicknameCandidate) {
      return next(ApiError.BadRequestError("NICKNAME_ALREADY_TAKEN"));
    }
    const emailCandidate = await knex("person").where({ email }).first();
    if (emailCandidate) {
      return next(ApiError.BadRequestError("EMAIL_ALREADY_TAKEN"));
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = (
      await knex("person")
        .insert({
          name,
          surname,
          nickname,
          passwordhash: passwordHash,
          email,
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
    const user = await knex("person")
      .where({ nickname: nickname.trim() })
      .first();
    if (!user) {
      return next(ApiError.BadRequestError("ERR_WRONG_NICKNAME_PASSWORD"));
    }
    const validPassword = await bcrypt.compare(
      password.trim(),
      user.passwordhash
    );
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
    const token = TokenService.validateRefreshToken(refreshToken);
    if (!token) {
      return next(ApiError.BadRequestError("ERR_TOKEN_NOT_FOUND"));
    }
    const user = await knex("person").where({ id: token.id }).first();
    if (!user) {
      return next(ApiError.NotFoundError("ERR_USER_NOT_FOUND"));
    }
    const newTokens = TokenService.generateTokens({
      id: token.id,
      nickname: token.nickname,
    });
    await TokenService.removeToken(refreshToken);
    await TokenService.saveToken(token.id, newTokens.refreshToken);

    return res.json({ user: token, ...newTokens });
  }
  async recoverPassword(req, res, next) {
    const { email } = req.body;
    const user = await knex("person").where({ email: email.trim() }).first();
    if (!user) {
      return next(ApiError.NotFoundError("ERR_USER_EMAIL_NOT_FOUND"));
    }
    const password = generate({ length: 16 });
    console.log(password);
    const passwordHash = await bcrypt.hash(password, 10);
    await knex("person")
      .update({ passwordhash: passwordHash })
      .where({ email });
    await MailService.sendPasswordRecoveryMail(email, password);
    res.status(200).end();
  }
}
module.exports = new AuthController();
