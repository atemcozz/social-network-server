const jwt = require("jsonwebtoken");
const TokenService = require("../service/token-service");
module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }

  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next();
  }
  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    return next();
  }
  const decoded = TokenService.validateAccessToken(token);
  if (!decoded) {
    return next();
  }
  req.user = decoded;
  next();
};
