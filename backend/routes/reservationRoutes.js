const express = require('express');
const router = express.Router();
const {
  bookTable,
  getMyReservations,
  getReservationById
} = require('../controllers/reservationController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, bookTable);
router.get('/my-reservations', protect, getMyReservations);
router.get('/:id', protect, getReservationById);

module.exports = router;

