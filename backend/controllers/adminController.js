const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const isValidObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(String(id)) && String(id).length === 24;

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      total_customers,
      total_food_items,
      total_orders,
      pending_orders,
      total_reservations
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      FoodItem.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Reservation.countDocuments()
    ]);

    // Revenue: sum of totalAmount for all non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $in: ['Confirmed', 'Preparing', 'Ready', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const total_revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent orders
    const recent_orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent reservations
    const recent_reservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        total_customers,
        total_food_items,
        total_orders,
        total_revenue,
        pending_orders,
        total_reservations
      },
      recent_orders: recent_orders.map((o) => ({
        id: o._id,
        order_id: o.orderId,
        customer_name: o.customerDetails ? o.customerDetails.name : '',
        total_amount: o.totalAmount,
        status: o.orderStatus,
        created_at: o.createdAt
      })),
      recent_reservations: recent_reservations.map((r) => ({
        id: r._id,
        name: r.customerName,
        date: r.reservationDate,
        time: r.reservationTime,
        guests: r.guestLabel || r.numberOfGuests,
        status: r.bookingStatus
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { orderStatus: status } : {};

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      orders: orders.map((o) => ({
        id: o._id,
        order_id: o.orderId,
        customer_name: o.customerDetails ? o.customerDetails.name : '',
        customer_phone: o.customerDetails ? o.customerDetails.phone : '',
        customer_email: o.customerDetails ? o.customerDetails.email : '',
        delivery_address: o.customerDetails ? o.customerDetails.deliveryAddress : '',
        total_amount: o.totalAmount,
        status: o.orderStatus,
        payment_status: o.paymentStatus,
        payment_method: o.paymentMethod,
        notes: o.notes || '',
        created_at: o.createdAt,
        items: (o.items || []).map((i) => ({
          food_name: i.foodName,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.subtotal,
          image: i.image || ''
        }))
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
// NOTE: :id can be either MongoDB _id OR the orderId string (e.g. ORD-20261104-1234)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const param = req.params.id;

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    // Build $or query: match by MongoDB _id if valid, always match by orderId string
    const orConditions = [{ orderId: param }];
    if (isValidObjectId(param)) orConditions.push({ _id: param });

    const order = await Order.findOneAndUpdate(
      { $or: orConditions },
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      order: { id: order._id, order_id: order.orderId, status: order.orderStatus }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations (admin)
// @route   GET /api/admin/reservations
// @access  Admin
const getAllReservations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { bookingStatus: status } : {};

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      reservations: reservations.map((r) => ({
        id: r._id,                                 // MongoDB ObjectId — used for status updates
        name: r.customerName,
        email: r.email || '',
        phone: r.phone,
        reservation_date: r.reservationDate,
        reservation_time: r.reservationTime,
        guests: r.guestLabel || r.numberOfGuests,  // Show original label e.g. "5+ Guests"
        occasion: r.occasion || '',
        special_requests: r.specialRequests || '',
        status: r.bookingStatus,
        created_at: r.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (admin)
// @route   PUT /api/admin/reservations/:id/status
// @access  Admin
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const param = req.params.id;

    const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid reservation status.' });
    }

    if (!isValidObjectId(param)) {
      return res.status(400).json({ success: false, message: 'Invalid reservation ID.' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      param,
      { bookingStatus: status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Reservation status updated to ${status}.`,
      reservation: { id: reservation._id, name: reservation.customerName, status: reservation.bookingStatus }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers with order stats (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({})   // include both customers and admins
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Attach order count + total spent per user
    const result = await Promise.all(
      customers.map(async (c) => {
        const spentAgg = await Order.aggregate([
          { $match: { customer: c._id, orderStatus: { $nin: ['Cancelled'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);
        const agg = spentAgg[0] || { total: 0, count: 0 };
        return {
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          address: c.address || '',
          role: c.role,
          total_orders: agg.count,
          total_spent: agg.total.toFixed(2),
          order_count: agg.count,          // alias
          created_at: c.createdAt
        };
      })
    );

    return res.status(200).json({ success: true, users: result, customers: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllReservations,
  updateReservationStatus,
  getAllCustomers,
  getAllUsers: getAllCustomers  // alias for adminRoutes.js
};
