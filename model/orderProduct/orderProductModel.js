// models/OrderProduct.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/db');

const OrderProduct = sequelize.define('OrderProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders', // نام جدول Order در دیتابیس
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products', // نام جدول Product در دیتابیس
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'order_products', // نام جدول در دیتابیس
  timestamps: false,
  underscored: true // برای نامگذاری ستون‌ها به صورت snake_case
});

module.exports = OrderProduct;