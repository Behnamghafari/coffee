const express = require('express');
const router = express.Router();
const Order = require('./orderModel');
const OrderProduct = require('../orderProduct/orderProductModel');
const Product = require('../products/productModel');

const { validateGuestOrder } = require('./orderValidations');

router.post('/guest-order', async (req, res) => {
  
  try {
    const { tableNumber, customerNote , products } = req.body;

   // اعتبارسنجی
    // const { error } = validateGuestOrder({ tableNumber, products });
    // if (error) {
    //   return res.status(400).json({
    //     success: false,
    //     message: error.details[0].message
    //   });
    // }
    // const products = items
    const orderProducts = []
  for(let product of products){
    const p = await Product.findOne({where:{
      id : product.productId
    },raw:true})
    orderProducts.push({...p,quantity:product.quantity, specialRequest:product.specialRequest })
  }
    // محاسبه قیمت کل
    const totalPrice = orderProducts.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    const data = {
      tableNumber,
      deliveredAt : Date.now(),
      totalPrice,
      customerNote,
      products: orderProducts, // ذخیره محصولات به صورت JSON
      status: 'pending'
    }
    // ایجاد سفارش
    const order = await Order.create(data);
       console.log(' order jadid :' ,  order )
       
    // ایجاد رکوردهای ارتباطی (اختیاری - اگر نیاز به جستجوی رابطه‌ای دارید)
    // await Promise.all(orderProducts.map(item => {
    //   return OrderProduct.create({
    //     orderId: order.id,
    //     productId: item.productId,
    //     quantity: item.quantity,
    //     unitPrice: item.price,
    //     specialRequest: item.specialRequest
    //   });
    // }));

    // ارسال به همه متصل‌های Socket.IO
    req.io.emit('new-order', {
      orderId: order.id,
      tableNumber: order.tableNumber,
      status: order.status,
      products: order.products,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt
    });


    res.json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      orderId: order.id,
      data:data
    });

  } catch (error) {
    console.error('خطا در ثبت سفارش:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت سفارش',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});




// روت برای به‌روزرسانی وضعیت سفارش به "تحویل داده شده"
router.put('/deliver/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // یافتن سفارش
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد'
      });
    }

    // بررسی وضعیت فعلی
    if (order.status !== 'pending' && order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'فقط سفارشات در حال انتظار یا آماده می‌توانند تحویل داده شوند'
      });
    }

    // به‌روزرسانی وضعیت
    await order.update({ 
      status: 'delivered',
      deliveredAt: new Date() // ذخیره زمان تحویل
    });

    // ارسال به همه متصل‌های Socket.IO
    req.io.emit('order-delivered', {
      orderId: order.id,
      status: order.status,
      deliveredAt: order.deliveredAt
    });

    res.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت به "تحویل داده شده" تغییر یافت',
      order
    });

  } catch (error) {
    console.error('خطا در به‌روزرسانی وضعیت سفارش:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی وضعیت سفارش',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});




// router.get('/guest-order', async (req, res) => {
//   console.log(' 1 :' ,  1 )
  
//     try {
//         const { status } = req.query;
//         console.log(' 1 :' ,  1 )
        
//         const where = { status: status || 'pending' };
//         const orders = await Order.findAll({
//             where,
//             order: [['createdAt', 'DESC']]
//         });
        
//         res.json({
//             success: true,
//             data: orders
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: 'خطای سرور'
//         });
//     }
// });

module.exports = router;