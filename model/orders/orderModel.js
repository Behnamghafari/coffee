// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'مبلغ کل نمی‌تواند منفی باشد'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'processing', 'completed', 'cancelled']],
        msg: 'وضعیت سفارش نامعتبر است'
      }
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit', 'online'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['cash', 'credit', 'online']],
        msg: 'روش پرداخت نامعتبر است'
      }
    }
  },
  paymentStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  paranoid: true
});

// تعریف ارتباطات
Order.associate = function() {
  const User = require('../users/userModel');
  const Product = require('../products/productModel');
  const OrderProduct = require('../orderProduct/orderProductModel');
  
  Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: 'orderId',
    as: 'products'
  });
};


module.exports = Order;