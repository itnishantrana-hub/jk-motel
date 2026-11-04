const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Helper to format a food item for the frontend
const formatItem = (item) => {
  const cat = item.category || {};
  return {
    id: item._id,
    name: item.name,
    description: item.description || '',
    price: item.price,
    image: item.image || '',
    is_available: item.isAvailable ? 1 : 0,
    isAvailable: item.isAvailable,
    classification: item.classification,
    category_id: cat._id || null,
    category_name: cat.name || '',
    category_slug: cat.slug || ''
  };
};

// Helper to resolve category by ObjectId, numeric ID, slug, or name
const resolveCategory = async (catIdentifier) => {
  if (!catIdentifier) return null;
  const str = String(catIdentifier).trim();
  const numMap = {
    '1': 'veg',
    '2': 'non-veg',
    '3': 'fast-food',
    '4': 'beverages',
    '5': 'desserts'
  };
  const targetSlug = numMap[str] || str.toLowerCase();

  if (mongoose.Types.ObjectId.isValid(str) && str.length === 24) {
    const byId = await Category.findById(str);
    if (byId) return byId;
  }

  return await Category.findOne({
    $or: [
      { slug: targetSlug },
      { name: new RegExp(`^${str}$`, 'i') }
    ]
  });
};

// @desc    Get all food items (with optional search & category filter)
// @route   GET /api/food
// @access  Public
const getFoodItems = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;

    const query = {};

    // Filter by availability
    if (available === 'true') query.isAvailable = true;

    // Filter by category slug or name
    if (category && category !== 'all') {
      const cat = await resolveCategory(category);
      if (cat) {
        query.category = cat._id;
      } else {
        // No matching category — return empty
        return res.status(200).json({ success: true, food_items: [], data: [], total: 0 });
      }
    }

    // Search by name or description
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const items = await FoodItem.find(query).populate('category').lean();
    const food_items = items.map(formatItem);

    // Provide both food_items and data for complete compatibility
    return res.status(200).json({
      success: true,
      food_items,
      data: food_items,
      total: food_items.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
const getFoodItemById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || req.params.id.length !== 24) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const item = await FoodItem.findById(req.params.id).populate('category').lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    return res.status(200).json({ success: true, food_item: formatItem(item) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create food item
// @route   POST /api/food
// @access  Admin
const createFoodItem = async (req, res, next) => {
  try {
    const { name, description, price, category_id, image, isAvailable, classification } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required.'
      });
    }

    const category = await resolveCategory(category_id);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const item = await FoodItem.create({
      name: name.trim(),
      description: description || '',
      price: parseFloat(price) || 0,
      category: category._id,
      image: image || '',
      isAvailable: isAvailable !== false,
      classification: classification || (category.slug === 'non-veg' ? 'Non-Veg' : 'Veg')
    });

    const populated = await FoodItem.findById(item._id).populate('category').lean();

    return res.status(201).json({
      success: true,
      message: 'Food item created.',
      food_item: formatItem(populated)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Admin
const updateFoodItem = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || req.params.id.length !== 24) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const { name, description, price, category_id, image, isAvailable, classification } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price) || 0;
    if (image !== undefined) updates.image = image;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (classification) updates.classification = classification;

    if (category_id) {
      const category = await resolveCategory(category_id);
      if (!category) return res.status(400).json({ success: false, message: 'Invalid category.' });
      updates.category = category._id;
    }

    const item = await FoodItem.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('category').lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Food item updated.',
      food_item: formatItem(item)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
// @access  Admin
const deleteFoodItem = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || req.params.id.length !== 24) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const item = await FoodItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    return res.status(200).json({ success: true, message: 'Food item deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem };
