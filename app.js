// --- Global State ---
let PRODUCTS = [];
let cart = JSON.parse(localStorage.getItem('agricart-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const DISCOUNT_RATES = {
    'business': 0.20, // 20% off
    'customer': 0.15, // 15% off
    'guest': 0.00
};

// Initial product data (extracted from original index.html)
PRODUCTS = [
    { id: 1, name: 'Bananas', emoji: 'images/bananas.jpg', tiers: { good: 45, better: 55, best: 65, premium: 85 } },
    { id: 2, name: 'Apples', emoji: 'images/apples.jpg', tiers: { good: 60, better: 75, best: 90, premium: 120 } },
    { id: 3, name: 'Oranges', emoji: 'images/oranges.jpg', tiers: { good: 50, better: 65, best: 80, premium: 110 } },
    { id: 4, name: 'Mangoes', emoji: 'images/mangoes.jpg', tiers: { good: 70, better: 90, best: 110, premium: 150 } },
    { id: 5, name: 'Pears', emoji: 'images/pear.jpg', tiers: { good: 55, better: 70, best: 85, premium: 115 } },
    { id: 6, name: 'Grapes', emoji: 'images/grapes.jpg', tiers: { good: 65, better: 80, best: 100, premium: 140 } },
    { id: 7, name: 'Pineapples', emoji: 'images/pinaples.jpg', tiers: { good: 80, better: 100, best: 120, premium: 160 } },
    { id: 8, name: 'Avocados', emoji: 'images/avocados.jpg', tiers: { good: 75, better: 95, best: 115, premium: 155 } },
    { id: 9, name: 'Strawberries', emoji: 'images/strawberies.jpg', tiers: { good: 85, better: 105, best: 125, premium: 165 } },
    { id: 10, name: 'Blueberries', emoji: 'images/bleuberries.jpg', tiers: { good: 95, better: 115, best: 135, premium: 175 } },
    { id: 11, name: 'Kiwis', emoji: 'images/kiwi.jpg', tiers: { good: 70, better: 85, best: 100, premium: 130 } },
    { id: 12, name: 'Watermelons', emoji: 'images/watermelon.jpg', tiers: { good: 120, better: 150, best: 180, premium: 230 } },
    { id: 13, name: 'Papayas', emoji: 'images/papayas.jpg', tiers: { good: 60, better: 75, best: 90, premium: 120 } },
    { id: 14, name: 'Lemons', emoji: 'images/lemon.jpg', tiers: { good: 40, better: 50, best: 60, premium: 80 } },
    { id: 15, name: 'Limes', emoji: 'images/lime.jpg', tiers: { good: 40, better: 50, best: 60, premium: 80 } }
];

// --- User Management ---
let USERS = JSON.parse(localStorage.getItem('agricart-users')) || [
    {
        "username": "business_user",
        "password": "password123",
        "role": "business"
    },
    {
        "username": "customer_user",
        "password": "password456",
        "role": "customer"
    }
];

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('agricart-users', JSON.stringify(USERS));
}

// --- Utility Functions for User Data and Authentication ---

/**
 * Simulates fetching user data from a server.
 * @returns {Promise<Array>} A promise that resolves with the list of users.
 */
async function fetchUsers() {
    return USERS;
}

/**
 * Handles user registration
 * @param {string} username 
 * @param {string} password 
 * @param {string} role - 'business' or 'customer'
 */
async function register(username, password, role) {
    try {
        // Validate inputs
        if (!username || !password || !role) {
            showToast("Please fill in all fields.", "error");
            return false;
        }

        if (username.length < 3) {
            showToast("Username must be at least 3 characters long.", "error");
            return false;
        }

        if (password.length < 6) {
            showToast("Password must be at least 6 characters long.", "error");
            return false;
        }

        const users = await fetchUsers();
        
        // Check if username already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            showToast("Username already exists. Please choose a different one.", "error");
            return false;
        }

        // Create new user
        const newUser = {
            username: username,
            password: password,
            role: role
        };

        USERS.push(newUser);
        saveUsers();

        showToast(`Account created successfully! Welcome, ${username}!`);
        
        // Auto-login after registration
        localStorage.setItem('currentUser', JSON.stringify({ username: username, role: role }));
        
        // Redirect based on role
        if (role === 'business') {
            window.location.href = 'business.html';
        } else {
            window.location.href = 'customer.html';
        }
        
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        showToast("An error occurred during registration. Please try again.", "error");
        return false;
    }
}

