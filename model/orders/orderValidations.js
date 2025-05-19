const Joi = require('joi');

const validateGuestOrder = (data) => {
  const schema = Joi.object({
    tableNumber: Joi.number().integer().min(1).max(100).required()
      .messages({
        'number.base': 'شماره میز باید عدد باشد',
        'number.integer': 'شماره میز باید عدد صحیح باشد',
        'number.min': 'شماره میز نمی‌تواند کمتر از ۱ باشد',
        'number.max': 'شماره میز نمی‌تواند بیشتر از ۱۰۰ باشد',
        'any.required': 'شماره میز الزامی است'
      }),
    items: Joi.array().min(1).items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
        specialRequest: Joi.string().allow('').optional()
      })
    ).required()
  });

  return schema.validate(data);
};

module.exports = {
  validateGuestOrder
};