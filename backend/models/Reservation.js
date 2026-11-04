const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    // email is optional — the reservation form does not collect it
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true
    },
    reservationDate: {
      type: String,
      required: [true, 'Please select a reservation date']
    },
    reservationTime: {
      type: String,
      required: [true, 'Please select a reservation time']
    },
    // Stored as a number (1, 2, 3, 4, 5 …)
    numberOfGuests: {
      type: Number,
      required: [true, 'Please select the number of guests'],
      min: [1, 'At least 1 guest is required']
    },
    // Original display string from the dropdown, e.g. "5+ Guests"
    guestLabel: {
      type: String,
      default: ''
    },
    occasion: {
      type: String,
      default: 'Regular dining'
    },
    specialRequests: {
      type: String,
      trim: true,
      default: ''
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// ── Virtuals for frontend compatibility ──────────────────────────────────────
reservationSchema.virtual('name').get(function () {
  return this.customerName;
});
reservationSchema.virtual('reservation_date').get(function () {
  return this.reservationDate;
});
reservationSchema.virtual('reservation_time').get(function () {
  return this.reservationTime;
});
// Return the display label if stored, otherwise the numeric count
reservationSchema.virtual('guests').get(function () {
  return this.guestLabel || this.numberOfGuests;
});
reservationSchema.virtual('special_requests').get(function () {
  return this.specialRequests;
});
reservationSchema.virtual('status').get(function () {
  return this.bookingStatus;
});

reservationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id               = ret._id ? ret._id.toString() : ret.id;
    ret.name             = ret.customerName;
    ret.reservation_date = ret.reservationDate;
    ret.reservation_time = ret.reservationTime;
    ret.guests           = ret.guestLabel || ret.numberOfGuests;
    ret.special_requests = ret.specialRequests;
    ret.status           = ret.bookingStatus;
    delete ret.__v;
    return ret;
  }
});

reservationSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id               = ret._id ? ret._id.toString() : ret.id;
    ret.name             = ret.customerName;
    ret.reservation_date = ret.reservationDate;
    ret.reservation_time = ret.reservationTime;
    ret.guests           = ret.guestLabel || ret.numberOfGuests;
    ret.special_requests = ret.specialRequests;
    ret.status           = ret.bookingStatus;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
