// config/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// فرمت سفارشی برای لاگ‌ها
const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: 'info', // سطح پایه لاگینگ
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // نمایش stack trace برای خطاها
    myFormat
  ),
  transports: [
    // لاگ‌های خطا در فایل جداگانه
    new transports.File({ 
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // تمام لاگ‌ها در فایل دیگر
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // نمایش لاگ‌ها در کنسول (فقط در توسعه)
    ...(process.env.NODE_ENV !== 'production' ? [
      new transports.Console()
    ] : [])
  ]
});

module.exports = logger;