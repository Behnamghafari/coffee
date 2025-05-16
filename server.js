const express = require('express');
const path = require('path');
const app =  express()
require('dotenv').config()
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const httpStatus = require('./utils/http-status-codes');
const logger = require('./utils/logger');
const PORT = process.env.PORT ;



console.log("\x1Bc");
console.log((new Date()).toLocaleString('fa'))
app.use((req,res,next)=>{
  console.log("\x1Bc");
    console.log((new Date()).toLocaleString('fa'))
    console.log(req.method + " " +req.hostname +":"+process.env.port+req.url);
    const startTime = Date.now();
    const originalSend = res.send;
    res.send = function (body) {
      // محاسبه اندازه بدنه پاسخ
        const sizeInBytes = Buffer.byteLength(body, "utf8"); // اندازه بدنه به بایت
        const sizeInKB = sizeInBytes / 1024; // تبدیل به کیلوبایت
        console.log(`Response size: ${sizeInKB.toFixed(2)} KB`);
        // فراخوانی متد اصلی send
        return originalSend.call(this, body);
      };
      next();
      const duration = Date.now() - startTime;
      console.log("request durtion: " + duration +"ms")
      
    })
    const productRouter =  require('./model/products/productRouter') 
const userRouter =  require('./model/users/userRouter') 
// const orderRouter =  require('./model/orders/orderRouter') 
const helmet = require('helmet');
const cors = require('cors');


// security
app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
//مسدود کردن دسترسی به فایل‌های خاص
app.use((req, res, next) => {
  const forbiddenFiles = ["package.json", "server.js", ".env"];
  if (forbiddenFiles.includes(path.basename(req.path))) {
      return res.status(403).send("Access forbidden");
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

//routes
app.use('/uploads', express.static('uploads'));
app.use('/',productRouter)
app.use('/',userRouter)
// app.use('/',orderRouter)








// ... سایر تنظیمات سرور ...

// =============================================
// میدلورهای اصلی برنامه
// =============================================

// ... میدلورهای دیگر ...

// =============================================
// ارور هندلرهای حرفه‌ای
// =============================================

/**
 * هندلر خطاهای 404 (صفحه یافت نشد)
 */
// app.use((req, res, next) => {
//   const error = new Error('منبع مورد نظر یافت نشد');
//   error.status = httpStatus.NOT_FOUND;
//   error.code = 'RESOURCE_NOT_FOUND';
//   error.details = {
//     method: req.method,
//     path: req.originalUrl,
//     timestamp: new Date().toISOString()
//   };
//   next(error);
// });

/**
 * هندلر اصلی خطاها
 */


app.use((req,res,next,err)=>{
  console.clear()
  return console.log(' err.message :' ,  err.message )
  
})
// app.use((err, req, res, next) => {
//   // تنظیم مقادیر پیش‌فرض برای خطا
//   err.status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
//   err.code = err.code || 'INTERNAL_SERVER_ERROR';
  
//   // لاگ خطا با جزئیات کامل
//   logger.error({
//     message: err.message,
//     code: err.code,
//     status: err.status,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//     details: err.details || {},
//     request: {
//       method: req.method,
//       url: req.originalUrl,
//       params: req.params,
//       query: req.query,
//       body: req.body,
//       ip: req.ip,
//       user: req.user ? req.user.id : undefined
//     }
//   });

//  // پاسخ مناسب بر اساس نوع خطا
//   let response = {
//     error: {
//       code: err.code,
//       message: err.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//     }
//   };

//  // خطاهای خاص Sequelize
//   if (err instanceof ValidationError) {
//     err.status = httpStatus.BAD_REQUEST;
//     err.code = 'VALIDATION_ERROR';
//     response.error.details = err.errors.map(e => ({
//       field: e.path,
//       message: e.message,
//       type: e.type,
//       value: e.value
//     }));
//   }

//   if (err instanceof UniqueConstraintError) {
//     err.status = httpStatus.CONFLICT;
//     err.code = 'DUPLICATE_ENTRY';
//     response.error.details = err.errors.map(e => ({
//       field: e.path,
//       message: 'مقدار تکراری برای فیلد منحصر به فرد',
//       value: e.value
//     }));
//   }

//   if (err instanceof DatabaseError) {
//     err.status = httpStatus.BAD_GATEWAY;
//     err.code = 'DATABASE_ERROR';
//     response.error.message = 'خطای پایگاه داده رخ داده است';
    
//     // در محیط توسعه جزئیات بیشتر نمایش داده شود
//     if (process.env.NODE_ENV === 'development') {
//       response.error.databaseMessage = err.original.message;
//       response.error.sql = err.sql;
//     }
//   }

//   // خطاهای JWT
//   if (err.name === 'JsonWebTokenError') {
//     err.status = httpStatus.UNAUTHORIZED;
//     err.code = 'INVALID_TOKEN';
//     response.error.message = 'توکن احراز هویت نامعتبر است';
//   }

//   if (err.name === 'TokenExpiredError') {
//     err.status = httpStatus.UNAUTHORIZED;
//     err.code = 'TOKEN_EXPIRED';
//     response.error.message = 'توکن احراز هویت منقضی شده است';
//     response.error.expiredAt = err.expiredAt;
//   }

//   // خطای نهایی به کاربر
//   res.status(err.status).json(response);
// });

// // =============================================
// // راه‌اندازی سرور
// // =============================================

// const server = app.listen(PORT, () => {
//   console.log(`سرور در حال اجرا روی پورت ${PORT}`);
// });
// // هندلرهای خطا برای راه‌اندازی سرور
// process.on('unhandledRejection', (err) => {
//   logger.error(`خطای unhandledRejection: ${err.message}`, { stack: err.stack });
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', (err) => {
//   logger.error(`خطای uncaughtException: ${err.message}`, { stack: err.stack });
//   server.close(() => process.exit(1));
// });

// process.on('SIGTERM', () => {
//   logger.info('دریافت SIGTERM. خاموش کردن سرور...');
//   server.close(() => {
//     logger.info('سرور با موفقیت خاموش شد');
//     process.exit(0);
//   });
// });

// }

app.listen(PORT) 
