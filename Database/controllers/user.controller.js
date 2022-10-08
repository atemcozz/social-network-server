const knex = require("../db");
const bcrypt = require("bcrypt");
const tokenService = require("../../service/token-service");
class UserController {
  async getUsers(req, res) {
    const users = await knex("person");
    res.json(users.rows);
  }
  async getUserByNickname(req, res) {
    const nickname = req.query.nickname;
    const user = await knex("person").where({ username }).first();
    res.json(user);
  }
  async getOneUser(req, res) {
    const id = req.params.id;
    const user = await knex("person").where({ id }).first();
    res.json(user);
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
        await knex("person").update({ name }).where({ id });
        // await db.query(`update person set name = $1 where id=$2`, [name, id]);
      }
      if (surname) {
        await knex("person").update({ surname }).where({ id });
        // await db.query(`update person set surname = $1 where id=$2`, [
        //   surname,
        //   id,
        // ]);
      }
      if (nickname) {
        const user = await knex("person").where({ nickname }).first();
        // await db.query(`select * from person where nickname=$1`, [id])
        if (user && user.nickname !== req.user.nickname) {
          return res.status(400).json({ msg: "Никнейм уже занят" });
        }
        await knex("person").update({ nickname }).where({ id });
        // await db.query(`update person set nickname = $1 where id=$2`, [
        //   nickname,
        //   id,
        // ]);
      }
      if (password) {
        await tokenService.removeAllTokens(id);
        const passwordHash = await bcrypt.hash(password, 10);
        await knex("person")
          .update({ passwordhash: passwordHash })
          .where({ id });
        // await db.query(`update person set passwordhash = $1 where id=$2`, [
        //   passwordHash,
        //   id,
        // ]);
      }
      if (avatar) {
        await knex("person").update({ avatar_url: avatar.path }).where({ id });
      }
      const user = await knex("person").where({ id }).first();
      // (await db.query(`select * from person where id=$1`, [id]))
      //   .rows[0];
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(400).end();
    }
  }
  async deleteUser(req, res) {
    try {
      const id = req.params.id;
      await knex("person").del().where({ id });
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}
module.exports = new UserController();
