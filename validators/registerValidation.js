const { body } = require("express-validator");

const registerValidation = [
  body("nickname", "ERR_NICKNAME_TOO_SHORT").trim().notEmpty().isLength({
    min: 6,
  }),
  body("password", "ERR_PASSWORD_TOO_SHORT").trim().notEmpty().isLength({
    min: 8,
  }),
  body("name", "ERR_NAME_TOO_SHORT").trim().notEmpty().isLength({
    min: 2,
  }),
  body("surname", "ERR_SURNAME_TOO_SHORT").trim().notEmpty().isLength({
    min: 2,
  }),
  body("avatarUrl", "ERR_AVATAR_LOAD").optional().isURL(),
];
module.exports = {
  registerValidation,
};