/**
 * Handles the login process (used on index.html).
 * This function is the single source of truth for login and redirection.
 * @param {string} username 
 * @param {string} password 
 */
async function login(username, password) {
    try {
        const users = await fetchUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({ username: user.username, role: user.role }));
            showToast(`Welcome, ${user.username}! Redirecting to your ${user.role} portal...`);
            
            // Redirect based on role
            if (user.role === 'business') {
                window.location.href = 'business.html';
            } else if (user.role === 'customer') {
                window.location.href = 'customer.html';
            }
            return true;
        } else {
            showToast("Invalid username or password.", "error");
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast("An error occurred during login. Please try again.", "error");
        return false;
    }
}

/**
 * Logs out the current user and redirects to the login page.
 */
function logout() {
    localStorage.removeItem('currentUser');
    showToast("You have been logged out. Redirecting to login...");
    // Clear cart on logout for security/simplicity
    cart = [];
    localStorage.removeItem('agricart-cart');
    window.location.href = 'index.html'; 
}

/**
 * Allows user to browse as guest
 */
function browseAsGuest() {
    showToast("Continuing as guest. You can browse products and add to cart.");
    window.location.href = 'guest.html';
}

/**
 * Decodes a JWT token (frontend-only, no signature verification)
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - The decoded payload or null if invalid
 */
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Handles Google Sign-In credential response
 * @param {string} credential - The JWT credential from Google
 */
