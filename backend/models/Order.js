const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: false
    },
    foodName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    customerDetails: {
      name:            { type: String, required: true },
      email:           { type: String, default: '' },
      phone:           { type: String, required: true },
      deliveryAddress: { type: String, default: '' }
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtuals for frontend compatibility (order_id, status, total_amount, delivery_address)
orderSchema.virtual('order_id').get(function () {
  return this.orderId;
});

orderSchema.virtual('status').get(function () {
  return this.orderStatus;
});

orderSchema.virtual('total_amount').get(function () {
  return this.totalAmount;
});

orderSchema.virtual('customer_name').get(function () {
  return this.customerDetails ? this.customerDetails.name : '';
});

orderSchema.virtual('customer_phone').get(function () {
  return this.customerDetails ? this.customerDetails.phone : '';
});

orderSchema.virtual('delivery_address').get(function () {
  return this.customerDetails ? this.customerDetails.deliveryAddress : '';
});

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    ret.order_id = ret.orderId;
    ret.status = ret.orderStatus;
    ret.total_amount = ret.totalAmount;
    if (ret.customerDetails) {
      ret.customer_name = ret.customerDetails.name;
      ret.customer_phone = ret.customerDetails.phone;
      ret.delivery_address = ret.customerDetails.deliveryAddress;
    }
    delete ret.__v;
    return ret;
  }
});

orderSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    ret.order_id = ret.orderId;
    ret.status = ret.orderStatus;
    ret.total_amount = ret.totalAmount;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Order', orderSchema);
