// routes/productRoutes.js
const express = require('express');
const sequelize = require('../../utils/db');
const Product = require('./productModel');
// let pr = Product(sequelize,DataTypes)

const router = express.Router();
// const { Product } = require('./productModel');
const authAndRole = require('../../middlewares/auth');
const { Op } = require('sequelize');

// ایجاد محصول (فقط مدیران و ادمین‌ها)
router.post('/', authAndRole(['modir', 'admin', 'superAdmin']), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'نام، قیمت و دسته‌بندی الزامی هستند' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      isAvailable: true
    });

    res.status(201).json(product);

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// لیست محصولات (برای همه کاربران)
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.delete('/:id', authAndRole(['modir']), async (req, res) => {
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