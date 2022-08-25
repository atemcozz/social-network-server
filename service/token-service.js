const jwt = require("jsonwebtoken");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("./constants");
const db = require("../Database/db");
class TokenService {
  generateTokens(id, nickname) {
    const accessToken = jwt.sign(
      { id: id, nickname: nickname },
      JWT_ACCESS_SECRET,
      {
        expiresIn: "24h",
      }
    );
    const refreshToken = jwt.sign(
      { id: id, nickname: nickname },
      JWT_REFRESH_SECRET,
      {
        expiresIn: "30d",
      }
    );
    return { accessToken, refreshToken };
  }
  async saveToken(user_id, newToken) {
    await db.query(
      "insert into token (user_id, refresh_token) values ($1,$2)",
      [user_id, newToken]
    );
  }
  async removeToken(refreshToken) {
    await db.query("delete from token where refresh_token=$1", [refreshToken]);
    return;
  }
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      console.log(e);
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
