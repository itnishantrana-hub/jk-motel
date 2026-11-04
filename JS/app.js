/**
 * JK MOTEL – Frontend Application Controller
 * Handles Menu, Cart, Authentication, Orders, Reservations & Admin Dashboard
 */

// Fallback menu items (ensures menu is displayed even before database is populated)
const fallbackMenuItems = [
  {
    id: 1,
    name: "Classic Breakfast",
    category_slug: "fast-food",
    category_name: "Fast Food",
    price: 199.00,
    description: "Eggs, sausages, toast, beans, and fresh tomatoes.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 2,
    name: "Chicken Burger",
    category_slug: "non-veg",
    category_name: "Non-Veg",
    price: 249.00,
    description: "Crispy chicken, lettuce, tomato, cheese, and special sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 3,
    name: "Margherita Pizza",
    category_slug: "fast-food",
    category_name: "Fast Food",
    price: 299.00,
    description: "Tomato sauce, mozzarella, basil, and Italian herbs.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 4,
    name: "Grilled Steak",
    category_slug: "non-veg",
    category_name: "Non-Veg",
    price: 499.00,
    description: "Tender grilled steak served with fries and vegetables.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 5,
    name: "Pasta Alfredo",
    category_slug: "fast-food",
    category_name: "Fast Food",
    price: 349.00,
    description: "Creamy pasta with parmesan, herbs, and grilled chicken.",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 6,
    name: "Chocolate Cake",
    category_slug: "desserts",
    category_name: "Desserts",
    price: 149.00,
    description: "Soft chocolate cake with cream and chocolate sauce.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 7,
    name: "Fresh Fruit Juice",
    category_slug: "beverages",
    category_name: "Beverages",
    price: 99.00,
    description: "Freshly prepared seasonal fruit juice.",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 8,
    name: "Iced Coffee",
    category_slug: "beverages",
    category_name: "Beverages",
    price: 129.00,
    description: "Cold brewed coffee served with ice and milk.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 9,
    name: "Pancake Stack",
    category_slug: "desserts",
    category_name: "Desserts",
    price: 179.00,
    description: "Fluffy pancakes with berries, butter, and maple syrup.",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 10,
    name: "Paneer Butter Masala",
    category_slug: "veg",
    category_name: "Veg",
    price: 259.00,
    description: "Cottage cheese cubes simmered in a rich tomato, butter and cashew sauce.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 11,
    name: "Butter Chicken",
    category_slug: "non-veg",
    category_name: "Non-Veg",
    price: 329.00,
    description: "Succulent chicken chunks in a mildly spiced velvety cream and butter gravy.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    is_available: true
  },
  {
    id: 12,
    name: "Dal Makhani",
    category_slug: "veg",
    category_name: "Veg",
    price: 199.00,
    description: "Slow-cooked black lentils prepared with butter, cream, and ginger.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    is_available: true
  }
];

let loadedMenuItems = [...fallbackMenuItems];
let selectedCategory = "all";
let cartItemsList = []; // unified cart state

// ==========================================================
// 1. MENU MANAGEMENT (MongoDB Atlas API + Fallback)
// ==========================================================

async function fetchMenu(category = selectedCategory, search = '') {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
      <p>Loading fresh dishes from JK Motel kitchen...</p>
    </div>
  `;

  try {
    const res = await API.food.getAll({ category, search, available: true });
    const foodItems = res && (res.food_items || res.data);
    if (foodItems && foodItems.length > 0) {
      loadedMenuItems = foodItems;
      renderMenu(loadedMenuItems);
    } else if (foodItems && foodItems.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
          <p>No delicious dishes found matching your selection.</p>
        </div>
      `;
    } else {
      // Fallback
      useFallbackMenu(category, search);
    }
  } catch (err) {
    console.warn("Could not reach backend menu API, using cached menu items:", err.message);
    useFallbackMenu(category, search);
  }
}

