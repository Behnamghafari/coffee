// models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [2, 100],
        msg: 'نام محصول باید بین ۲ تا ۱۰۰ کاراکتر باشد'
      }
    }
  },
  img: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [2, 100],
        msg: 'نام محصول باید بین ۲ تا ۱۰۰ کاراکتر باشد'
      }
    }
  },
  aboute : {
    type: DataTypes.TEXT(),
    allowNull: true,
    validate: {
      len: {
        args: [2, 100],
        msg: 'نام محصول باید بین ۲ تا ۱۰۰ کاراکتر باشد'
      }
    }
  },
  price: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'قیمت محصول نمی‌تواند منفی باشد'
      }
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'دسته‌بندی نمی‌تواند خالی باشد'
      }
    }
  },

  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'موجودی نمی‌تواند منفی باشد'
      }
    }
  },

  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['category']
    }
  ]
});

// تعریف ارتباطات
Product.associate = function(models) {
  Product.belongsToMany(models.Order, {
    through: models.OrderProduct,
    foreignKey: 'productId',
    as: 'orders'
  });
};


Product.associate = function() {
  const Order = require('../orders/orderModel');
  const OrderProduct = require('../orderProduct/orderProductModel');
  
  Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: 'productId',
    as: 'orders'
  });
};

module.exports = Product;
