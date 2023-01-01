const ApiError = require("../Database/exception/ApiError");

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ reason: err.reason });
  }
  console.error(err.stack);
  return res.status(500).json({
    reason: "INTERNAL_SERVER_ERROR",
  });
};
