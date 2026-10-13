const products = [
    { id: 1, name: "Premium Cotton T-Shirt", category: "T-Shirts", price: 8500, stock: 100, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80" },
    { id: 2, name: "Classic Polo Shirt", category: "Polo Shirts", price: 12000, stock: 80, image: "https://images.unsplash.com/photo-1625910513413-5fc1b7f9c9a4?auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Slim Fit Trousers", category: "Trousers", price: 18000, stock: 45, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80" },
    { id: 4, name: "Casual Men's Shirt", category: "Shirts", price: 15000, stock: 60, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80" },
    { id: 5, name: "Premium Hoodie", category: "Hoodies", price: 22000, stock: 30, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80" },
    { id: 6, name: "Everyday Polo", category: "Polo Shirts", price: 10000, stock: 70, image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80" },
    { id: 7, name: "Casual Trousers", category: "Trousers", price: 16000, stock: 35, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" },
    { id: 8, name: "Modern Casual Shirt", category: "Shirts", price: 14000, stock: 50, image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80" }
];

let cart = JSON.parse(localStorage.getItem("menswear-cart") || "[]");
let orders = JSON.parse(localStorage.getItem("menswear-orders") || "[]");

const money = amount => new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: 0
}).format(amount);

function saveCart() {
    localStorage.setItem("menswear-cart", JSON.stringify(cart));
}
function saveOrders() {
    localStorage.setItem("menswear-orders", JSON.stringify(orders));
}

function renderProducts() {
    const list = document.getElementById("product-list");
    const search = document.getElementById("search").value.trim().toLowerCase();
    const category = document.getElementById("category").value;

    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);
        const matchesCategory = category === "All" || product.category === category;
        return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {
        list.innerHTML = '<p class="empty-message">No products found.</p>';
        return;
    }

    list.innerHTML = filtered.map(product => `
        <article class="product-card">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="price">${money(product.price)}</p>
                <p class="stock">${product.stock} units available</p>
                <button class="add-button" onclick="addToCart(${product.id})" ${product.stock < 1 ? "disabled" : ""}>
                    ${product.stock < 1 ? "Out of Stock" : "Add to Cart"}
                </button>
            </div>
        </article>
    `).join("");
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product || product.stock < 1) {
        alert("This product is currently unavailable.");
        return;
    }

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        if (existing.quantity >= product.stock) {
            alert("You have reached the available stock quantity.");
            return;
        }
        existing.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    saveCart();
    renderCart();
    alert(product.name + " added to your cart.");
}

function changeQuantity(productId, amount) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(item => item.id === productId);
    if (!item || !product) return;

    const newQuantity = item.quantity + amount;
    if (newQuantity < 1) {
        cart = cart.filter(item => item.id !== productId);
    } else if (newQuantity > product.stock) {
        alert("The requested quantity exceeds available stock.");
        return;
    } else {
        item.quantity = newQuantity;
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    document.getElementById("cart-count").textContent = count;
    document.getElementById("cart-total").textContent = money(total);

    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-message">Your cart is empty.</p>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.name}</h4>
                <p>${money(item.price)} each</p>
                <strong>${money(item.price * item.quantity)}</strong>
            </div>
            <div class="quantity-controls">
                <button type="button" aria-label="Decrease quantity" onclick="changeQuantity(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button type="button" aria-label="Increase quantity" onclick="changeQuantity(${item.id}, 1)">+</button>
                <button type="button" class="remove-button" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join("");
}

function toggleCart() {
    const section = document.getElementById("cart-section");
    section.classList.toggle("hidden");
    if (!section.classList.contains("hidden")) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function renderOrders() {
    const history = document.getElementById("order-history");
    if (!orders.length) {
        history.innerHTML = '<p class="empty-message">No orders have been placed on this device yet.</p>';
        return;
    }

    history.innerHTML = orders.map(order => `
        <article class="order-card">
            <p><strong>Order:</strong> ${escapeHTML(order.id)}</p>
            <p><strong>Retailer:</strong> ${escapeHTML(order.retailerName)}</p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
            <p><strong>Items:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>Total:</strong> ${money(order.total)}</p>
            <p><strong>Status:</strong> <span class="order-status">${escapeHTML(order.status)}</span></p>
        </article>
    `).join("");
}

document.getElementById("checkout-form").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!cart.length) {
        alert("Please add products to your cart first.");
        return;
    }

    const form = new FormData(this);
    const retailerName = String(form.get("retailerName") || "").trim();
    const businessName = String(form.get("businessName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();

    if (!retailerName || !businessName || !phone || !address) {
        alert("Please complete all required fields.");
        return;
    }

    for (const item of cart) {
        const product = products.find(product => product.id === item.id);
        if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
            alert("One or more products are no longer available in the requested quantities.");
            return;
        }
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
        id: "MW-" + Date.now(),
        retailerName, businessName, phone, address,
        items: cart.map(item => ({ ...item })),
        total,
        status: "Pending Confirmation",
        date: new Date().toISOString()
    };

    orders.unshift(order);
    saveOrders();

    alert("Order saved on this device!\nOrder Number: " + order.id +
        "\nTotal: " + money(total) +
        "\n\nThis prototype has not sent the order to the distributor.");

    cart = [];
    saveCart();
    renderCart();
    renderOrders();
    this.reset();

    document.getElementById("cart-section").classList.add("hidden");
    document.getElementById("order-history").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("search").addEventListener("input", renderProducts);
document.getElementById("category").addEventListener("change", renderProducts);
document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
renderOrders();
