const express = require('express');
const router = express.Router();
const {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getFoodItems);
router.get('/:id', getFoodItemById);
router.post('/', protect, adminOnly, createFoodItem);
router.put('/:id', protect, adminOnly, updateFoodItem);
router.delete('/:id', protect, adminOnly, deleteFoodItem);

module.exports = router;

