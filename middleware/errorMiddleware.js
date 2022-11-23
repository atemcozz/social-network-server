const ApiError = require("../Database/exception/ApiError");

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    console.log(err.message);
    return res.status(err.status).json({ msg: err.message });
  }
  next();
};
