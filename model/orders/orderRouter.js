const express = require('express');
const path = require('path');
const router = express.Router();
const Order = require('./orderModel');
const OrderProduct = require('../orderProduct/orderProductModel');
const Product = require('../products/productModel');
const authAndRole = require('../../middlewares/auth');
const {Op}= require('sequelize');
// const { validateGuestOrder } = require('./orderValidations');




// روت GET برای دریافت سفارشات تحویل داده شده با صفحه‌بندی
router.get('/orders/delivered', authAndRole(['modir', 'superAdmin', 'admin']), async (req, res) => {
    try {
        const { page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;
        
        
        const orders = await Order.findAll({
            where: { 
                status: 'delivered',
                // deliveredAt: { [Op.not]: null }
            },
            order: [['deliveredAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        // console.log(' orders :' ,  orders )
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور در دریافت سفارشات'
        });
    }
});
router.post('/guest-order',async (req, res) => {
    try {
        const { tableNumber, customerNote, products } = req.body;

        const orderProducts = [];
        for (const product of products) {
            const p = await Product.findOne({
                where: { id: product.productId },
                raw: true
            });
            orderProducts.push({
                ...p,
                quantity: product.quantity,
                specialRequest: product.specialRequest
            });
        }

        const totalPrice = orderProducts.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const order = await Order.create({
            tableNumber,
            totalPrice,
            customerNote,
            products: orderProducts,
            status: 'pending'
        });

        // ارسال رویداد با ساختار کامل
        req.io.emit('new-pending-order', {
            id: order.id,
            tableNumber: order.tableNumber,
            status: order.status,
            products: order.products,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt,
            customerNote: order.customerNote
        });

        res.json({
            success: true,
            message: 'سفارش با موفقیت ثبت شد',
            orderId: order.id
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


router.post('/guest-order/v1', async (req, res) => {
  
  try {
    const { tableNumber, customerNote , products } = req.body;

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




router.get('/guest-order',authAndRole(['modir','admin','superAdmin']), async (req, res) => {
  
    try {
        const { status } = req.query;
           
        const where = { status: status || 'pending' };
        const orders = await Order.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});


// همه سفارشات امروز
router.get('/all-guest-order', authAndRole(['modir','admin','superAdmin']), async (req, res) => {
    try {
        // تاریخ امروز به صورت YYYY-MM-DD
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const where = {
            createdAt: {
                [Op.gte]: today // تاریخ بزرگتر یا مساوی امروز
            }
        };

        const orders = await Order.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching today orders:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور در دریافت سفارشات امروز'+ error
        });
    }
});

// روت برای به‌روزرسانی وضعیت سفارش
router.put('/guest-order/:id/status',authAndRole(['modir','admin','superAdmin']) ,async (req, res) => {

    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'سفارش یافت نشد'
            });
        }
        
        await order.update({ status });
        
        // اطلاع به تمام کلاینت‌ها
        req.io.emit('order-status-updated', order);
        
        res.json({
            success: true,
            message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

router.get('/products/list', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isAvailable: true },
      attributes: ['id', 'name', 'price', 'category', 'img']
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.get('/order', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

router.delete('/orders/:id', authAndRole(['modir','admin','superAdmin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const order = await Order.findOne({
      where: { id }
      // include: [/* مدل‌های وابسته اگر نیاز است */]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش مورد نظر یافت نشد'
      });
    }

    // فقط مدیر ارشد می‌تواند سفارش دیگران را حذف کند
    if (userRole !== 'modir' && userRole !== 'superAdmin' && order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'شما مجاز به حذف این سفارش نیستید'
      });
    }

    // حذف نرم
    await order.destroy();

    // اطلاع به کلاینت‌ها
    req.io.emit('order-deleted', { id });

    // ثبت در سیستم لاگ
    // logger.info(`Order ${id} deleted by user ${userId}`);

    return res.json({
      success: true,
      message: 'سفارش با موفقیت حذف شد',
      data: { id }
    });

  } catch (error) {
    logger.error('Error deleting order:', error);
    
    // مدیریت خطاهای خاص
    const errorResponse = {
      success: false,
      message: 'خطا در پردازش درخواست'
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
    }

    return res.status(500).json(errorResponse);
  }
});
module.exports = router;