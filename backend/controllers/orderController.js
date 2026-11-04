const Order = require('../models/Order');
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const mongoose = require('mongoose');

// Generate unique order ID: ORD-YYYYMMDD-XXXX
const generateOrderId = () => {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ORD-${dateStr}-${rand}`;
};

// Format order for frontend
const formatOrder = (order) => {
  const o = order.toObject ? order.toObject() : order;
  return {
    id: o._id,
    order_id: o.orderId,
    total_amount: o.totalAmount,
    status: o.orderStatus,
    payment_status: o.paymentStatus,
    payment_method: o.paymentMethod,
    notes: o.notes || '',
    delivery_address: o.customerDetails ? o.customerDetails.deliveryAddress : '',
    customer_name: o.customerDetails ? o.customerDetails.name : '',
    customer_phone: o.customerDetails ? o.customerDetails.phone : '',
    created_at: o.createdAt,
    items: (o.items || []).map((item) => ({
      food_id: item.foodItem || null,
      food_name: item.foodName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      image: item.image || ''
    }))
  };
};

// Helper: check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(String(id)) && String(id).length === 24;

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public / Optional Auth (supports both guest and customer checkout)
const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : undefined;

    // ── Accept both field-name conventions ───────────────────────────────────
    // Frontend sends: customer_name, customer_phone, delivery_address, items[]
    // Direct API calls send: name, phone, delivery_address, items[]
    const name             = (req.body.customer_name  || req.body.name            || '').trim();
    const phone            = (req.body.customer_phone || req.body.phone           || '').trim();
    const email            = req.body.email  || (req.user ? req.user.email : '');
    const delivery_address = (req.body.delivery_address || req.body.address        || '').trim();
    const payment_method   = req.body.payment_method  || 'Cash on Delivery';
    const notes            = req.body.notes || '';
    const bodyItems        = req.body.items;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!name) {
      return res.status(400).json({ success: false, message: 'Delivery contact name is required.' });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Contact phone number is required.' });
    }

    let orderItems = [];

    // ── Build order items ────────────────────────────────────────────────────
    if (bodyItems && bodyItems.length > 0) {
      // Items supplied in request body (from checkout modal cartItemsList)
      for (const bodyItem of bodyItems) {
        const rawId = bodyItem.food_id || bodyItem.id;

        if (isValidObjectId(rawId)) {
          // Real MongoDB ObjectId → fetch authoritative price from DB
          const food = await FoodItem.findById(rawId);
          if (!food) continue; // skip if item no longer exists
          const qty = Math.max(1, parseInt(bodyItem.quantity) || 1);
          orderItems.push({
            foodItem: food._id,
            foodName: food.name,
            price: food.price,
            quantity: qty,
            subtotal: food.price * qty,
            image: food.image || ''
          });
        } else {
          // Fallback / guest item — integer id or non-ObjectId string.
          // Trust the price/name from the frontend (already displayed to user).
          const itemName  = (bodyItem.name  || 'Unknown Item').trim();
          const itemPrice = parseFloat(bodyItem.price) || 0;
          const qty       = Math.max(1, parseInt(bodyItem.quantity) || 1);

          if (!itemName || itemPrice <= 0) continue; // skip bogus entries

          orderItems.push({
            foodItem: undefined,       // no DB ref for fallback items
            foodName: itemName,
            price: itemPrice,
            quantity: qty,
            subtotal: itemPrice * qty,
            image: bodyItem.image || ''
          });
        }
      }
    } else {
      // No items in body → pull from the user's saved DB cart
      const cartItems = userId ? await Cart.find({ user: userId }).populate('foodItem') : [];
      for (const c of cartItems) {
        const food = c.foodItem;
        if (!food) continue;
        orderItems.push({
          foodItem: food._id,
          foodName: food.name,
          price: food.price,
          quantity: c.quantity,
          subtotal: food.price * c.quantity,
          image: food.image || ''
        });
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid items found. Please add items to your cart.' });
    }

    const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

    // ── Create order in MongoDB ──────────────────────────────────────────────
    const order = await Order.create({
      orderId: generateOrderId(),
      customer: userId,
      items: orderItems,
      totalAmount,
      customerDetails: {
        name,
        email,
        phone,
        deliveryAddress: delivery_address
      },
      paymentMethod: payment_method,
      notes
    });

    // Clear DB cart after successful order if logged in
    if (userId) {
      await Cart.deleteMany({ user: userId });
    }

    return res.status(201).json({
      success: true,
      message: `Order placed successfully! Your Order ID is ${order.orderId}.`,
      order: formatOrder(order)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders: orders.map(formatOrder)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by MongoDB _id or orderId string
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const param = req.params.id;

    const orConditions = [{ orderId: param }];
    if (isValidObjectId(param)) orConditions.push({ _id: param });

    const filter = { $or: orConditions };

    // Admin can view any order; customer only their own
    if (req.user.role !== 'admin') {
      filter.customer = req.user._id;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({ success: true, order: formatOrder(order) });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending order (customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const param = req.params.id;
    const orConditions = [{ orderId: param }];
    if (isValidObjectId(param)) orConditions.push({ _id: param });

    const order = await Order.findOne({
      $or: orConditions,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}.`
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Your order has been cancelled.',
      order: formatOrder(order)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder };
