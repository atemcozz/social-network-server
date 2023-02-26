const jwt = require("jsonwebtoken");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("./constants");
const knex = require("../Database/db");
class TokenService {
  generateTokens(data) {
    const accessToken = jwt.sign(data, JWT_ACCESS_SECRET, {
      expiresIn: "24h",
    });
    const refreshToken = jwt.sign(data, JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  }
  async saveToken(user_id, newToken) {
    await knex("token").insert({ user_id, refresh_token: newToken });
  }
  async removeToken(refreshToken) {
    await knex("token").del().where({ refresh_token: refreshToken });
    return;
  }
  async removeAllTokens(user_id) {
    await knex("token").del().where({ user_id });
    return;
  }
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
module.exports = new TokenService();
