const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllReservations,
  updateReservationStatus,
  getAllUsers
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/reservations', getAllReservations);
router.put('/reservations/:id/status', updateReservationStatus);
router.get('/users', getAllUsers);

module.exports = router;