function useFallbackMenu(category, search) {
  const q = (search || '').toLowerCase().trim();
  const filtered = fallbackMenuItems.filter(item => {
    const catMatch =
      category === "all" ||
      item.category_slug === category ||
      item.category_name.toLowerCase().includes(category.toLowerCase());
    const searchMatch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });
  loadedMenuItems = fallbackMenuItems;
  renderMenu(filtered);
}

function renderMenu(items = loadedMenuItems) {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
        <p>No menu items found.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="menu-content">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <h3 style="margin:0;">${item.name}</h3>
          <span style="font-size:11px; background:rgba(184,92,56,0.1); color:var(--primary); padding:2px 8px; border-radius:12px; font-weight:bold;">
            ${item.category_name || item.category_slug || ''}
          </span>
        </div>
        <p>${item.description || ''}</p>
        <div class="menu-bottom">
          <span class="price">₹${parseFloat(item.price).toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart('${item.id}')">
            Add to Order
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterMenu(category, button) {
  selectedCategory = category;

  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) button.classList.add("active");

  const searchBox = document.getElementById("searchBox");
  const search = searchBox ? searchBox.value : '';
  fetchMenu(category, search);
}

let searchDebounceTimer = null;
function searchMenu() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    const searchBox = document.getElementById("searchBox");
    const search = searchBox ? searchBox.value : '';
    fetchMenu(selectedCategory, search);
  }, 250);
}

// ==========================================================
// 2. SHOPPING CART (DB Persisted for logged-in users + Guest LocalStorage)
// ==========================================================

const GUEST_CART_KEY = "jk_motel_guest_cart";

function getGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

async function loadCart() {
  const user = Storage.getUser();
  if (user && Storage.getToken()) {
    try {
      const res = await API.cart.get();
      // Backend returns { success, cart: { items, total_items, total_amount } }
      const cartData = res && (res.cart || res.data);
      if (cartData && cartData.items) {
        cartItemsList = cartData.items.map(it => ({
          cart_id: it.cart_id,   // MongoDB cart document _id — needed for update/remove
          id: it.food_id,        // FoodItem _id — used for display matching
          name: it.name,
          price: parseFloat(it.price),
          quantity: it.quantity,
          image: it.image
        }));
        renderCartUI(cartData.total_items, cartData.total_amount);
        return;
      }
    } catch (e) {
      console.warn("Could not fetch remote cart, falling back to local:", e.message);
    }
  }

  // Guest cart fallback
  const guestCart = getGuestCart();
  cartItemsList = guestCart;
  const totalItems = cartItemsList.reduce((s, it) => s + it.quantity, 0);
  const totalAmount = cartItemsList.reduce((s, it) => s + it.price * it.quantity, 0);
  renderCartUI(totalItems, totalAmount);
}

