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
  async saveToken(user_id, refreshToken) {
    const tokenData = await db.query("select * from token where user_id=$1", [
      user_id,
    ]);
    if (tokenData.rows.length > 0) {
      await db.query("update token set refreshtoken=$1 where user_id=$2", [
        refreshToken,
        user_id,
      ]);
      return;
    }
    await db.query("insert into token (user_id, refreshtoken) values ($1,$2)", [
      user_id,
      refreshToken,
    ]);
  }
  async removeToken(refreshToken) {
    await db.query("delete from token where refreshToken=$1", [refreshToken]);
    return;
  }
}
module.exports = new TokenService();
