// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'این نام کاربری قبلاً ثبت شده است'
    },
    validate: {
      len: {
        args: [3, 50],
        msg: 'نام کاربری باید بین ۳ تا ۵۰ کاراکتر باشد'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: {
      msg: 'این ایمیل قبلاً ثبت شده است'
    },
    validate: {
      isEmail: {
        msg: 'لطفاً یک ایمیل معتبر وارد کنید'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'رمز عبور باید حداقل ۶ کاراکتر داشته باشد'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('modir', 'superAdmin', 'admin', 'user'),
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['modir', 'superAdmin', 'admin', 'user']],
        msg: 'نقش کاربر نامعتبر است'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  banReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
 defaultScope: {
  attributes: { exclude: [] } // حذف محدودیت پیش‌فرض
},
scopes: {
  withoutPassword: {
    attributes: { exclude: ['password'] }
  }
}
});

// تعریف ارتباطات
User.associate = function() {
    // const { Order, Product } = require('./'); // import سایر مدل‌ها
    const Order = require('../orders/orderModel');
    const Product = require('../products/productModel');
    User.hasMany(Order, {
      foreignKey: 'userId',
      as: 'orders'
    });
    
    // سایر ارتباطات
  };

module.exports = User;