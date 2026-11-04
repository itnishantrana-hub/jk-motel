const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const mongoose = require('mongoose');

// Helper to generate a URL-friendly slug
const toSlug = (str) =>
  str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const isValidObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(String(id)) && String(id).length === 24;

// @desc    Get all categories (with food item count)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();

    // Attach food item count per category
    const result = await Promise.all(
      categories.map(async (cat) => {
        const item_count = await FoodItem.countDocuments({
          category: cat._id,
          isAvailable: true
        });
        return {
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          image: cat.image || '',
          item_count
        };
      })
    );

    return res.status(200).json({ success: true, categories: result, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = toSlug(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists.' });
    }

    const category = await Category.create({ name: name.trim(), slug, description, image });

    return res.status(201).json({
      success: true,
      message: 'Category created.',
      category: { id: category._id, name: category.name, slug: category.slug }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { name, description, image, isActive } = req.body;
    const updates = {};

    if (name) {
      updates.name = name.trim();
      updates.slug = toSlug(name);
    }
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (isActive !== undefined) updates.isActive = isActive;

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({ success: true, message: 'Category updated.', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
