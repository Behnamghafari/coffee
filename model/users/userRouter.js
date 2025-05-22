// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User  = require('./userModel');
const authAndRole = require('../../middlewares/auth');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const {Op} = require('sequelize')

// محدودیت نرخ برای جلوگیری از حملات Brute Force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 5, // حداکثر 5 درخواست
  message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.'
});

// ثبت‌نام کاربر
// routes/authRoutes.js
const { validationResult } = require('express-validator');
const { registerValidations } = require('../../middlewares/authUserValidations');

// ثابت‌های تنظیمات
const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '10h';

// روت GET برای دریافت لیست کاربران
router.get('/users', authAndRole(['modir', 'superAdmin', 'admin']), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'isActive', 'banReason', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(users);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور در دریافت کاربران'
        });
    }
});

// روت PUT برای ویرایش کاربر
router.put('/users/:id', authAndRole(['modir', 'superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { role, isActive, banReason, password } = req.body;
        const currentUser = req.user;
        
        // یافتن کاربر
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'کاربر یافت نشد'
            });
        }
        
        // اعتبارسنجی نقش
        if (currentUser.role !== 'modir' && currentUser.role !== 'superAdmin') {
            if (role && role !== user.role) {
                return res.status(403).json({
                    success: false,
                    error: 'شما مجاز به تغییر نقش کاربر نیستید'
                });
            }
        }
        
        // به‌روزرسانی فیلدها
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (banReason !== undefined) user.banReason = banReason;
        
        // تغییر رمز عبور در صورت وجود
        if (password && password.length >= 6) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'تغییرات با موفقیت ذخیره شد',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'خطای سرور در به‌روزرسانی کاربر'
        });
    }
});

router.post('/register', registerValidations, async (req, res) => {
  try {
    // 1. اعتبارسنجی ورودی‌ها
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // 2. بررسی تکراری نبودن ایمیل و نام کاربری
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'نام کاربری یا ایمیل قبلاً ثبت شده است'
      });
    }

    // 3. هش کردن پسورد با bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. تعیین نقش کاربر (اولین کاربر مدیر می‌شود)
    const userCount = await User.count();
    const role = userCount === 0 ? 'modir' : 'user';

    // 5. ایجاد کاربر جدید
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // ذخیره پسورد هش شده
      role
    });

    // 6. تولید توکن JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 7. پاسخ به کاربر (بدون نمایش اطلاعات حساس)
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      accessToken: token
    });

  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    res.status(500).json({
      error: 'خطای سرور در ثبت‌نام',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

// ورود کاربر
// router.post('/login', authLimiter, async (req, res) => {
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    

    // یافتن کاربر با نام کاربری یا ایمیل
    const user = await User.findOne({
      where:{username}
    })
    // const user = await User.findOne({
    //   where: {
    //        username
    //   }
    // });
    // const usert = user.toJSON()
    console.log(' user :' ,  user )
    
console.log(' user1 :' ,  user.password )

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'اعتبارسنجی ناموفق بود' });
    }
console.log(' user :' ,  user )

    // تولید توکن JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );
console.log(' token :' ,  token )

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      accessToken: token
    });

  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' + error });
  }
});

// دریافت اطلاعات کاربر جاری
router.get('/me', authAndRole(['admin','user','superAdmin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// routes/adminRoutes.js

// بن کردن کاربر (فقط مدیر اصلی و سوپرادمین)
router.put('/users/:id/suspend', authAndRole(['modir', 'superAdmin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, banReason } = req.body;
  
      // اعتبارسنجی ورودی‌ها
      if (typeof isActive !== 'boolean' || (isActive === false && !banReason)) {
        return res.status(400).json({ 
          error: 'وضعیت فعال بودن و دلیل بن کردن الزامی است' 
        });
      }
  
      // کاربر نمی‌تواند خودش را بن کند
      if (id === req.user.userId) {
        return res.status(400).json({ 
          error: 'شما نمی‌توانید حساب خود را غیرفعال کنید' 
        });
      }
  
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'کاربر یافت نشد' });
      }
  
      // مدیر اصلی نمی‌تواند توسط سوپرادمین بن شود
      if (user.role === 'modir' && req.user.role !== 'modir') {
        return res.status(403).json({ 
          error: 'فقط مدیر اصلی می‌تواند مدیران دیگر را مدیریت کند' 
        });
      }
  
      await user.update({ 
        isActive,
        banReason: isActive ? null : banReason,
        bannedAt: isActive ? null : new Date(),
        bannedBy: isActive ? null : req.user.userId
      });
  
      res.json({ 
        message: `کاربر با موفقیت ${isActive ? 'آزاد' : 'بن'} شد`,
        user: {
          id: user.id,
          username: user.username,
          isActive: user.isActive,
          banReason: user.banReason
        }
      });
  
    } catch (error) {
      console.error('خطا در بن کردن کاربر:', error);
      res.status(500).json({ error: 'خطای سرور در مدیریت کاربر' });
    }
  });

