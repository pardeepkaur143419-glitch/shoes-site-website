// Product Data
const products = [
    {
        id: 1,
        name: "Air Runner",
        category: "Men",
        price: 2499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
    },
    {
        id: 2,
        name: "Classic White",
        category: "Women",
        price: 1999,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600"
    },
    {
        id: 3,
        name: "Sport Flex",
        category: "Sports",
        price: 2999,
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600"
    },
    {
        id: 4,
        name: "Street Style",
        category: "Men",
        price: 1799,
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600"
    },
    {
        id: 5,
        name: "Pink Comfort",
        category: "Women",
        price: 2199,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600"
    },
    {
        id: 6,
        name: "Power Walk",
        category: "Sports",
        price: 2799,
        image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600"
    },
    {
        id: 7,
        name: "Urban Sneakers",
        category: "Men",
        price: 1899,
        image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=600"
    },
    {
        id: 8,
        name: "Fashion Walk",
        category: "Women",
        price: 2399,
        image: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600"
    }
];

let cart = [];

// Display Products
function displayProducts(items) {
    const container = document.getElementById("productContainer");

    if (items.length === 0) {
        container.innerHTML = "<p>No shoes found!</p>";
        return;
    }

    container.innerHTML = items.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.category} Collection</p>
                <p class="price">₹${product.price}</p>
                <button onclick="addToCart(${product.id})">
                    Add To Cart
                </button>
            </div>
        </div>
    `).join("");
}

// Category Filter
function filterProducts(category) {
    const filtered = category === "All"
        ? products
        : products.filter(p => p.category === category);

    displayProducts(filtered);
    document.getElementById("shop").scrollIntoView();
}

// Search Products
function searchProducts() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
    );

    displayProducts(filtered);
}

// Add to Cart
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(p => p.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }

    updateCart();
    alert(product.name + " added to cart!");
}

// Update Cart
function updateCart() {
    const count = cart.reduce((sum, p) => sum + p.quantity, 0);

    document.getElementById("cartCount").innerText = count;

    const total = cart.reduce(
        (sum, p) => sum + p.price * p.quantity, 0
    );

    document.getElementById("cartTotal").innerText =
        "Total: ₹" + total;

    document.getElementById("cartItems").innerHTML =
        cart.map(p => `
            <div class="cart-item">
                <span>${p.name} × ${p.quantity}</span>
                <span>₹${p.price * p.quantity}</span>
                <button onclick="removeFromCart(${p.id})">Remove</button>
            </div>
        `).join("") || "<p>Your cart is empty.</p>";
}

// Remove Product
function removeFromCart(id) {
    cart = cart.filter(p => p.id !== id);
    updateCart();
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

function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please fill all fields.");
        return;
    }

    alert("Login demo successful!");
    closeLogin();
}

// Register
function showRegister() {
    closeLogin();
    document.getElementById("registerModal").style.display = "flex";
}

function closeRegister() {
    document.getElementById("registerModal").style.display = "none";
}

function registerUser() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    alert("Registration demo successful! Welcome " + name);
    closeRegister();
}

// Contact Form
function sendMessage(event) {
    event.preventDefault();
    alert("Thank you! Your message has been received.");
    event.target.reset();
}

// Mobile Menu
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Order placed successfully! (Demo)");
    cart = [];
    updateCart();
    closeCart();
}

// Initial Display
displayProducts(products);
updateCart();