async function handleGoogleCredential(credential) {
    try {
        // Decode the JWT token to get user info
        const payload = decodeJWT(credential);
        
        if (!payload) {
            showToast("Error processing Google Sign-In. Please try again.", "error");
            return;
        }

        // Extract user information from the credential
        const email = payload.email;
        const name = payload.name || payload.given_name || 'User';
        const picture = payload.picture || '';
        const emailVerified = payload.email_verified || false;

        // Log user info to console as requested
        console.log('Google Sign-In User Info:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Picture:', picture);
        console.log('Email Verified:', emailVerified);

        if (!email) {
            showToast("Unable to retrieve email from Google account. Please try again.", "error");
            return;
        }

        // Check if user exists by email (Google users will have email as identifier)
        const users = await fetchUsers();
        // First check for exact email match (Google users), then check if username matches email
        const existingUser = users.find(u => u.email === email) || users.find(u => u.username === email);

        if (existingUser) {
            // User exists, log them in
            const userData = {
                username: existingUser.username || email.split('@')[0],
                email: email,
                name: name,
                picture: picture,
                role: existingUser.role,
                authMethod: 'google'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            showToast(`Welcome back, ${name}! Redirecting to your ${existingUser.role} portal...`);
            
            // Redirect based on role
            if (existingUser.role === 'business') {
                window.location.href = 'business.html';
            } else {
                window.location.href = 'customer.html';
            }
        } else {
            // New user - create account
            // Default to customer role for Google sign-ups (can be changed later)
            const username = email.split('@')[0];
            const newUser = {
                username: username,
                email: email,
                password: null, // No password for Google users
                role: 'customer', // Default to customer
                name: name,
                picture: picture,
                authMethod: 'google'
            };

            USERS.push(newUser);
            saveUsers();

            // Auto-login the new user
            const userData = {
                username: username,
                email: email,
                name: name,
                picture: picture,
                role: 'customer',
                authMethod: 'google'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            showToast(`Account created successfully! Welcome, ${name}!`);
            
            // Redirect to customer portal
            window.location.href = 'customer.html';
        }
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showToast("An error occurred during Google Sign-In. Please try again.", "error");
    }
}

// Expose Google credential handler globally
window.handleGoogleCredential = handleGoogleCredential;

/**
 * Toggles between login and register forms
 */
function toggleAuthForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleLink = document.getElementById('auth-toggle-link');

    if (loginForm && registerForm && toggleText && toggleLink) {
        if (loginForm.style.display !== 'none') {
            // Switch to register form
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            toggleText.innerHTML = 'Already have an account? ';
            toggleLink.textContent = 'Login here';
            toggleLink.onclick = toggleAuthForm;
        } else {
            // Switch to login form
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            toggleText.innerHTML = "Don't have an account? ";
            toggleLink.textContent = 'Register here';
            toggleLink.onclick = toggleAuthForm;
        }
    }
}

// Expose functions globally for HTML event handlers
window.login = login;
window.logout = logout;
window.register = register;
window.browseAsGuest = browseAsGuest;
window.toggleAuthForm = toggleAuthForm;
window.initializePage = initializePage;
window.calculateDiscountedTotal = calculateDiscountedTotal;
window.updateLogoutButton = updateLogoutButton;
window.createFloatingLeaves = createFloatingLeaves;
window.updateProgressBar = updateProgressBar;
window.renderProducts = renderProducts;
window.openProductModal = openProductModal;
window.selectTier = selectTier;
window.updateTierQuantityControls = updateTierQuantityControls;
window.increaseTierQty = increaseTierQty;
window.decreaseTierQty = decreaseTierQty;
window.updateTierQty = updateTierQty;
window.updateTotalPrice = updateTotalPrice;
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.closeCheckout = closeCheckout;
window.submitOrder = submitOrder;
window.closeModal = closeModal;
window.updateCartCount = updateCartCount;
window.scrollToProducts = scrollToProducts;
window.showToast = showToast;

// --- Multi-Page Initialization ---

/**
 * Initializes the page for the specific role.
 * Should be called on DOMContentLoaded in business.html and customer.html.
 * @param {string} expectedRole - 'business', 'customer', or 'guest'
 */
function initializePage(expectedRole) {
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // 1. Handle Guest State
        if (expectedRole === 'guest') {
            // If a user is logged in, redirect them to their portal
            if (currentUser) {
                if (currentUser.role === 'business') {
                    window.location.href = 'business.html';
                } else if (currentUser.role === 'customer') {
                    window.location.href = 'customer.html';
                }
                return;
            }
            // If no user is logged in, proceed with guest initialization
            // Update guest banner
            const banner = document.getElementById('seasonal-banner-text');
            if (banner) {
                banner.innerHTML = `
                    Welcome, Guest! 
                    Browse our fresh products. 
                    <strong><a href="index.html" style="color: #fff; text-decoration: underline;">Login or Register</a></strong> 
                    to get special discounts!
                `;
            }
        } else {
            // 2. Handle Logged-In States (business.html, customer.html)
            if (!currentUser) {
                showToast("You must be logged in to view this page.", "error");
                window.location.href = 'index.html';
                return;
            }
            
            if (currentUser.role !== expectedRole) {
                showToast(`Access denied. You are logged in as a ${currentUser.role}.`, "error");
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
                return;
            }
            
            // Update welcome banner for logged-in users
            const discountRate = (DISCOUNT_RATES[currentUser.role] * 100).toFixed(0);
            const roleDisplay = currentUser.role === 'business' ? 'Business-to-Business (B2B)' : 'Customer';
            const displayName = currentUser.name || currentUser.username;
            const userPicture = currentUser.picture || '';
            
            const banner = document.getElementById('seasonal-banner-text');
            if (banner) {
                let pictureHtml = '';
                if (userPicture) {
                    pictureHtml = `<img src="${userPicture}" alt="${displayName}" style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle; margin-right: 8px; border: 2px solid #fff;">`;
                }
                banner.innerHTML = `
                    ${pictureHtml}Welcome, ${displayName}! 
                    You are a <strong>${roleDisplay}</strong> account. 
                    You receive a special <strong>${discountRate}%</strong> discount on all orders.
                `;
            }
            
            updateLogoutButton();
        }
        
        // 3. Common Initialization for ALL pages
        updateCartCount();
        renderProducts();
        createFloatingLeaves(); 
        
        // Only add progress bar if it exists on the page
        if (document.getElementById("progress-bar")) {
            window.addEventListener('scroll', updateProgressBar);
        }
        
    } catch (error) {
        console.error('Page initialization error:', error);
        showToast("An error occurred while loading the page.", "error");
    }
}

