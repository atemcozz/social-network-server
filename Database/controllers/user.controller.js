const db = require("../db");
const bcrypt = require("bcrypt");
const tokenService = require("../../service/token-service");
class UserController {
  async getUsers(req, res) {
    const users = await db.query(`select * from person`);
    res.json(users.rows);
  }
  async getUserByNickname(req, res) {
    const nickname = req.query.nickname;
    const user = await db.query(`select * from person where nickname = $1`, [
      nickname,
    ]);
    res.json(user.rows[0]);
  }
  async getOneUser(req, res) {
    const id = req.params.id;
    const user = await db.query(`select * from person where id = $1`, [id]);
    res.json(user.rows[0]);
  }
  async updateUser(req, res) {
    try {
      const { name, surname, nickname, password } = req.body;
      const avatar = req.file;
      const id = req.params.id;
      if (Number(id) !== parseInt(id)) {
        return res.status(404).end();
      }
      if (name) {
        console.log(name);
        await db.query(`update person set name = $1 where id=$2`, [name, id]);
      }
      if (surname) {
        await db.query(`update person set surname = $1 where id=$2`, [
          surname,
          id,
        ]);
      }
      if (nickname) {
        const nicknameExists = (
          await db.query(`select * from person where nickname=$1`, [id])
        ).rows[0];
        if (nicknameExists) {
          return res.status(400).json({ msg: "Никнейм уже занят" });
        }
        await db.query(`update person set nickname = $1 where id=$2`, [
          nickname,
          id,
        ]);
      }
      if (password) {
        await tokenService.removeAllTokens(id);
        const passwordHash = await bcrypt.hash(password, 10);
        await db.query(`update person set passwordhash = $1 where id=$2`, [
          passwordHash,
          id,
        ]);
      }
      if (avatar) {
        await db.query("update person set avatar_url = $1 where id = $2", [
          avatar.path,
          id,
        ]);
      }
      const user = (await db.query(`select * from person where id=$1`, [id]))
        .rows[0];
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
  }
  async deleteUser(req, res) {
    const id = req.params.id;
    await db.query(`delete from person where id=$1`, [id]);
    res.status(200).end();
  }
}
module.exports = new UserController();
