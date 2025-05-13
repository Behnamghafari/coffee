const {Sequelize} = require("sequelize");
require('dotenv').config()
// let sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER,process.env.DB_PASSWORD,{
//     dialect : process.env.DB_dialect,
//     host : process.env.DB_HOST
// })

// try{
//     sequelize.authenticate();
//    console.log("data base connected successfully");
// }
// catch(err){
//    console.log(err.message);
// }

// module.exports = sequelize;
// 2.1. اتصال به دیتابیس با تنظیمات امنیتی
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    // process.env.DB_HOST,
    {
      host: process.env.DB_HOST,
    //   port: process.env.DB_PORT,
      dialect: 'mysql',
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : null,
        connectTimeout: 60000
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      benchmark: true,
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ESOCKETTIMEDOUT/,
          /EHOSTDOWN/,
          /EPIPE/,
          /EAI_AGAIN/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        max: 3 // حداکثر 3 بار تلاش مجدد
      },
    logging : false,

    }
  );

  sequelize.sync({ alter: true });
  
  // 2.2. تست اتصال به دیتابیس
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('اتصال به دیتابیس با موفقیت برقرار شد.');
      
      // در حالت توسعه، مدل‌ها را sync کنید
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('مدل‌ها با موفقیت sync شدند.');
      }
    } catch (error) {
      console.error('خطا در اتصال به دیتابیس:', error);
      process.exit(1); // خروج با کد خطا
    }
  })();

 

  module.exports = sequelize;