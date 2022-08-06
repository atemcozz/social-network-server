const db = require("../db");

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
    const { name, surname, nickname, passwordHash } = req.body;
    const id = req.params.id;
    const user = await db.query(
      `update person set name = $1,surname = $2, nickname = $3, passwordHash = $4 where id=$5 returning *`,
      [name, surname, nickname, passwordHash, id]
    );
    res.json(user.rows[0]);
  }
  async deleteUser(req, res) {
    const id = req.params.id;
    await db.query(`delete from person where id=$1`, [id]);
    res.status(200).end();
  }
}
module.exports = new UserController();
