const jwt = require("jsonwebtoken");
const config = require("dotenv").config();



// middlewares/authAndRole.js
const User = require('../model/users/userModel');

/**
 * میدلور ترکیبی احراز هویت و کنترل نقش
 * @param {Array<String>|String} allowedRoles - نقش‌های مجاز (می‌تواند آرایه یا رشته باشد)
 * @param {Object} options - تنظیمات اختیاری
 * @param {Boolean} options.strict - اگر true باشد، فقط نقش‌های مشخص شده مجازند (پیش‌فرض: false)
 * @returns {Function} میدلور Express
 */
const authAndRole = (allowedRoles = [], options = {}) => {
  // تبدیل ورودی به آرایه (اگر رشته بود)
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const strictMode = options.strict || false;

  return async (req, res, next) => {
    try {
      // 1. بررسی وجود توکن در هدر Authorization
      const authHeader = req.get('Authorization');
      const token = authHeader && authHeader.split(' ')[1];
      // const token = authHeader 
      console.log(' token :' ,  token )
      
      
      if (!token) {
        return res.status(401).json({ 
          error: 'دسترسی غیرمجاز: توکن احراز هویت ارائه نشده است' 
        });
      }

      // 2. اعتبارسنجی توکن JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(' decoded :' ,  decoded )
      
      // 3. یافتن کاربر در دیتابیس
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'username', 'email', 'role', 'isActive']
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'دسترسی غیرمجاز: کاربر یافت نشد' 
        });
      }

      // 4. بررسی وضعیت فعال بودن کاربر
      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'حساب کاربری شما غیرفعال شده است' 
        });
      }

      // 5. بررسی نقش کاربر (در حالت strict)
      if (strictMode && roles.length > 0) {
        if (!roles.includes(user.role)) {
          return res.status(403).json({
            error: 'دسترسی غیرمجاز: نقش شما مجاز نیست',
            requiredRoles: roles,
            yourRole: user.role
          });
        }
      }

      // 6. بررسی نقش کاربر (در حالت غیر strict)
      if (!strictMode && roles.length > 0) {
        // اگر کاربر مدیر اصلی است، اجازه دسترسی دارد
        if (user.role !== 'modir' && !roles.includes(user.role)) {
          return res.status(403).json({
            error: 'دسترسی غیرمجاز: سطح دسترسی شما کافی نیست',
            requiredRoles: roles,
            yourRole: user.role
          });
        }
      }

      // 7. ذخیره اطلاعات کاربر در request
      req.user = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      console.error('خطا در میدلور احراز هویت:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'توکن منقضی شده است' 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'توکن نامعتبر است' 
        });
      }

      res.status(500).json({ 
        error: 'خطای سرور در احراز هویت' 
      });
    }
  };
};

module.exports = authAndRole;