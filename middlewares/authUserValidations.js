// validations/authValidations.js
const { body } = require('express-validator');

exports.registerValidations = [
  body('username')
    .trim()
    .notEmpty().withMessage('نام کاربری الزامی است')
    .isLength({ min: 3, max: 30 }).withMessage('نام کاربری باید بین ۳ تا ۳۰ کاراکتر باشد'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('ایمیل الزامی است')
    .isEmail().withMessage('فرمت ایمیل نامعتبر است'),
  
  body('password')
    .notEmpty().withMessage('رمز عبور الزامی است')
    .isLength({ min: 6 }).withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد')
    .matches(/[A-Z]/).withMessage('رمز عبور باید حداقل شامل یک حرف بزرگ باشد')
    .matches(/[a-z]/).withMessage('رمز عبور باید حداقل شامل یک حرف کوچک باشد')
    .matches(/[0-9]/).withMessage('رمز عبور باید حداقل شامل یک عدد باشد')
];