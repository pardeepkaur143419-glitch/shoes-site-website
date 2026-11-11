const API = "/api";

let products = [];
let cart = JSON.parse(localStorage.getItem("soleCart")) || [];

// Authentication
function getToken() {
    return localStorage.getItem("soleToken");
}

async function apiRequest(url, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(getToken()
            ? { Authorization: "Bearer " + getToken() }
            : {}),
        ...options.headers
    };

    const response = await fetch(API + url, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

// Load Products from MongoDB
async function loadProducts() {
    try {
        products = await apiRequest("/products");
        displayProducts(products);
    } catch (error) {
        alert(error.message);
    }
}

// Display Products
function displayProducts(items) {
    const container = document.getElementById("productContainer");

    if (!items.length) {
        container.innerHTML = "<p>No products found.</p>";
        return;
    }

    container.innerHTML = items.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">

            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.category} Collection</p>

                <p class="price">₹${p.price}</p>

                <label>Select Size:</label>
                <select id="size-${p._id}">
                    ${p.sizes.map(size =>
                        `<option value="${size}">UK ${size}</option>`
                    ).join("")}
                </select>

                <button onclick="addToCart('${p._id}')">
                    Add To Cart
                </button>
            </div>
        </div>
    `).join("");
}

// Search
function searchProducts() {
    const value = document.getElementById("searchInput")
        .value.toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value) ||
        p.category.toLowerCase().includes(value)
    );

    displayProducts(filtered);
}

// Category Filter
function filterProducts(category) {
    const filtered = category === "All"
        ? products
        : products.filter(p => p.category === category);

    displayProducts(filtered);

    document.getElementById("shop").scrollIntoView();
}

// Add to Cart
function addToCart(id) {
    const product = products.find(p => p._id === id);

    const size = Number(
        document.getElementById("size-" + id).value
    );

    const existing = cart.find(
        p => p.productId === id && p.size === size
    );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            productId: id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: 1
        });
    }

    saveCart();
    alert("Product added to cart!");
}

// Save Cart
function saveCart() {
    localStorage.setItem("soleCart", JSON.stringify(cart));
    updateCart();
}

// Update Cart
function updateCart() {
    const count = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    document.getElementById("cartCount").innerText = count;

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    document.getElementById("cartTotal").innerText =
        "Total: ₹" + total;

    document.getElementById("cartItems").innerHTML =
        cart.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <p>Size: UK ${item.size}</p>
                    <p>₹${item.price} × ${item.quantity}</p>

                    <button onclick="changeQuantity('${item.productId}',${item.size},-1)">−</button>

                    <button onclick="changeQuantity('${item.productId}',${item.size},1)">+</button>

                    <button onclick="removeFromCart('${item.productId}',${item.size})">
                        Remove
                    </button>
                </div>
            </div>
        `).join("") || "<p>Your cart is empty.</p>";
}

// Quantity
function changeQuantity(id, size, change) {
    const item = cart.find(
        p => p.productId === id && p.size === size
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(id, size);
        return;
    }

    saveCart();
}

// Remove
function removeFromCart(id, size) {
    cart = cart.filter(
        p => !(p.productId === id && p.size === size)
    );

    saveCart();
}

// Cart Modal
function showCart() {
    updateCart();
    document.getElementById("cartModal").style.display = "flex";
}

function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

// Login
function showLogin() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

async function loginUser() {
    try {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const data = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        localStorage.setItem("soleToken", data.token);
        localStorage.setItem("soleUser", JSON.stringify(data.user));

        closeLogin();
        alert("Welcome " + data.user.name + "!");

        if (data.user.role === "admin") {
            alert("You are logged in as Admin.");
        }

    } catch (error) {
        alert(error.message);
    }
}

// Register
function showRegister() {
    closeLogin();
    document.getElementById("registerModal").style.display = "flex";
}

function closeRegister() {
    document.getElementById("registerModal").style.display = "none";
}

async function registerUser() {
    try {
        const name = document.getElementById("regName").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        const data = await apiRequest("/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password })
        });

        alert(data.message);
        closeRegister();
        showLogin();

    } catch (error) {
        alert(error.message);
    }
}

// Logout
function logoutUser() {
    localStorage.removeItem("soleToken");
    localStorage.removeItem("soleUser");
    alert("Logged out successfully!");
}

// Checkout
function checkout() {
    if (!cart.length) {
        alert("Your cart is empty!");
        return;
    }

    if (!getToken()) {
        alert("Please login before placing your order.");
        closeCart();
        showLogin();
        return;
    }

    closeCart();
    document.getElementById("checkoutModal").style.display = "flex";
}

function closeCheckout() {
    document.getElementById("checkoutModal").style.display = "none";
}

// Place Order
document.getElementById("checkoutForm").addEventListener(
    "submit", async function(event) {
        event.preventDefault();

        try {
            const items = cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size
            }));

            const data = await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify({
                    items,
                    customerName:
                        document.getElementById("customerName").value,
                    phone:
                        document.getElementById("customerPhone").value,
                    address:
                        document.getElementById("customerAddress").value
                })
            });

            alert(data.message + "\nOrder ID: " + data.order._id);

            cart = [];
            saveCart();

            this.reset();
            closeCheckout();

        } catch (error) {
            alert(error.message);
        }
    }
);

// Customer Order History
async function myOrders() {
    try {
        const orders = await apiRequest("/my-orders");
        console.log("My Orders:", orders);
        alert("Your order history is available in the browser console.");
    } catch (error) {
        alert(error.message);
    }
}

// Admin: View Customers
async function adminCustomers() {
    try {
        const customers = await apiRequest("/admin/customers");
        console.table(customers);
        alert("Customer records loaded. Open browser console.");
    } catch (error) {
        alert(error.message);
    }
}

// Admin: View Orders
async function adminOrders() {
    try {
        const orders = await apiRequest("/admin/orders");
        console.table(orders);
        alert("Order records loaded. Open browser console.");
    } catch (error) {
        alert(error.message);
    }
}

// Admin: Update Order Status
async function updateOrderStatus(id, status) {
    try {
        const data = await apiRequest("/admin/orders/" + id, {
            method: "PATCH",
            body: JSON.stringify({ status })
        });

        alert(data.message);
    } catch (error) {
        alert(error.message);
    }
}

// Mobile Navigation
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}

// Contact
function sendMessage(event) {
    event.preventDefault();
    alert("Thank you for contacting SOLE STYLE!");
    event.target.reset();
}

// Start Website
loadProducts();
updateCart();