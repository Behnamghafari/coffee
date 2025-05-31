// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type : DataTypes.INTEGER,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tableNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  customerNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // اضافه کردن فیلد products به عنوان JSON
  products: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
}, {
  timestamps: true,
  paranoid: true,
  hooks: {
    beforeValidate: (order) => {
      if (order.products && Array.isArray(order.products)) {
        // محاسبه قیمت کل بر اساس محصولات
        order.totalPrice = order.products.reduce((total, product) => {
          return total + (product.price * product.quantity);
        }, 0);
      }
    }
  }
});

// اگر نیاز به ارتباط با مدل Product دارید
// const Users = require('../users/userModel');
// const OrderProduct = require('../orderProduct/orderProductModel');
// Order.associate = function(models) {
//   Order.belongsToMany(Product, {
//     through: 'OrderProducts',
//     foreignKey: 'orderId',
//     as: 'productItems'
//   });
// };

  // Order.hasMany(Users, {
  //   // through: OrderProduct,
  //   foreignKey: 'userId',
  //   as: 'users'
  // });

  sequelize.sync({alter:true})


module.exports = Order;