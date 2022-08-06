const { body } = require("express-validator");

const registerValidation = [
  body("nickname", "Никнейм должен содержать как минимум 6 символов")
    .trim()
    .notEmpty()
    .isLength({
      min: 6,
    }),
  body("password", "Пароль должен содержать как минимум 8 символов")
    .trim()
    .notEmpty()
    .isLength({
      min: 8,
    }),
  body("name", "Имя должно содержать как минимум 2 символа")
    .trim()
    .notEmpty()
    .isLength({
      min: 2,
    }),
  body("surname", "Фамилия должна содержать как минимум 2 символа")
    .trim()
    .notEmpty()
    .isLength({
      min: 2,
    }),
  body("avatarUrl", "Ошибка загрузки аватара").optional().isURL(),
];
module.exports = {
  registerValidation,
};
