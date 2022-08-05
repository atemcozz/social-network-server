const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  if (req.meth0d === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Not authorized" });
    }
    const decoded = jwt.verify(token, "secret123");
    next();
  } catch (e) {
    res.status(401).json({ message: "Not authorized" });
  }
};