// --- Common Functions ---

/**
 * Calculates the total price with the current user's discount applied.
 * @param {Array} items - The list of cart items.
 * @returns {object} The summary of the cart total.
 */
function calculateDiscountedTotal(items) {
    // Ensure currentUser is loaded for discount calculation
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const role = currentUser ? currentUser.role : 'guest';
    const discountRate = DISCOUNT_RATES[role] || 0;
    const discountAmount = subtotal * discountRate;
    const finalTotal = subtotal - discountAmount;
    
    return {
        subtotal: subtotal,
        discountRate: discountRate,
        discountAmount: discountAmount,
        finalTotal: finalTotal
    };
}

function updateLogoutButton() {
    try {
        const header = document.getElementById('main-header');
        if (!header) return;
        
        const headerContent = header.querySelector('.header-content');
        let logoutBtn = document.getElementById('logout-btn');

        if (!logoutBtn) {
            logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.className = 'cart-btn'; 
            
            const cartButtonContainer = headerContent ? headerContent.querySelector('div') : null;
            if (cartButtonContainer) {
                cartButtonContainer.appendChild(logoutBtn);
            } else if (headerContent) {
                headerContent.appendChild(logoutBtn);
            } else {
                header.appendChild(logoutBtn);
            }
        }

        if (currentUser) {
            const displayName = currentUser.name || currentUser.username;
            logoutBtn.innerHTML = `🚪 Logout (${displayName})`;
            logoutBtn.onclick = logout;
            logoutBtn.style.display = 'inline-flex';
        } else {
            logoutBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error updating logout button:', error);
    }
}

function createFloatingLeaves() {
    const container = document.getElementById('floating-leaves');
    if (!container) return; 
    
    container.innerHTML = '';
    
    const leafCount = 20;

    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 15;
        const animationDuration = 15 + Math.random() * 10;
        
        leaf.style.left = `${left}%`;
        leaf.style.animationDelay = `${animationDelay}s`;
        leaf.style.animationDuration = `${animationDuration}s`;
        
        container.appendChild(leaf);
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    if (!progressBar) return;
    
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    try {
        grid.innerHTML = PRODUCTS.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.emoji}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4kTm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">4 quality options available</div>
                    <button class="btn-secondary" onclick="openProductModal(${product.id})">
                        View options
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering products:', error);
        grid.innerHTML = '<p>Error loading products. Please refresh the page.</p>';
    }
}

function openProductModal(productId) {
    try {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }

        const modal = document.getElementById('product-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        if (!modal || !modalTitle || !modalBody) {
            showToast('Modal elements not found.', 'error');
            return;
        }

        modalTitle.textContent = product.name;
        modalBody.innerHTML = `
            <div style="text-align: center; height: 200px; margin-bottom: 1rem; overflow: hidden; border-radius: 8px;">
                <img src="${product.emoji}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4kTm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
            </div>
            <div class="tier-options">
                <div class="tier-option" onclick="selectTier(this, 'good', ${product.tiers.good})">
                    <div class="tier-name">Good</div>
                    <div class="tier-price">R${product.tiers.good}</div>
                </div>
                <div class="tier-option" onclick="selectTier(this, 'better', ${product.tiers.better})">
                    <div class="tier-name">Better</div>
                    <div class="tier-price">R${product.tiers.better}</div>
                </div>
                <div class="tier-option" onclick="selectTier(this, 'best', ${product.tiers.best})">
                    <div class="tier-name">Best</div>
                    <div class="tier-price">R${product.tiers.best}</div>
                </div>
                <div class="tier-option" onclick="selectTier(this, 'premium', ${product.tiers.premium})">
                    <div class="tier-name">Premium</div>
                    <div class="tier-price">R${product.tiers.premium}</div>
                </div>
            </div>
            <div class="tier-quantity-controls" id="tier-quantity-controls">
                <!-- Tier quantity controls will be added here -->
            </div>
            <div class="price-display" id="total-price">Total: R0.00</div>
            <button class="btn-primary" style="width: 100%; padding: 1rem; font-size: 1rem;" onclick="addToCart(${productId})">
                Add to Cart
            </button>
        `;

        modal.classList.add('active');
        window.currentProduct = product;
        window.selectedTiers = {};
        window.selectedTier = null;
        window.selectedPrice = 0;
        
        // Initialize tier quantity controls
        updateTierQuantityControls();
    } catch (error) {
        console.error('Error opening product modal:', error);
        showToast('Error opening product details.', 'error');
    }
}

