const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const mongoose = require('mongoose');

const isValidObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(String(id)) && String(id).length === 24;

// Helper to format cart for frontend
const formatCart = (cartItems) => {
  let total_amount = 0;
  const items = cartItems.map((c) => {
    const food = c.foodItem || {};
    const subtotal = (food.price || 0) * c.quantity;
    total_amount += subtotal;
    const cat = food.category || {};
    return {
      cart_id: c._id,          // MongoDB cart document ID — used for update/remove
      food_id: food._id,       // FoodItem ID
      name: food.name || '',
      price: food.price || 0,
      image: food.image || '',
      quantity: c.quantity,
      subtotal,
      is_available: food.isAvailable ? 1 : 0,
      category_name: cat.name || ''
    };
  });

  return {
    items,
    total_items: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: total_amount,
    delivery_fee: 0,
    total_amount
  };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id })
      .populate({ path: 'foodItem', populate: { path: 'category' } })
      .lean();

    return res.status(200).json({ success: true, cart: formatCart(cartItems) });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart (or increment quantity)
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { food_id, quantity = 1 } = req.body;

    if (!food_id) {
      return res.status(400).json({ success: false, message: 'food_id is required.' });
    }

    if (!isValidObjectId(food_id)) {
      return res.status(400).json({ success: false, message: 'Invalid food item ID.' });
    }

    const food = await FoodItem.findById(food_id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }
    if (!food.isAvailable) {
      return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);

    // Upsert: increment quantity if exists, create if not
    await Cart.findOneAndUpdate(
      { user: req.user._id, foodItem: food._id },
      { $inc: { quantity: qty } },
      { upsert: true, new: true }
    );

    const cartItems = await Cart.find({ user: req.user._id })
      .populate({ path: 'foodItem', populate: { path: 'category' } })
      .lean();

    return res.status(200).json({
      success: true,
      message: `${food.name} added to cart.`,
      cart: formatCart(cartItems)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id    (id = cart document _id OR foodItem _id)
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    const paramId = req.params.id;

    if (!isValidObjectId(paramId)) {
      return res.status(400).json({ success: false, message: 'Invalid cart item ID.' });
    }

    if (isNaN(qty) || qty <= 0) {
      // Quantity 0 or less → remove item
      await Cart.findOneAndDelete({
        $or: [{ _id: paramId }, { foodItem: paramId }],
        user: req.user._id
      });
    } else {
      // Try update by cart _id first, then by foodItem _id
      let updated = await Cart.findOneAndUpdate(
        { _id: paramId, user: req.user._id },
        { quantity: qty },
        { new: true }
      );
      if (!updated) {
        updated = await Cart.findOneAndUpdate(
          { foodItem: paramId, user: req.user._id },
          { quantity: qty },
          { new: true }
        );
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Cart item not found.' });
      }
    }

    const cartItems = await Cart.find({ user: req.user._id })
      .populate({ path: 'foodItem', populate: { path: 'category' } })
      .lean();

    return res.status(200).json({ success: true, cart: formatCart(cartItems) });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id   (id = cart _id OR foodItem _id)
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const paramId = req.params.id;

    if (!isValidObjectId(paramId)) {
      return res.status(400).json({ success: false, message: 'Invalid cart item ID.' });
    }

    const deleted = await Cart.findOneAndDelete({
      $or: [{ _id: paramId }, { foodItem: paramId }],
      user: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const cartItems = await Cart.find({ user: req.user._id })
      .populate({ path: 'foodItem', populate: { path: 'category' } })
      .lean();

    return res.status(200).json({ success: true, message: 'Item removed.', cart: formatCart(cartItems) });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    return res.status(200).json({ success: true, message: 'Cart cleared.', cart: formatCart([]) });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync guest cart items (by food name or food_id) into logged-in user cart
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    for (const item of items) {
      // Guest cart items use: { id, name, price, quantity, image }
      // DB cart items use: { food_id, ... }
      const rawId = item.food_id || item.id;

      if (isValidObjectId(rawId)) {
        const food = await FoodItem.findById(rawId);
        if (!food || !food.isAvailable) continue;
        await Cart.findOneAndUpdate(
          { user: req.user._id, foodItem: food._id },
          { $inc: { quantity: item.quantity || 1 } },
          { upsert: true, new: true }
        );
      } else if (item.name) {
        // Fallback: match by name (case-insensitive)
        const food = await FoodItem.findOne({
          name: { $regex: `^${item.name.trim()}$`, $options: 'i' },
          isAvailable: true
        });
        if (!food) continue;
        await Cart.findOneAndUpdate(
          { user: req.user._id, foodItem: food._id },
          { $inc: { quantity: item.quantity || 1 } },
          { upsert: true, new: true }
        );
      }
    }

    const cartItems = await Cart.find({ user: req.user._id })
      .populate({ path: 'foodItem', populate: { path: 'category' } })
      .lean();

    return res.status(200).json({ success: true, cart: formatCart(cartItems) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, syncCart };
