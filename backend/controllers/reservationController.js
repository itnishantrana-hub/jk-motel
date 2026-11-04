const Reservation = require('../models/Reservation');

// Format reservation for frontend
const formatReservation = (r) => {
  const obj = r.toObject ? r.toObject() : r;
  return {
    id: obj._id,
    name: obj.customerName,
    email: obj.email || '',
    phone: obj.phone,
    reservation_date: obj.reservationDate,
    reservation_time: obj.reservationTime,
    guests: obj.numberOfGuests,
    occasion: obj.occasion || '',
    special_requests: obj.specialRequests || '',
    status: obj.bookingStatus,
    created_at: obj.createdAt
  };
};

// Convert guest string to a numeric count for storage
// "1 Guest" → 1, "2 Guests" → 2, "5+ Guests" → 5, "7" → 7
const parseGuestCount = (guests) => {
  if (!guests) return null;
  const match = String(guests).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

// @desc    Book a table
// @route   POST /api/reservations
// @access  Public (optional auth)
const bookTable = async (req, res, next) => {
  try {
    // ── Accept all field-name conventions ──────────────────────────────────
    // Frontend sends: name, phone, reservation_date, reservation_time, guests, occasion, special_requests
    // Some callers may send:  date, time  (older convention)
    const name    = (req.body.name    || '').trim();
    const phone   = (req.body.phone   || '').trim();
    const email   = req.body.email    || (req.user ? req.user.email : '');
    // Accept both reservation_date and date
    const date    = req.body.reservation_date || req.body.date || '';
    // Accept both reservation_time and time
    const time    = req.body.reservation_time || req.body.time || '';
    const guestsRaw     = req.body.guests || req.body.numberOfGuests || '';
    const occasion      = req.body.occasion      || 'Regular dining';
    const specialReqs   = req.body.special_requests || req.body.specialRequests || '';

    // ── Validate required fields with specific messages ───────────────────
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide your phone number.' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Please select a reservation date.' });
    }
    if (!time) {
      return res.status(400).json({ success: false, message: 'Please select a reservation time.' });
    }
    if (!guestsRaw) {
      return res.status(400).json({ success: false, message: 'Please select the number of guests.' });
    }

    // Parse "5+ Guests" → 5, "2 Guests" → 2, etc.
    const guestCount = parseGuestCount(guestsRaw);
    if (!guestCount || guestCount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid number of guests.' });
    }

    const reservation = await Reservation.create({
      user:            req.user ? req.user._id : undefined,
      customerName:    name,
      email:           email,
      phone:           phone,
      reservationDate: date,
      reservationTime: time,
      numberOfGuests:  guestCount,        // stored as number
      guestLabel:      String(guestsRaw), // original display string e.g. "5+ Guests"
      occasion:        occasion,
      specialRequests: specialReqs
    });

    return res.status(201).json({
      success: true,
      message: `Table reserved for ${name} on ${date} at ${time}. We look forward to seeing you!`,
      reservation: formatReservation(reservation)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
const getMyReservations = async (req, res, next) => {
  try {
    const filter = req.user
      ? { $or: [{ user: req.user._id }, { email: req.user.email }] }
      : {};

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reservations: reservations.map(formatReservation)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    // Ownership check for non-admins
    if (req.user.role !== 'admin') {
      const ownedByUser  = reservation.user && reservation.user.toString() === req.user._id.toString();
      const ownedByEmail = reservation.email && reservation.email === req.user.email;
      if (!ownedByUser && !ownedByEmail) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    return res.status(200).json({ success: true, reservation: formatReservation(reservation) });
  } catch (error) {
    next(error);
  }
};

module.exports = { bookTable, getMyReservations, getReservationById };