function selectTier(element, tier, price) {
    try {
        document.querySelectorAll('.tier-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        window.selectedTier = tier;
        window.selectedPrice = price;
        
        // Initialize this tier in selectedTiers if not present
        if (!window.selectedTiers[tier]) {
            window.selectedTiers[tier] = 0;
        }
        
        updateTierQuantityControls();
        updateTotalPrice();
    } catch (error) {
        console.error('Error selecting tier:', error);
    }
}

function updateTierQuantityControls() {
    const container = document.getElementById('tier-quantity-controls');
    const product = window.currentProduct;
    
    if (!product || !container) return;
    
    try {
        let html = '';
        
        // Create quantity controls for each tier
        Object.entries(product.tiers).forEach(([tier, price]) => {
            const quantity = window.selectedTiers[tier] || 0;
            const isSelected = window.selectedTier === tier;
            
            html += `
                <div class="tier-quantity-row" ${isSelected ? 'style="background-color: rgba(132, 157, 103, 0.05); border-radius: 8px; padding: 0.75rem;"' : ''}>
                    <div class="tier-quantity-info">
                        <div class="tier-quantity-name">${tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
                        <div class="tier-quantity-price">R${price} per item</div>
                    </div>
                    <div class="tier-quantity-selector">
                        <button type="button" class="quantity-btn" onclick="decreaseTierQty('${tier}')">−</button>
                        <input type="number" id="quantity-${tier}" value="${quantity}" min="0" class="quantity-input" onchange="updateTierQty('${tier}', this.value)">
                        <button type="button" class="quantity-btn" onclick="increaseTierQty('${tier}')">+</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error updating tier quantity controls:', error);
    }
}

function increaseTierQty(tier) {
    try {
        const input = document.getElementById(`quantity-${tier}`);
        if (!input) return;
        input.value = parseInt(input.value) + 1;
        updateTierQty(tier, input.value);
    } catch (error) {
        console.error('Error increasing tier quantity:', error);
    }
}

function decreaseTierQty(tier) {
    try {
        const input = document.getElementById(`quantity-${tier}`);
        if (!input) return;
        if (parseInt(input.value) > 0) {
            input.value = parseInt(input.value) - 1;
            updateTierQty(tier, input.value);
        }
    } catch (error) {
        console.error('Error decreasing tier quantity:', error);
    }
}

function updateTierQty(tier, value) {
    try {
        window.selectedTiers[tier] = parseInt(value) || 0;
        updateTotalPrice();
    } catch (error) {
        console.error('Error updating tier quantity:', error);
    }
}

function updateTotalPrice() {
    try {
        const product = window.currentProduct;
        if (!product) return;
        
        let total = 0;
        
        Object.entries(window.selectedTiers).forEach(([tier, quantity]) => {
            if (quantity > 0 && product.tiers[tier]) {
                total += product.tiers[tier] * quantity;
            }
        });
        
        const totalPriceElement = document.getElementById('total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = `Total: R${total.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error updating total price:', error);
    }
}

function addToCart(productId) {
    try {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }

        let hasItems = false;
        
        // Check if any tier has quantity > 0
        Object.values(window.selectedTiers).forEach(quantity => {
            if (quantity > 0) hasItems = true;
        });
        
        if (!hasItems) {
            showToast('Please select at least one quality tier with quantity greater than 0', 'error');
            return;
        }

        // Add each tier with quantity > 0 to cart
        Object.entries(window.selectedTiers).forEach(([tier, quantity]) => {
            if (quantity > 0) {
                cart.push({
                    productName: product.name,
                    tier: tier,
                    price: product.tiers[tier],
                    quantity: quantity,
                    total: product.tiers[tier] * quantity
                });
            }
        });

        localStorage.setItem('agricart-cart', JSON.stringify(cart));
        updateCartCount();
        closeModal();
        showToast(`${product.name} added to cart!`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error adding item to cart.', 'error');
    }
}

function openCart() {
    try {
        const modal = document.getElementById('cart-modal');
        const cartItems = document.getElementById('cart-items');

        if (!modal || !cartItems) {
            showToast('Cart elements not found.', 'error');
            return;
        }

        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600;">${item.productName} (${item.tier})</div>
                        <div style="color: #666; font-size: 0.875rem;">R${item.price.toFixed(2)} × ${item.quantity}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: #849D67;">R${item.total.toFixed(2)}</div>
                        <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #d32f2f; cursor: pointer; text-decoration: underline; font-size: 0.875rem;">Remove</button>
                    </div>
                </div>
            `).join('');
        }

        const totals = calculateDiscountedTotal(cart);
        
        const subtotalElement = document.getElementById('cart-subtotal');
        const discountElement = document.getElementById('cart-discount');
        const totalElement = document.getElementById('cart-total');
        
        if (subtotalElement) subtotalElement.textContent = `Subtotal: R${totals.subtotal.toFixed(2)}`;
        if (discountElement) discountElement.textContent = `Discount (${(totals.discountRate * 100).toFixed(0)}%): -R${totals.discountAmount.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `Total: R${totals.finalTotal.toFixed(2)}`;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error opening cart:', error);
        showToast('Error opening cart.', 'error');
    }
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function removeFromCart(index) {
    try {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            localStorage.setItem('agricart-cart', JSON.stringify(cart));
            updateCartCount();
            openCart(); // Refresh cart view
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Error removing item from cart.', 'error');
    }
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    closeCart();
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.classList.add('active');
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function submitOrder(event) {
    try {
        event.preventDefault();

        const name = document.getElementById('customer-name');
        const phone = document.getElementById('customer-phone');
        const address = document.getElementById('customer-address');
        const date = document.getElementById('delivery-date');

        if (!name || !phone || !address || !date) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const nameValue = name.value.trim();
        const phoneValue = phone.value.trim();
        const addressValue = address.value.trim();
        const dateValue = date.value;

        if (!nameValue || !phoneValue || !addressValue || !dateValue) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const totals = calculateDiscountedTotal(cart);
        
        const orderDetails = cart.map(item => 
            `${item.productName} (${item.tier}) - R${item.price.toFixed(2)} × ${item.quantity} = R${item.total.toFixed(2)}`
        ).join('\n');

        const message = `Hi Agricart! I'd like to place an order:\n\n*Order Details:*\n${orderDetails}\n\n*Subtotal: R${totals.subtotal.toFixed(2)}*\n*Discount (${(totals.discountRate * 100).toFixed(0)}%): -R${totals.discountAmount.toFixed(2)}*\n*Final Total: R${totals.finalTotal.toFixed(2)}*\n\n*Customer Details:*\nName: ${nameValue}\nPhone: ${phoneValue}\nAddress: ${addressValue}\nDelivery Date: ${dateValue}`;

        const whatsappUrl = `https://wa.me/27720494067?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        cart = [];
        localStorage.setItem('agricart-cart', JSON.stringify(cart));
        updateCartCount();
        closeCheckout();
        showToast('Order sent to WhatsApp! Cart cleared.');
    } catch (error) {
        console.error('Error submitting order:', error);
        showToast('Error submitting order. Please try again.', 'error');
    }
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function updateCartCount() {
    try {
        // Count total number of items, not unique products
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

function scrollToProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: 'smooth' });
    }
}

function showToast(message, type = "success") {
    try {
        // Remove any existing toast
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        if (type === 'error') {
            toast.style.backgroundColor = '#c0392b'; // Red for errors
        } else {
            toast.style.backgroundColor = '#2c3e50'; // Dark blue for success/info
        }

        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-100px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('product-modal');
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');

    if (productModal && event.target === productModal) closeModal();
    if (cartModal && event.target === cartModal) closeCart();
    if (checkoutModal && event.target === checkoutModal) closeCheckout();
}

// Add keyboard event listener for ESC key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeCart();
        closeCheckout();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // This will be overridden by specific page initializations
    updateCartCount();
});