const db = require("../db");
const UserController = require("./user.controller");
const bcrypt = require("bcrypt");
const TokenService = require("../../service/token-service");
const { validationResult } = require("express-validator");
class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req); //Проверяем валидность запроса
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array().at(0));
      }
      const { name, surname, nickname, password } = req.body;
      const candidate = await db.query(
        `select * from person where nickname = $1`,
        [nickname]
      );
      if (candidate.rows.length > 0) {
        return res.status(400).json({ msg: "Данный никнейм уже занят" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await db.query(
        `INSERT INTO person (name,surname,nickname,passwordHash) values ($1,$2,$3,$4) RETURNING *`,
        [name, surname, nickname, passwordHash]
      );
      const { accessToken, refreshToken } = TokenService.generateTokens(
        user.rows[0].id,
        nickname
      );
      await TokenService.saveToken(user.rows[0].id, refreshToken);
      res.cookie("refreshToken", refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      res.status(200).json({ user: user.rows[0], accessToken, refreshToken });
    } catch (e) {
      console.log(e);
      res
        .status(400)
        .json({ msg: "Произошла неизвестная ошибка, повторите запрос" });
    }
  }
  async login(req, res) {
    try {
      const { nickname, password } = req.body;
      const user = await db.query(`select * from person where nickname = $1`, [
        nickname,
      ]);
      if (user.rows.length === 0) {
        return res.status(400).json({ msg: "Неверный никнейм/пароль" });
      }
      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].passwordhash
      );
      if (!validPassword) {
        return res.status(400).json({ msg: "Неверный никнейм/пароль" });
      }
      const { accessToken, refreshToken } = TokenService.generateTokens(
        user.rows[0].id,
        nickname
      );
      await TokenService.saveToken(user.rows[0].id, refreshToken);
      res.cookie("refreshToken", refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      res.json({ user: user.rows[0], accessToken, refreshToken });
    } catch (e) {
      console.log(e);
      res
        .status(400)
        .json({ msg: "Произошла неизвестная ошибка, повторите запрос" });
    }
  }
  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      await TokenService.removeToken(refreshToken);
      res.clearCookie("refreshToken");
      res.json({ msg: "success" });
    } catch (e) {
      console.log(e);
      res
        .status(400)
        .json({ msg: "Произошла неизвестная ошибка, повторите запрос" });
    }
  }
  async refresh(req, res) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(400).json({ msg: "token not found" });
      }
      const user = TokenService.validateRefreshToken(refreshToken);
      if (!user) {
        return res.status(400).json({ msg: "token not found" });
      }
      const newTokens = TokenService.generateTokens(user.id, user.nickname);
      await TokenService.saveToken(user.id, newTokens.refreshToken);
      res.cookie("refreshToken", newTokens.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      return res.json({ user, ...newTokens });
    } catch (e) {
      console.log(e);
      res
        .status(400)
        .json({ msg: "Произошла неизвестная ошибка, повторите запрос" });
    }
  }
  async auth(req, res) {
    try {
    } catch (e) {
      console.log(e);
    }
  }
}
module.exports = new AuthController();
