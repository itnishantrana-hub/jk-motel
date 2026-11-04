/**
 * JK MOTEL – Database Seed Script
 * Run: node backend/scripts/seed.js   OR   npm run seed (from backend/)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { name: 'Veg',       slug: 'veg',       description: 'Fresh vegetarian delights',         image: 'images/categories/veg.jpg' },
  { name: 'Non-Veg',   slug: 'non-veg',   description: 'Tender meat and seafood specialties', image: 'images/categories/non-veg.jpg' },
  { name: 'Fast Food', slug: 'fast-food', description: 'Quick bites and street-food favourites', image: 'images/categories/fast-food.jpg' },
  { name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks and juices',       image: 'images/categories/beverages.jpg' },
  { name: 'Desserts',  slug: 'desserts',  description: 'Sweet endings to a perfect meal',   image: 'images/categories/desserts.jpg' }
];

// ─── Food Items ───────────────────────────────────────────────────────────────
// (prices in Indian Rupees ₹)
const foodItemsData = [
  // Veg
  { name: 'Paneer Butter Masala',   description: 'Rich and creamy paneer in a smooth tomato-butter gravy',   price: 220, classification: 'Veg',     slug: 'veg',       image: 'images/food/paneer-butter-masala.jpg' },
  { name: 'Dal Tadka',              description: 'Yellow lentils tempered with cumin, garlic and spices',    price: 160, classification: 'Veg',     slug: 'veg',       image: 'images/food/dal-tadka.jpg' },
  { name: 'Veg Biryani',            description: 'Fragrant basmati rice cooked with fresh seasonal vegetables', price: 199, classification: 'Veg',  slug: 'veg',       image: 'images/food/veg-biryani.jpg' },
  { name: 'Aloo Gobi',              description: 'Classic dry preparation of potato and cauliflower',        price: 149, classification: 'Veg',     slug: 'veg',       image: 'images/food/aloo-gobi.jpg' },

  // Non-Veg
  { name: 'Chicken Biryani',        description: 'Aromatic basmati rice layered with spiced chicken',        price: 299, classification: 'Non-Veg', slug: 'non-veg',   image: 'images/food/chicken-biryani.jpg' },
  { name: 'Butter Chicken',         description: 'Tender chicken in a velvety tomato-cream sauce',           price: 279, classification: 'Non-Veg', slug: 'non-veg',   image: 'images/food/butter-chicken.jpg' },
  { name: 'Mutton Rogan Josh',      description: 'Slow-cooked mutton in a bold Kashmiri spice blend',        price: 349, classification: 'Non-Veg', slug: 'non-veg',   image: 'images/food/mutton-rogan-josh.jpg' },

  // Fast Food
  { name: 'Veg Burger',             description: 'Crispy veggie patty with fresh lettuce, tomato and cheese', price: 129, classification: 'Veg',   slug: 'fast-food', image: 'images/food/veg-burger.jpg' },
  { name: 'Chicken Burger',         description: 'Juicy grilled chicken fillet with special house sauce',    price: 159, classification: 'Non-Veg', slug: 'fast-food', image: 'images/food/chicken-burger.jpg' },
  { name: 'French Fries',           description: 'Golden crispy fries seasoned with herbs and spices',       price: 99,  classification: 'Veg',     slug: 'fast-food', image: 'images/food/french-fries.jpg' },

  // Beverages
  { name: 'Mango Lassi',            description: 'Chilled yoghurt blended with fresh Alphonso mango',        price: 89,  classification: 'Veg',     slug: 'beverages', image: 'images/food/mango-lassi.jpg' },
  { name: 'Fresh Lime Soda',        description: 'Zesty lime juice with sparkling soda and mint',            price: 69,  classification: 'Veg',     slug: 'beverages', image: 'images/food/lime-soda.jpg' },
  { name: 'Masala Chai',            description: 'Spiced Indian tea brewed with ginger and cardamom',        price: 49,  classification: 'Veg',     slug: 'beverages', image: 'images/food/masala-chai.jpg' },

  // Desserts
  { name: 'Gulab Jamun',            description: 'Soft milk-solid dumplings soaked in rose-flavoured syrup', price: 99,  classification: 'Veg',     slug: 'desserts',  image: 'images/food/gulab-jamun.jpg' },
  { name: 'Chocolate Brownie',      description: 'Warm fudgy brownie served with a scoop of vanilla ice cream', price: 149, classification: 'Veg', slug: 'desserts',  image: 'images/food/chocolate-brownie.jpg' }
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  await connectDB();
  console.log('\n🌱  Starting JK MOTEL seed...\n');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await FoodItem.deleteMany({});
    console.log('✅  Cleared existing users, categories, and food items.');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅  Inserted ${insertedCategories.length} categories.`);

    // Build slug → ObjectId map
    const catMap = {};
    insertedCategories.forEach((c) => { catMap[c.slug] = c._id; });

    // Insert food items
    const foodDocs = foodItemsData.map(({ slug, ...item }) => ({
      ...item,
      category: catMap[slug],
      isAvailable: true
    }));
    const insertedFood = await FoodItem.insertMany(foodDocs);
    console.log(`✅  Inserted ${insertedFood.length} food items.`);

    // Create admin user
    const admin = await User.create({
      name: 'JK Motel Admin',
      email: 'admin@jkmotel.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9876543210',
      address: 'JK Motel, Main Road, City'
    });
    console.log(`✅  Admin created  → ${admin.email}  (password: Admin@123)`);

    // Create customer user
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@jkmotel.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '9123456780',
      address: '123 Sample Street, City'
    });
    console.log(`✅  Customer created → ${customer.email}  (password: Customer@123)`);

    console.log('\n🎉  Seed completed successfully!\n');
    console.log('────────────────────────────────────────────────');
    console.log('  Admin:    admin@jkmotel.com   / Admin@123');
    console.log('  Customer: customer@jkmotel.com / Customer@123');
    console.log('────────────────────────────────────────────────\n');
  } catch (err) {
    console.error('❌  Seed failed:', err.message || err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌  MongoDB connection closed.\n');
  }
};

seed();
