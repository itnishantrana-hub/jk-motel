# JK MOTEL – Restaurant & Dining 🍽️

A full-stack restaurant management and online food ordering system built with **HTML/CSS/JavaScript** (frontend) and **Node.js + Express.js + MongoDB Atlas** (backend).

---

## 🗂️ Project Structure

```
JK Motel/
├── index.html              ← Main frontend page
├── CSS/                    ← Stylesheets
├── JS/
│   ├── api.js              ← Frontend API client (Fetch-based)
│   └── app.js              ← Main frontend logic
├── images/                 ← Food & UI images
│
└── backend/
    ├── config/
    │   └── db.js           ← MongoDB connection (Mongoose)
    ├── controllers/        ← Business logic (all Mongoose-based)
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── models/             ← Mongoose schemas
    │   ├── User.js
    │   ├── Category.js
    │   ├── FoodItem.js
    │   ├── Cart.js
    │   ├── Order.js
    │   └── Reservation.js
    ├── routes/             ← Express routers
    ├── scripts/
    │   └── seed.js         ← Database seeder
    ├── .env                ← Environment variables (do NOT commit)
    ├── .env.example        ← Template for .env
    ├── .gitignore
    ├── server.js
    └── package.json
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier is fine)

---

## 🚀 Setup Instructions

### 1. Clone / Open the project
```
c:\JK Motel\
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure MongoDB Atlas

1. Sign up / log in at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free **M0** cluster
3. In **Database Access** → Add a database user (username + password)
4. In **Network Access** → Add `0.0.0.0/0` to allow all IPs (for development)
5. Click **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 4. Create the `.env` file
Inside `backend/`, open `.env` and replace the `MONGODB_URI` line:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jk_motel?retryWrites=true&w=majority
JWT_SECRET=jk_motel_jwt_secret_key_restaurant_2026_9876543210
JWT_EXPIRES_IN=7d
```

> Replace `<username>` and `<password>` with the Atlas database user credentials.

### 5. Seed the database
```bash
cd backend
npm run seed
```

This creates:
- 5 categories (Veg, Non-Veg, Fast Food, Beverages, Desserts)
- 15 food items with prices in ₹
- Admin account: `admin@jkmotel.com` / `Admin@123`
- Customer account: `customer@jkmotel.com` / `Customer@123`

### 6. Start the server
```bash
cd backend
npm start
```

Open your browser at **http://localhost:5000**

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile / change password |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all active categories |
| POST | `/api/categories` | Create category (Admin) |
| PUT | `/api/categories/:id` | Update category (Admin) |
| DELETE | `/api/categories/:id` | Delete category (Admin) |

### Food Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | Get all food items (supports `?category=veg&search=chicken&available=true`) |
| GET | `/api/food/:id` | Get single food item |
| POST | `/api/food` | Create food item (Admin) |
| PUT | `/api/food/:id` | Update food item (Admin) |
| DELETE | `/api/food/:id` | Delete food item (Admin) |

### Shopping Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:id` | Update item quantity |
| DELETE | `/api/cart/:id` | Remove item |
| DELETE | `/api/cart` | Clear entire cart |
| POST | `/api/cart/sync` | Sync guest cart after login |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders/my-orders` | Get current user's orders |
| GET | `/api/orders/:id` | Get single order |
| PUT | `/api/orders/:id/cancel` | Cancel pending order |

### Reservations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reservations` | Book a table |
| GET | `/api/reservations/my-reservations` | Get user's reservations |
| GET | `/api/reservations/:id` | Get reservation details |

### Admin Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/orders` | All orders (supports `?status=Pending`) |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/reservations` | All reservations |
| PUT | `/api/admin/reservations/:id/status` | Update reservation status |
| GET | `/api/admin/users` | All customers |

### Health Check
```
GET /api/health
```

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- Authentication via **JWT** (Bearer tokens)
- Admin routes protected by role-based middleware
- SQL injection not possible (MongoDB/Mongoose)
- Database credentials stored in `.env` (never in source code)

---

## 🧪 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@jkmotel.com` | `Admin@123` |
| Customer | `customer@jkmotel.com` | `Customer@123` |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Environment | dotenv |
| Cross-Origin | cors |
