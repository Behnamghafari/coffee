// models/index.js (تکمیل)
const sequelize = require('../utils/db')
const User = require('./users/userModel');
const Product = require('./products/productModel');
const Order = require('./orders/orderModel');
const OrderProduct = require('./orderProduct/orderProductModel');


// تنظیم ارتباطات
User.associate({ Order, Product });
Product.associate({ Order, OrderProduct });
Order.associate({ User, Product, OrderProduct });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
//   OrderProduct
};