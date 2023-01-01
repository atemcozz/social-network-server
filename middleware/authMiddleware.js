const jwt = require("jsonwebtoken");
const ApiError = require("../Database/exception/ApiError");
const TokenService = require("../service/token-service");
module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return next(ApiError.UnauthorizedError());
    }
    const decoded = TokenService.validateAccessToken(token);
    if (!decoded) {
      return next(ApiError.UnauthorizedError());
    }
    req.user = decoded;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};
