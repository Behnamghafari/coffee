const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// پیکربندی ذخیره‌سازی موقت
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/temp/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// فیلتر فایل‌های مجاز
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری با فرمت JPEG, PNG یا WebP مجاز هستند'), false);
  }
};

// میدلور آپلود اولیه
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// میدلور پردازش تصویر
const processImage = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const tempPath = req.file.path;
    const fileName = req.file.filename;
    const uploadDir = 'uploads/products/';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const outputPath = path.join(uploadDir, fileName);
    
    // پردازش تصویر با Sharp
    await sharp(tempPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 80,
        mozjpeg: true 
      })
      .toFile(outputPath);
    
    // حذف فایل موقت
    fs.unlinkSync(tempPath);
    
    req.file.path = outputPath;
    req.file.processed = true;
    
    next();
  } catch (err) {
    console.error('خطا در پردازش تصویر:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(new Error('خطا در پردازش تصویر'));
  }
};

module.exports = {
  upload,
  processImage
};