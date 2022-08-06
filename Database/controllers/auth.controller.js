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
      res.status(200).json({ msg: "success", accessToken, refreshToken });
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
      res.json({ msg: "success", accessToken, refreshToken });
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
      const tokenData = await db.query(
        "select * from token where refreshtoken=$1",
        [refreshToken]
      );
      if (tokenData) {
        const user = await db.query("select * from person where id=$1", [
          tokenData.rows[0].user_id,
        ]);
        if (user.rows.length > 0) {
          console.log(user.rows[0]);
          const newTokens = TokenService.generateTokens(
            user.rows[0].id,
            user.rows[0].nickname
          );
          await TokenService.saveToken(user.rows[0].id, newTokens.refreshToken);
          res.cookie("refreshToken", newTokens.refreshToken, {
            maxAge: 2592000000,
            httpOnly: true,
          });
          return res.json({ msg: "success" });
        }
      }
      res.status(400).json({ msg: "token not found" });
    } catch (e) {
      console.log(e);
      res
        .status(400)
        .json({ msg: "Произошла неизвестная ошибка, повторите запрос" });
    }
  }
}
module.exports = new AuthController();
