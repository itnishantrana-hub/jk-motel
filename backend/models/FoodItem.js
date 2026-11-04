const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food item name'],
      trim: true,
      maxlength: [150, 'Food name cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Please provide price in INR'],
      min: [0, 'Price must be positive']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please associate food item with a category']
    },
    image: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    classification: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Fast Food', 'Beverages', 'Desserts', 'Other'],
      default: 'Veg'
    }
  },
  {
    timestamps: true
  }
);

// Virtuals to maintain seamless compatibility with frontend expectation of is_available & category_id
foodItemSchema.virtual('is_available').get(function () {
  return this.isAvailable;
});

foodItemSchema.virtual('is_available').set(function (val) {
  this.isAvailable = Boolean(val);
});

foodItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    ret.is_available = ret.isAvailable;
    delete ret.__v;
    return ret;
  }
});

foodItemSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    ret.is_available = ret.isAvailable;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
