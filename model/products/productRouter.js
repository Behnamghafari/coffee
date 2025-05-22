// routes/productRoutes.js
const express = require('express');
const Product = require('./productModel');
const router = express.Router();
const authAndRole = require('../../middlewares/auth');
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { sanitizeFilename } = require('../../utils/helpers');

// پیکربندی ذخیره‌سازی موقت
const storage = multer.memoryStorage(); // استفاده از memory storage برای پردازش با Sharp

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت فایل نامعتبر است. فقط JPG, PNG و WebP مجاز هستند'), false);
    }
  }
});




// روت GET برای دریافت لیست محصولات
router.get('/products', authAndRole(['modir', 'superAdmin', 'admin', 'user']), async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json(products);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور در دریافت محصولات'
        });
    }
});

// روت PUT برای ویرایش محصول
router.put('/products/:id', authAndRole(['modir', 'superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { price, aboute, isAvailable } = req.body;
        
        // یافتن محصول
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'محصول یافت نشد'
            });
        }
        
        // به‌روزرسانی فیلدها
        if (price !== undefined) product.price = price;
        if (aboute !== undefined) product.aboute = aboute;
        if (isAvailable !== undefined) product.isAvailable = isAvailable;
        
        await product.save();
        
        res.json({
            success: true,
            message: 'تغییرات با موفقیت ذخیره شد',
            data: {
                id: product.id,
                name: product.name,
                price: product.price,
                isAvailable: product.isAvailable
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور در به‌روزرسانی محصول'
        });
    }
});

// روت DELETE برای حذف محصول
router.delete('/products/:id', authAndRole(['modir', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'محصول یافت نشد'
            });
        }
        
        // بررسی وجود سفارشات فعال برای این محصول
        const hasActiveOrders = await OrderProduct.findOne({
            where: { productId: id },
            include: [{
                model: Order,
                where: { 
                    status: { 
                        [Op.notIn]: ['delivered', 'cancelled'] 
                    } 
                }
            }]
        });
        
        if (hasActiveOrders) {
            return res.status(400).json({
                success: false,
                error: 'این محصول در سفارشات فعال وجود دارد و نمی‌تواند حذف شود'
            });
        }
        
        // حذف نرم (soft delete)
        await product.destroy();
        
        res.json({
            success: true,
            message: 'محصول با موفقیت حذف شد',
            data: { id }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور در حذف محصول'
        });
    }
});


router.post('/upload', 
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'هیچ فایلی آپلود نشده است'
        });
      }

      const uploadDir = 'public/uploads/products/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // تولید نام فایل
      const productName = req.body.productName || 'product';
      const safeName = sanitizeFilename(productName);
      const ext = '.jpg'; // همیشه به jpg تبدیل می‌شود
      const fileName = `${safeName}-${Date.now()}${ext}`;
      const outputPath = path.join(uploadDir, fileName);

      // پردازش تصویر با Sharp
      await sharp(req.file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 80,
          mozjpeg: true,
          progressive: true
        })
        .toFile(outputPath);

      const imageUrl = `/uploads/products/${fileName}`;

      res.json({
        success: true,
        message: 'تصویر با موفقیت آپلود و بهینه‌سازی شد',
        imageUrl: imageUrl,
        fileName: fileName
      });

    } catch (error) {
      console.error('خطا در پردازش تصویر:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در پردازش تصویر',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;

// ایجاد محصول (فقط مدیران و ادمین‌ها)

// اعتبارسنجی‌های مشترک
const productValidations = [
    check('name')
        .trim()
        .notEmpty().withMessage('نام محصول الزامی است')
        .isLength({ min: 2, max: 100 }).withMessage('نام محصول باید بین ۲ تا ۱۰۰ کاراکتر باشد'),
    
    check('price')
        .notEmpty().withMessage('قیمت محصول الزامی است')
        .isFloat({ min: 0 }).withMessage('قیمت محصول نمی‌تواند منفی باشد'),
    
    check('category')
        .trim()
        .notEmpty().withMessage('دسته‌بندی محصول الزامی است')
        .isLength({ max: 50 }).withMessage('دسته‌بندی نمی‌تواند بیش از ۵۰ کاراکتر باشد'),
    
    check('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('موجودی نمی‌تواند منفی باشد'),
    
    check('isAvailable')
        .optional()
        .isBoolean().withMessage('وضعیت محصول باید true یا false باشد')
];

// ایجاد محصول جدید
router.post('/newproduct', 
    authAndRole(["modir", 'admin', 'superAdmin']),
    // upload.single('image'),
    // processImage,
    // productValidations,
    async (req, res) => {
        try {
            // بررسی خطاهای اعتبارسنجی
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     // حذف عکس آپلود شده در صورت وجود خطا
            //     if (req.file) {
            //         fs.unlinkSync(req.file.path);
            //     }
            //     return res.status(400).json({
            //         success: false,
            //         errors: errors.array()
            //     });
            // }

            const { name, price, category, stock, isAvailable ,aboute ,img} = req.body;

            // بررسی تکراری نبودن نام محصول
            const existingProduct = await Product.findOne({ where: { name } });
            if (existingProduct) { 
                // if (req.file) {
                //     fs.unlinkSync(req.file.path);
                // }
                return res.status(400).json({
                    success: false,
                    message: 'محصولی با این نام قبلاً ثبت شده است'
                });
            }

            // ایجاد محصول جدید
            const newProduct = await Product.create({
                name,
                price,
                category,
                stock: stock || 0,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                aboute: aboute || null,
                img: img || null
                // img: req.file ? req.file.path.replace(/\\/g, '/') : null
            });

            res.status(201).json({
                success: true,
                message: 'محصول با موفقیت ایجاد شد',
                data: {
                    ...newProduct.toJSON(),
                    imageUrl: req.file ? `/uploads/products/${path.basename(req.file.path)}` : null
                }
            });

        } catch (error) {
            console.error('خطا در ایجاد محصول:', error);
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(400).json({
  success: false,
  message: 'خطا در اعتبارسنجی',
  errors: [
    { param: 'productName', msg: 'نام محصول الزامی است' },
    { param: 'productPrice', msg: 'قیمت باید عددی باشد' }
  ]
});
            // res.status(500).json({
            //     success: false,
            //     message: 'خطای سرور در ایجاد محصول',
            //     error: process.env.NODE_ENV === 'development' ? error.message : undefined
            // });
        }
    }
);


// لیست محصولات (برای همه کاربران)
router.get('/products', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    const where = {};

    if (category) where.category = category;
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (available) where.isAvailable = available === 'true';

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// جزئیات محصول
router.get('product/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// ویرایش محصول (فقط مدیران و ادمین‌ها)
router.put('/:id', authAndRole(['modir', 'admin', 'superAdmin']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }

    await product.update(req.body);
    res.json(product);

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// حذف محصول (فقط مدیر اصلی)
router.delete('/deleteproduct/:id', authAndRole(['modir']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }

    await product.destroy();
    res.json({ message: 'محصول با موفقیت حذف شد' });

  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});
// فعال/غیرفعال کردن محصول
router.put('/:id/status', authAndRole(['modir', 'admin', 'superAdmin']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'محصول یافت نشد' });
    }

    const isAvailable = !product.isAvailable;
    await product.update({ isAvailable });
    res.json({ message: `محصول ${isAvailable ? 'فعال' : 'غیرفعال'} شد` });

  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

module.exports = router;