async function addToCart(foodId) {
  const item = loadedMenuItems.find(p => p.id === foodId) || fallbackMenuItems.find(p => p.id === foodId);
  if (!item) return;

  const user = Storage.getUser();

  if (user && Storage.getToken()) {
    try {
      // For DB items, food_id must be a valid MongoDB ObjectId
      const dbItem = loadedMenuItems.find(p => p.id === foodId);
      const foodDbId = dbItem ? dbItem.id : foodId;
      await API.cart.add(foodDbId, 1);
      showToast(`Added "${item.name}" to your order.`, 'success');
      await loadCart();
      openCart();
      return;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Guest flow
  const existing = cartItemsList.find(p => p.id === foodId);
  if (existing) {
    existing.quantity++;
  } else {
    cartItemsList.push({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: 1,
      image: item.image
    });
  }
  saveGuestCart(cartItemsList);

  const totalItems = cartItemsList.reduce((s, it) => s + it.quantity, 0);
  const totalAmount = cartItemsList.reduce((s, it) => s + it.price * it.quantity, 0);
  renderCartUI(totalItems, totalAmount);

  showToast(`Added "${item.name}" to order.`, 'success');
  openCart();
}

async function changeQuantity(foodId, change) {
  const item = cartItemsList.find(p => p.id === foodId);
  if (!item) return;

  const newQty = item.quantity + change;
  const user = Storage.getUser();

  if (user && Storage.getToken()) {
    try {
      // Use cart_id (MongoDB cart document _id) for DB operations
      const cartItemId = item.cart_id || item.id;
      await API.cart.update(cartItemId, newQty);
      await loadCart();
      return;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Guest flow
  if (newQty <= 0) {
    cartItemsList = cartItemsList.filter(p => p.id !== foodId);
  } else {
    item.quantity = newQty;
  }
  saveGuestCart(cartItemsList);

  const totalItems = cartItemsList.reduce((s, it) => s + it.quantity, 0);
  const totalAmount = cartItemsList.reduce((s, it) => s + it.price * it.quantity, 0);
  renderCartUI(totalItems, totalAmount);
}

function renderCartUI(totalItems, totalAmount) {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = parseFloat(totalAmount).toFixed(2);

  if (!cartItems) return;

  if (!cartItemsList.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p style="font-size: 28px; margin-bottom: 8px;">🍽️</p>
        <p><b>Your cart is empty.</b></p>
        <p>Explore our menu and add something delicious!</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cartItemsList.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong><br>
        <small>₹${parseFloat(item.price).toFixed(2)} each</small>
      </div>

      <div class="quantity">
        <button onclick="changeQuantity('${item.id}', -1)">−</button>
        <strong>${item.quantity}</strong>
        <button onclick="changeQuantity('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join("");
}

function openCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// ==========================================================
// 3. CHECKOUT & ORDERS
// ==========================================================

function checkout() {
  if (!cartItemsList.length) {
    showToast("Your cart is empty. Please add items before placing an order.", "error");
    return;
  }

  // Open Checkout Confirmation Modal (supports both logged-in and guest checkout)
  openCheckoutModal();
}

function openCheckoutModal() {
  closeCart();
  const user = Storage.getUser() || {};
  const modal = document.getElementById("checkoutModal");
  if (!modal) return;

  document.getElementById("checkoutName").value = user.name || "";
  document.getElementById("checkoutPhone").value = user.phone || "";
  document.getElementById("checkoutAddress").value = user.address || "";

  // Render items summary
  const summaryBox = document.getElementById("checkoutSummary");
  const totalAmount = cartItemsList.reduce((s, it) => s + it.price * it.quantity, 0);

  summaryBox.innerHTML = `
    <div style="background:#fdfaf6; border:1px solid #ebd8c8; border-radius:8px; padding:12px; margin-bottom:15px;">
      <h4 style="margin-bottom:8px; color:var(--primary);">Order Items (${cartItemsList.length})</h4>
      ${cartItemsList.map(it => `
        <div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0;">
          <span>${it.name} × ${it.quantity}</span>
          <span><b>₹${(it.price * it.quantity).toFixed(2)}</b></span>
        </div>
      `).join("")}
      <hr style="margin:8px 0; border:0; border-top:1px dashed #ddd;">
      <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:15px;">
        <span>Total Payable:</span>
        <span style="color:var(--primary);">₹${totalAmount.toFixed(2)}</span>
      </div>
    </div>
  `;

  modal.classList.add("open");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("open");
}

async function handleConfirmOrder(event) {
  event.preventDefault();

  const name = document.getElementById("checkoutName").value.trim();
  const phone = document.getElementById("checkoutPhone").value.trim();
  const address = document.getElementById("checkoutAddress").value.trim();
  const notes = document.getElementById("checkoutNotes").value.trim();

  const submitBtn = event.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Placing Order...";

  try {
    const res = await API.orders.place({
      customer_name: name,
      customer_phone: phone,
      delivery_address: address,
      notes: notes,
      items: cartItemsList
    });

    closeCheckoutModal();
    cartItemsList = [];
    localStorage.removeItem(GUEST_CART_KEY);
    renderCartUI(0, 0);

    // Show order success modal
    openOrderSuccessModal(res.order);
    showToast("Order placed successfully!", "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm & Place Order";
  }
}

function openOrderSuccessModal(order) {
  const modal = document.getElementById("orderSuccessModal");
  if (!modal) return;

  document.getElementById("successOrderId").textContent = order.order_id;
  document.getElementById("successOrderTotal").textContent = `₹${parseFloat(order.total_amount).toFixed(2)}`;
  document.getElementById("successOrderAddress").textContent = order.delivery_address;
  document.getElementById("successOrderStatus").textContent = order.status;

  modal.classList.add("open");
}

function closeOrderSuccessModal() {
  const modal = document.getElementById("orderSuccessModal");
  if (modal) modal.classList.remove("open");
}

// ==========================================================
// 4. AUTHENTICATION & USER PROFILE
// ==========================================================

function openAuthModal(tab = 'login') {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  switchAuthTab(tab);
  modal.classList.add("open");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("open");
}

function switchAuthTab(tab) {
  document.getElementById("tabLoginBtn").classList.toggle("active", tab === 'login');
  document.getElementById("tabRegisterBtn").classList.toggle("active", tab === 'register');
  document.getElementById("loginForm").style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById("registerForm").style.display = tab === 'register' ? 'block' : 'none';
}

function fillCredentials(email, password) {
  document.getElementById("loginEmail").value = email;
  document.getElementById("loginPassword").value = password;
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const submitBtn = event.target.querySelector("button[type='submit']");

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  try {
    const res = await API.auth.login({ email, password });
    showToast(`Welcome back, ${res.user.name}!`, "success");
    closeAuthModal();
    updateAuthNav();

    // Sync any guest cart items into user's DB cart
    const guestCart = getGuestCart();
    if (guestCart.length > 0) {
      await API.cart.sync(guestCart);
      localStorage.removeItem(GUEST_CART_KEY);
    }

    await loadCart();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const address = document.getElementById("regAddress").value.trim();
  const password = document.getElementById("regPassword").value;
  const submitBtn = event.target.querySelector("button[type='submit']");

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";

  try {
    const res = await API.auth.register({ name, email, phone, address, password });
    showToast(`Welcome to JK Motel, ${res.user.name}!`, "success");
    closeAuthModal();
    updateAuthNav();

    const guestCart = getGuestCart();
    if (guestCart.length > 0) {
      await API.cart.sync(guestCart);
      localStorage.removeItem(GUEST_CART_KEY);
    }

    await loadCart();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
}

function handleLogout() {
  API.auth.logout();
  cartItemsList = [];
  updateAuthNav();
  loadCart();
  closeAccountModal();
  closeAdminDashboard();
  showToast("Logged out successfully.", "info");
}

function updateAuthNav() {
  const container = document.getElementById("authNavArea");
  if (!container) return;

  const user = Storage.getUser();

  if (!user) {
    container.innerHTML = `
      <button class="auth-nav-btn" onclick="openAuthModal('login')">
        👤 Sign In
      </button>
    `;
    return;
  }

  const roleTag = user.role === 'admin'
    ? `<span class="role-tag">ADMIN</span>`
    : `<span class="role-tag" style="background:#555;">MEMBER</span>`;

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="user-badge-btn" onclick="openAccountModal()">
        👤 ${user.name.split(' ')[0]} ${roleTag}
      </button>
      ${user.role === 'admin' ? `
        <button class="auth-nav-btn" style="background:var(--primary); border-color:var(--primary);" onclick="openAdminDashboard()">
          🛡️ Dashboard
        </button>
      ` : ''}
      <button class="auth-nav-btn" title="Sign Out" onclick="handleLogout()" style="padding:7px 10px;">
        ✕
      </button>
    </div>
  `;
}

// ==========================================================
// 5. USER ACCOUNT & ORDER HISTORY MODAL
// ==========================================================

function openAccountModal(tab = 'orders') {
  const user = Storage.getUser();
  if (!user) {
    showToast("Please sign in to view your account details and order history.", "info");
    openAuthModal('login');
    return;
  }
  const modal = document.getElementById("accountModal");
  if (!modal) return;
  switchAccountTab(tab);
  modal.classList.add("open");
}

function closeAccountModal() {
  const modal = document.getElementById("accountModal");
  if (modal) modal.classList.remove("open");
}

function switchAccountTab(tab) {
  document.getElementById("accTabOrders").classList.toggle("active", tab === 'orders');
  document.getElementById("accTabReservations").classList.toggle("active", tab === 'reservations');
  document.getElementById("accTabProfile").classList.toggle("active", tab === 'profile');

  document.getElementById("accOrdersContent").style.display = tab === 'orders' ? 'block' : 'none';
  document.getElementById("accReservationsContent").style.display = tab === 'reservations' ? 'block' : 'none';
  document.getElementById("accProfileContent").style.display = tab === 'profile' ? 'block' : 'none';

  if (tab === 'orders') loadMyOrders();
  if (tab === 'reservations') loadMyReservations();
  if (tab === 'profile') loadMyProfileForm();
}

async function loadMyOrders() {
  const container = document.getElementById("myOrdersList");
  container.innerHTML = "<p style='color:var(--muted);'>Loading your orders...</p>";

  try {
    const res = await API.orders.getMyOrders();
    if (!res.orders || res.orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--muted);">
          <p style="font-size:30px;">📦</p>
          <p>You have not placed any orders yet.</p>
          <a href="#menu" class="btn btn-sm" onclick="closeAccountModal()" style="margin-top:10px;">Order Food Now</a>
        </div>
      `;
      return;
    }

    container.innerHTML = res.orders.map(order => `
      <div style="background:#fff9f3; border:1px solid #eadfd4; border-radius:8px; padding:15px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <strong style="color:var(--dark); font-size:15px;">Order #${order.order_id}</strong>
            <small style="display:block; color:var(--muted);">${new Date(order.created_at).toLocaleString()}</small>
          </div>
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        <div style="font-size:13px; color:var(--dark); margin:8px 0;">
          ${(order.items || []).map(it => `
            <div>• ${it.food_name} × ${it.quantity} (₹${(it.price * it.quantity).toFixed(2)})</div>
          `).join("")}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #ddd; padding-top:8px; margin-top:8px;">
          <span>Total: <b style="color:var(--primary); font-size:16px;">₹${parseFloat(order.total_amount).toFixed(2)}</b></span>
          ${order.status === 'Pending' ? `
            <button class="btn btn-sm btn-danger" onclick="cancelUserOrder('${order.order_id}')">Cancel Order</button>
          ` : ''}
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Failed to load orders: ${err.message}</p>`;
  }
}

async function cancelUserOrder(orderId) {
  if (!confirm(`Are you sure you want to cancel order #${orderId}?`)) return;
  try {
    await API.orders.cancel(orderId);
    showToast("Order cancelled successfully.", "success");
    loadMyOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadMyReservations() {
  const container = document.getElementById("myReservationsList");
  container.innerHTML = "<p style='color:var(--muted);'>Loading your reservations...</p>";

  try {
    const res = await API.reservations.getMyReservations();
    if (!res.reservations || res.reservations.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--muted);">
          <p style="font-size:30px;">🍷</p>
          <p>No table reservations found.</p>
          <a href="#reservation" class="btn btn-sm" onclick="closeAccountModal()" style="margin-top:10px;">Book a Table</a>
        </div>
      `;
      return;
    }

    container.innerHTML = res.reservations.map(r => `
      <div style="background:#fff9f3; border:1px solid #eadfd4; border-radius:8px; padding:15px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong>Date: ${r.reservation_date} at ${r.reservation_time}</strong>
          <span class="status-badge status-${r.status}">${r.status}</span>
        </div>
        <div style="font-size:13px; color:var(--dark);">
          <div>Guests: <b>${r.guests}</b> | Occasion: <b>${r.occasion || 'Regular'}</b></div>
          ${r.special_requests ? `<div style="color:var(--muted); margin-top:4px;">Request: “${r.special_requests}”</div>` : ''}
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Failed to load reservations: ${err.message}</p>`;
  }
}

function loadMyProfileForm() {
  const user = Storage.getUser() || {};
  document.getElementById("profName").value = user.name || "";
  document.getElementById("profEmail").value = user.email || "";
  document.getElementById("profPhone").value = user.phone || "";
  document.getElementById("profAddress").value = user.address || "";
}

async function handleUpdateProfile(event) {
  event.preventDefault();
  const name = document.getElementById("profName").value.trim();
  const phone = document.getElementById("profPhone").value.trim();
  const address = document.getElementById("profAddress").value.trim();
  const currentPassword = document.getElementById("profCurrentPass").value;
  const newPassword = document.getElementById("profNewPass").value;

  try {
    await API.auth.updateProfile({
      name,
      phone,
      address,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });
    showToast("Profile updated successfully!", "success");
    updateAuthNav();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================================
// 6. TABLE RESERVATIONS (MongoDB Atlas Integration)
// ==========================================================

async function makeReservation(event) {
  event.preventDefault();

  const name = document.getElementById("resName") ? document.getElementById("resName").value.trim() : "";
  const phone = document.getElementById("resPhone") ? document.getElementById("resPhone").value.trim() : "";
  const date = document.getElementById("resDate") ? document.getElementById("resDate").value : "";
  const time = document.getElementById("resTime") ? document.getElementById("resTime").value : "";
  const guests = document.getElementById("resGuests") ? document.getElementById("resGuests").value : "";
  const occasion = document.getElementById("resOccasion") ? document.getElementById("resOccasion").value : "Regular dining";
  const specialRequests = document.getElementById("resSpecial") ? document.getElementById("resSpecial").value.trim() : "";

  const submitBtn = event.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Confirming Reservation...";
  }

  try {
    const res = await API.reservations.book({
      name,
      phone,
      reservation_date: date,
      reservation_time: time,
      guests,
      occasion,
      special_requests: specialRequests
    });

    showToast(res.message || "Table reservation confirmed! JK Motel looks forward to welcoming you.", "success");
    event.target.reset();
  } catch (err) {
    showToast(err.message || "Failed to make reservation. Please call us directly.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Reservation";
    }
  }
}

// ==========================================================
// 7. CONTACT FORM
// ==========================================================

function sendMessage(event) {
  event.preventDefault();
  showToast("Thank you for contacting JK Motel. Our team has received your message and will get back to you shortly.", "success");
  event.target.reset();
}

function toggleNav() {
  document.getElementById("navLinks").classList.toggle("show");
}

// ==========================================================
// 8. ADMIN DASHBOARD
// ==========================================================

function openAdminDashboard(tab = 'overview') {
  const user = Storage.getUser();
  if (!user || user.role !== 'admin') {
    showToast("Access restricted to administrators.", "error");
    return;
  }
  const modal = document.getElementById("adminDashboardModal");
  if (!modal) return;
  switchAdminTab(tab);
  modal.classList.add("open");
}

function closeAdminDashboard() {
  const modal = document.getElementById("adminDashboardModal");
  if (modal) modal.classList.remove("open");
}

function switchAdminTab(tab) {
  ['overview', 'orders', 'food', 'reservations', 'users'].forEach(t => {
    const btn = document.getElementById(`admTabBtn_${t}`);
    const sec = document.getElementById(`admSec_${t}`);
    if (btn) btn.classList.toggle("active", t === tab);
    if (sec) sec.style.display = t === tab ? 'block' : 'none';
  });

  if (tab === 'overview') loadAdminOverview();
  if (tab === 'orders') loadAdminOrders();
  if (tab === 'food') loadAdminFoodList();
  if (tab === 'reservations') loadAdminReservations();
  if (tab === 'users') loadAdminUsers();
}

async function loadAdminOverview() {
  try {
    const res = await API.admin.getStats();
    if (!res || !res.stats) return;

    document.getElementById("admStatCustomers").textContent = res.stats.total_customers;
    document.getElementById("admStatFood").textContent = res.stats.total_food_items;
    document.getElementById("admStatOrders").textContent = res.stats.total_orders;
    document.getElementById("admStatRevenue").textContent = `₹${res.stats.total_revenue}`;
    document.getElementById("admStatPendingOrders").textContent = res.stats.pending_orders;
  } catch (err) {
    showToast(`Failed to load admin stats: ${err.message}`, "error");
  }
}

async function loadAdminOrders(status = 'all') {
  const tbody = document.getElementById("admOrdersTbody");
  tbody.innerHTML = "<tr><td colspan='7'>Loading orders...</td></tr>";

  try {
    const res = await API.admin.getOrders({ status });
    if (!res.orders || res.orders.length === 0) {
      tbody.innerHTML = "<tr><td colspan='7'>No orders found.</td></tr>";
      return;
    }

    const statusOptions = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    tbody.innerHTML = res.orders.map(o => `
      <tr>
        <td><b>#${o.order_id}</b><br><small>${new Date(o.created_at).toLocaleDateString()}</small></td>
        <td>${o.customer_name}<br><small>${o.customer_phone}</small></td>
        <td><small>${o.delivery_address}</small></td>
        <td>
          ${(o.items || []).map(it => `<span class="order-pill-item">${it.food_name} × ${it.quantity}</span>`).join(" ")}
        </td>
        <td><b>₹${parseFloat(o.total_amount).toFixed(2)}</b></td>
        <td>
          <select onchange="adminUpdateOrderStatus('${o.order_id}', this.value)" style="padding:4px; font-size:12px; border-radius:4px;">
            ${statusOptions.map(st => `
              <option value="${st}" ${st === o.status ? 'selected' : ''}>${st}</option>
            `).join("")}
          </select>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='7' style='color:red;'>${err.message}</td></tr>`;
  }
}

async function adminUpdateOrderStatus(orderId, newStatus) {
  try {
    await API.admin.updateOrderStatus(orderId, newStatus);
    showToast(`Order #${orderId} marked as ${newStatus}`, "success");
    loadAdminOverview();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadAdminFoodList() {
  const tbody = document.getElementById("admFoodTbody");
  tbody.innerHTML = "<tr><td colspan='6'>Loading food items...</td></tr>";

  try {
    const res = await API.food.getAll({ category: 'all' });
    const items = res.food_items || res.data || [];
    if (items.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>No food items in database.</td></tr>";
      return;
    }

    tbody.innerHTML = items.map(f => `
      <tr>
        <td><img src="${f.image}" style="width:45px; height:45px; border-radius:6px; object-fit:cover;"></td>
        <td><b>${f.name}</b><br><small>${f.description || ''}</small></td>
        <td><span style="font-size:11px; background:#eee; padding:2px 6px; border-radius:4px;">${f.category_name}</span></td>
        <td><b>₹${parseFloat(f.price).toFixed(2)}</b></td>
        <td>
          <span class="status-badge ${f.is_available ? 'status-Confirmed' : 'status-Cancelled'}">
            ${f.is_available ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm" onclick="openEditFoodModal(${JSON.stringify(f).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="adminDeleteFood('${f.id}', '${f.name.replace(/'/g, "\\'")}')">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='6' style='color:red;'>${err.message}</td></tr>`;
  }
}

function openAddFoodModal() {
  document.getElementById("foodModalTitle").textContent = "Add New Food Item";
  document.getElementById("foodFormId").value = "";
  document.getElementById("foodFormName").value = "";
  document.getElementById("foodFormCat").value = "1";
  document.getElementById("foodFormPrice").value = "";
  document.getElementById("foodFormDesc").value = "";
  document.getElementById("foodFormImg").value = "";
  document.getElementById("foodFormAvailable").checked = true;

  document.getElementById("adminFoodModal").classList.add("open");
}

function openEditFoodModal(item) {
  document.getElementById("foodModalTitle").textContent = `Edit "${item.name}"`;
  document.getElementById("foodFormId").value = item.id;
  document.getElementById("foodFormName").value = item.name;
  document.getElementById("foodFormCat").value = item.category_id;
  document.getElementById("foodFormPrice").value = item.price;
  document.getElementById("foodFormDesc").value = item.description || "";
  document.getElementById("foodFormImg").value = item.image || "";
  document.getElementById("foodFormAvailable").checked = Boolean(item.is_available);

  document.getElementById("adminFoodModal").classList.add("open");
}

function closeAdminFoodModal() {
  document.getElementById("adminFoodModal").classList.remove("open");
}

async function handleSaveFoodItem(event) {
  event.preventDefault();
  const id = document.getElementById("foodFormId").value;
  const name = document.getElementById("foodFormName").value.trim();
  const category_id = document.getElementById("foodFormCat").value;
  const price = parseFloat(document.getElementById("foodFormPrice").value);
  const description = document.getElementById("foodFormDesc").value.trim();
  const image = document.getElementById("foodFormImg").value.trim();
  const is_available = document.getElementById("foodFormAvailable").checked;

  try {
    if (id) {
      await API.food.update(id, { name, category_id, price, description, image, is_available });
      showToast(`Updated "${name}" successfully.`, "success");
    } else {
      await API.food.create({ name, category_id, price, description, image, is_available });
      showToast(`Added "${name}" to food menu.`, "success");
    }
    closeAdminFoodModal();
    loadAdminFoodList();
    fetchMenu();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function adminDeleteFood(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
  try {
    await API.food.delete(id);
    showToast(`Deleted "${name}"`, "success");
    loadAdminFoodList();
    fetchMenu();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadAdminReservations(status = 'all') {
  const tbody = document.getElementById("admResTbody");
  tbody.innerHTML = "<tr><td colspan='6'>Loading reservations...</td></tr>";

  try {
    const res = await API.admin.getReservations({ status });
    const list = res.reservations || [];
    if (list.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>No reservations found.</td></tr>";
      return;
    }

    tbody.innerHTML = list.map(r => `
      <tr>
        <td><b>${r.name}</b><br><small>${r.phone} | ${r.email}</small></td>
        <td>${r.reservation_date}<br><small>${r.reservation_time}</small></td>
        <td><b>${r.guests}</b></td>
        <td>${r.occasion || 'Dining'}<br><small>${r.special_requests || 'No special requests'}</small></td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
        <td>
          ${r.status === 'Pending' ? `
            <button class="btn btn-sm" onclick="adminSetResStatus('${r.id}', 'Confirmed')">Confirm</button>
            <button class="btn btn-sm btn-danger" onclick="adminSetResStatus('${r.id}', 'Rejected')">Reject</button>
          ` : `
            <select onchange="adminSetResStatus('${r.id}', this.value)" style="padding:4px; font-size:12px;">
              <option value="Pending" ${r.status==='Pending'?'selected':''}>Pending</option>
              <option value="Confirmed" ${r.status==='Confirmed'?'selected':''}>Confirmed</option>
              <option value="Rejected" ${r.status==='Rejected'?'selected':''}>Rejected</option>
              <option value="Completed" ${r.status==='Completed'?'selected':''}>Completed</option>
            </select>
          `}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='6' style='color:red;'>${err.message}</td></tr>`;
  }
}

async function adminSetResStatus(id, status) {
  try {
    await API.admin.updateReservationStatus(id, status);
    showToast(`Reservation marked as ${status}`, "success");
    loadAdminReservations();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadAdminUsers() {
  const tbody = document.getElementById("admUsersTbody");
  tbody.innerHTML = "<tr><td colspan='6'>Loading users...</td></tr>";

  try {
    const res = await API.admin.getUsers();
    const users = res.users || [];
    if (users.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>No users found.</td></tr>";
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><b>${u.name}</b></td>
        <td>${u.email}</td>
        <td>${u.phone || 'N/A'}</td>
        <td><span class="role-tag" style="${u.role==='admin'?'background:var(--primary);':'background:#777;'}">${u.role.toUpperCase()}</span></td>
        <td>${u.total_orders} orders (₹${u.total_spent})</td>
        <td><small>${new Date(u.created_at).toLocaleDateString()}</small></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='6' style='color:red;'>${err.message}</td></tr>`;
  }
}

// ==========================================================
// 9. APP INITIALIZATION
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  updateAuthNav();
  fetchMenu();
  loadCart();
});

