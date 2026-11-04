const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/sync', protect, syncCart);
router.put('/:id', protect, updateCartItem);
router.delete('/:id', protect, removeCartItem);
router.delete('/', protect, clearCart);

module.exports = router;