// فعال/غیرفعال کردن کاربر
router.put('/users/:id/status',authAndRole(['modir','superAdmin']) ,async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
  
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'وضعیت نامعتبر است' });
      }
  
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'کاربر یافت نشد' });
      }
  
      await user.update({ isActive });
      res.json({ message: `کاربر ${isActive ? 'فعال' : 'غیرفعال'} شد` });
  
    } catch (error) {
      res.status(500).json({ error: 'خطای سرور' });
    }
  });
  

  // routes/adminRoutes.js

// حذف کاربر (فقط مدیر اصلی)
router.delete('/users/:id', authAndRole(['modir']), async (req, res) => {
    try {
      const { id } = req.params;
  
      // مدیر اصلی نمی‌تواند خودش را حذف کند
      if (id === req.user.userId) {
        return res.status(400).json({ 
          error: 'شما نمی‌توانید حساب خود را حذف کنید' 
        });
      }
  
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'کاربر یافت نشد' });
      }
  
      // مدیر اصلی نمی‌تواند حذف شود
      if (user.role === 'modir') {
        return res.status(403).json({ 
          error: 'نمی‌توانید مدیر اصلی را حذف کنید' 
        });
      }
  
      // حذف نرم (soft delete)
      await user.destroy();
  
      res.json({ 
        message: 'کاربر با موفقیت حذف شد',
        deletedUser: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
  
    } catch (error) {
      console.error('خطا در حذف کاربر:', error);
      
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ 
          error: 'این کاربر دارای سفارشات فعال است و نمی‌تواند حذف شود' 
        });
      }
  
      res.status(500).json({ error: 'خطای سرور در حذف کاربر' });
    }
  });




  // routes/adminRoutes.js

// تغییر اطلاعات کاربر (مدیران و سوپرادمین‌ها)
router.put('/users/:id', authAndRole(['modir', 'superAdmin', 'admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, phone, role } = req.body;
  
      // اعتبارسنجی ورودی‌ها
      if (!username && !email && !phone && !role) {
        return res.status(400).json({ 
          error: 'حداقل یک فیلد برای به‌روزرسانی الزامی است' 
        });
      }
  
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'کاربر یافت نشد' });
      }
  
      // بررسی محدودیت‌های نقش:
      const currentUser = await User.findByPk(req.user.userId);
      
      // فقط مدیر اصلی می‌تواند نقش سوپرادمین و مدیران دیگر را تغییر دهد
      if (role && ['modir', 'superAdmin'].includes(role) && currentUser.role !== 'modir') {
        return res.status(403).json({ 
          error: 'فقط مدیر اصلی می‌تواند نقش مدیریتی تعیین کند' 
        });
      }
  
      // مدیر اصلی نمی‌تواند نقش خود را تغییر دهد
      if (user.role === 'modir' && role && role !== 'modir') {
        return res.status(403).json({ 
          error: 'نقش مدیر اصلی نمی‌تواند تغییر کند' 
        });
      }
  
      // مدیران نمی‌توانند نقش مدیر اصلی را تغییر دهند
      if (user.role === 'modir' && currentUser.role !== 'modir') {
        return res.status(403).json({ 
          error: 'شما مجاز به تغییر اطلاعات مدیر اصلی نیستید' 
        });
      }
  
      // فیلدهای قابل به‌روزرسانی
      const updatableFields = {};
      if (username) updatableFields.username = username;
      if (email) updatableFields.email = email;
      if (phone) updatableFields.phone = phone;
      if (role) updatableFields.role = role;
  
      await user.update(updatableFields);
  
      res.json({
        message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
        updatedUser: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      });
  
    } catch (error) {
      console.error('خطا در به‌روزرسانی کاربر:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'نام کاربری یا ایمیل تکراری است' 
        });
      }
  
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({ errors });
      }
  
      res.status(500).json({ error: 'خطای سرور در به‌روزرسانی کاربر' });
    }
  });


//   router.use(authenticate, roleAuth('modir', 'superAdmin'));

// لیست تمام کاربران
router.get('/users',authAndRole(['modir', 'superAdmin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});


module.exports = router;