const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9آ-ی_\-\s]/gi, '') // حذف کاراکترهای غیرمجاز
    .replace(/\s+/g, '-') // جایگزینی فاصله با خط تیره
    .replace(/-+/g, '-') // حذف خط تیره‌های تکراری
    .toLowerCase() // تبدیل به حروف کوچک
    .substring(0, 50); // محدودیت طول نام
};

module.exports = {
  sanitizeFilename
};