/* ==========================================================================
   AURELIA LUXE - Application Logic & Interactivity
   Curated & Crafted by Jagruti Patil
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize State
  let cart = JSON.parse(localStorage.getItem('aurelia_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('aurelia_wishlist')) || [];
  let activeCategory = 'all';
  let activeSort = 'featured';
  let appliedCoupon = null;

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('modal-overlay');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCountBadges = document.querySelectorAll('.cart-count-pill, .cart-header-count');
  const wishlistCountBadges = document.querySelectorAll('.wishlist-header-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartDiscountEl = document.getElementById('cart-discount');
  const cartTotalEl = document.getElementById('cart-total');
  const quickViewModal = document.getElementById('quick-view-modal');
  const checkoutModal = document.getElementById('checkout-modal');
  const searchModal = document.getElementById('search-modal');
  const toastEl = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');

  // ==========================================================================
  // 1. PRODUCT RENDERING & ROTATING BADGES
  // ==========================================================================
  function renderProducts() {
    if (!productsGrid) return;

    let filtered = [...PRODUCTS_DATA];

    // Filter by Category
    if (activeCategory === 'bestsellers') {
      filtered = filtered.filter(p => p.isBestSeller);
    } else if (activeCategory === 'under999') {
      filtered = filtered.filter(p => p.isUnder999 || p.price <= 999);
    } else if (activeCategory === 'new') {
      filtered = filtered.filter(p => p.isNew);
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Sort Products
    if (activeSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    // Update Counter
    const countEl = document.getElementById('product-count-display');
    if (countEl) countEl.textContent = `Showing ${filtered.length} demi-fine pieces`;

    productsGrid.innerHTML = filtered.map(product => {
      const isWishlisted = wishlist.includes(product.id);
      const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-card-media">
            <span class="rotating-badge-ribbon" data-badges='${JSON.stringify(product.badges)}'>${product.badges[0]}</span>
            <button class="product-wishlist-toggle ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${product.id}', event)" title="Save to Wishlist">
              <i class="${isWishlisted ? 'fas fa-heart' : 'far fa-heart'}"></i>
            </button>
            <img class="product-card-img primary-img" src="${product.image}" alt="${product.title}" loading="lazy">
            <img class="product-card-img hover-img" src="${product.hoverImage}" alt="${product.title}" loading="lazy">
            
            <div class="product-card-actions">
              <button class="btn-card-quick-add" onclick="quickAddToCart('${product.id}', event)">
                <i class="fas fa-shopping-bag"></i> Add
              </button>
              <button class="btn-card-quick-view" onclick="openQuickView('${product.id}', event)">
                <i class="far fa-eye"></i> Quick View
              </button>
            </div>
          </div>

          <div class="product-card-details">
            <div class="product-card-rating">
              <span class="rating-stars">★★★★★</span>
              <span>${product.rating} (${product.reviewCount})</span>
            </div>

            <h3 class="product-card-title" onclick="openQuickView('${product.id}', event)">${product.title}</h3>
            <p class="product-card-spec">${product.subtitle}</p>

            <div class="product-card-pricing">
              <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
              <span class="price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>
              <span class="price-discount-tag">${discountPercent}% OFF</span>
            </div>

            <div class="product-card-extra-info">
              <i class="fas fa-bolt"></i> Ships in 24h | Anti-Tarnish
            </div>
          </div>
        </div>
      `;
    }).join('');

    startRotatingBadges();
  }

  // Palmonas Signature Feature: Rotating Ribbon Badges
  function startRotatingBadges() {
    const ribbons = document.querySelectorAll('.rotating-badge-ribbon');
    ribbons.forEach(ribbon => {
      try {
        const badges = JSON.parse(ribbon.getAttribute('data-badges') || '[]');
        if (badges.length > 1) {
          let idx = 0;
          if (ribbon._badgeTimer) clearInterval(ribbon._badgeTimer);
          ribbon._badgeTimer = setInterval(() => {
            idx = (idx + 1) % badges.length;
            ribbon.textContent = badges[idx];
          }, 2800);
        }
      } catch (e) {}
    });
  }

  // ==========================================================================
  // 2. CATEGORY TABS & FILTERING
  // ==========================================================================
  window.filterCategory = function(cat, btnElement) {
    activeCategory = cat;
    document.querySelectorAll('.catalog-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    renderProducts();
  };

  const sortSelect = document.getElementById('catalog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  // Quick navigation from category circular stories
  window.navigateCategoryStory = function(cat) {
    const targetTab = document.querySelector(`.catalog-tab-btn[data-category="${cat}"]`);
    if (targetTab) {
      filterCategory(cat, targetTab);
    } else {
      filterCategory(cat, null);
    }
    const section = document.getElementById('shop-collection-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  // ==========================================================================
  // 3. CART SYSTEM (ADD, REMOVE, QUANTITY, FREE GIFT BAR)
  // ==========================================================================
  function saveCart() {
    localStorage.setItem('aurelia_cart', JSON.stringify(cart));
    updateCartUI();
  }

  window.quickAddToCart = function(productId, event) {
    if (event) event.stopPropagation();
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        metal: "18K Gold Vermeil",
        quantity: 1
      });
    }

    saveCart();
    showToast(`Added "${product.title}" to your Bag!`);
    openCart();
  };

  window.updateCartQty = function(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
  };

  window.removeFromCart = function(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    showToast("Item removed from bag");
  };

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(badge => badge.textContent = totalCount);

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon"><i class="fas fa-gem"></i></div>
          <h4>Your Bag is Empty</h4>
          <p>Explore our 18K Gold Vermeil & Fine Silver everyday essentials.</p>
          <button class="btn-primary-luxury" onclick="closeCart(); document.getElementById('shop-collection-section').scrollIntoView({behavior:'smooth'});">
            Shop Best Sellers
          </button>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = "₹0";
      if (cartDiscountEl) cartDiscountEl.textContent = "- ₹0";
      if (cartTotalEl) cartTotalEl.textContent = "₹0";
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.title}</h4>
          <span style="font-size: 0.72rem; color: #8c8275;">Finish: ${item.metal || '18K Gold'}</span>
          <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          <div class="cart-qty-counter">
            <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove item">
          <i class="far fa-trash-alt"></i>
        </button>
      </div>
    `).join('');

    // Totals & Gift Bar calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (appliedCoupon === 'AURELIA10') {
      discount = Math.round(subtotal * 0.10);
    } else if (appliedCoupon === 'STACKUP') {
      discount = subtotal > 2000 ? 500 : 250;
    } else if (appliedCoupon === 'PATIL50') {
      discount = Math.round(subtotal * 0.50);
    }

    const grandTotal = Math.max(0, subtotal - discount);

    if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (cartDiscountEl) cartDiscountEl.textContent = `- ₹${discount.toLocaleString('en-IN')}`;
    if (cartTotalEl) cartTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    // Free Gift Progress Bar (Target: ₹2,999)
    const targetGift = 2999;
    const progressPercent = Math.min(100, Math.round((subtotal / targetGift) * 100));
    const progressFill = document.getElementById('gift-progress-fill');
    const progressText = document.getElementById('gift-progress-text');

    if (progressFill && progressText) {
      progressFill.style.width = `${progressPercent}%`;
      if (subtotal >= targetGift) {
        progressText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked a FREE Jewellery Care Kit!`;
      } else {
        const remaining = targetGift - subtotal;
        progressText.innerHTML = `Add <strong>₹${remaining.toLocaleString('en-IN')}</strong> more to unlock a <strong>FREE Care Kit!</strong>`;
      }
    }
  }

  window.openCart = function() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    updateCartUI();
  };

  window.closeCart = function() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
  };

  window.applyCoupon = function() {
    const input = document.getElementById('cart-coupon-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (code === 'AURELIA10') {
      appliedCoupon = 'AURELIA10';
      showToast("Coupon 'AURELIA10' Applied: 10% Discount!");
    } else if (code === 'STACKUP') {
      appliedCoupon = 'STACKUP';
      showToast("Coupon 'STACKUP' Applied: ₹500 Fest Discount!");
    } else if (code === 'PATIL50') {
      appliedCoupon = 'PATIL50';
      showToast("VIP Coupon 'PATIL50' Applied: 50% Founder Discount!");
    } else {
      showToast("Invalid Coupon Code. Try 'AURELIA10' or 'STACKUP'");
      return;
    }
    updateCartUI();
  };

  // ==========================================================================
  // 4. WISHLIST SYSTEM
  // ==========================================================================
  function saveWishlist() {
    localStorage.setItem('aurelia_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
  }

  window.toggleWishlist = function(productId, event) {
    if (event) event.stopPropagation();
    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast("Removed from your Wishlist");
    } else {
      wishlist.push(productId);
      showToast("Saved to your Wishlist ❤️");
    }
    saveWishlist();
    renderProducts();
  };

  function updateWishlistUI() {
    wishlistCountBadges.forEach(badge => badge.textContent = wishlist.length);
  }

  window.openWishlist = function() {
    if (wishlist.length === 0) {
      showToast("Your Wishlist is empty. Tap ❤️ on items you love!");
      return;
    }
    // Filter view to only wishlisted products
    activeCategory = 'all';
    document.querySelectorAll('.catalog-tab-btn').forEach(b => b.classList.remove('active'));
    productsGrid.innerHTML = wishlist.map(id => {
      const p = PRODUCTS_DATA.find(item => item.id === id);
      if (!p) return '';
      return `
        <div class="product-card" data-id="${p.id}">
          <div class="product-card-media">
            <span class="rotating-badge-ribbon">WISHLISTED</span>
            <button class="product-wishlist-toggle active" onclick="toggleWishlist('${p.id}', event)">
              <i class="fas fa-heart"></i>
            </button>
            <img class="product-card-img primary-img" src="${p.image}" alt="${p.title}">
            <div class="product-card-actions">
              <button class="btn-card-quick-add" onclick="quickAddToCart('${p.id}', event)">
                <i class="fas fa-shopping-bag"></i> Move to Bag
              </button>
            </div>
          </div>
          <div class="product-card-details">
            <h3 class="product-card-title">${p.title}</h3>
            <div class="product-card-pricing">
              <span class="price-current">₹${p.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const section = document.getElementById('shop-collection-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    showToast(`Showing ${wishlist.length} Wishlisted items`);
  };

  // ==========================================================================
  // 5. QUICK VIEW MODAL
  // ==========================================================================
  let currentQuickViewProduct = null;
  let selectedMetal = "18K Gold Vermeil";

  window.openQuickView = function(productId, event) {
    if (event) event.stopPropagation();
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    currentQuickViewProduct = product;
    selectedMetal = "18K Gold Vermeil";

    const modalBody = document.getElementById('quick-view-content');
    if (!modalBody) return;

    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    modalBody.innerHTML = `
      <div class="quick-view-grid">
        <div class="quick-view-gallery">
          <div class="quick-view-main-img-box">
            <img id="qv-main-img" src="${product.image}" alt="${product.title}">
          </div>
          <div style="display:flex; gap:10px;">
            <img src="${product.image}" onclick="document.getElementById('qv-main-img').src='${product.image}'" style="width:60px; height:60px; border-radius:4px; cursor:pointer; border:1px solid #c5a059;">
            <img src="${product.hoverImage}" onclick="document.getElementById('qv-main-img').src='${product.hoverImage}'" style="width:60px; height:60px; border-radius:4px; cursor:pointer; border:1px solid #e8e2d8;">
          </div>
        </div>

        <div class="quick-view-details">
          <span style="font-size:0.75rem; letter-spacing:0.18em; text-transform:uppercase; color:#c5a059; font-weight:700;">AURELIA DEMIFINE®</span>
          <h3>${product.title}</h3>
          <p class="quick-view-subtitle">${product.subtitle}</p>

          <div class="quick-view-pricing">
            <span class="quick-view-price">₹${product.price.toLocaleString('en-IN')}</span>
            <span class="quick-view-original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="quick-view-discount">${discountPercent}% OFF</span>
          </div>

          <p style="font-size: 0.88rem; color:#6b6660; line-height: 1.6; margin-bottom: 16px;">
            ${product.description}
          </p>

          <div class="quick-view-metal-picker">
            <span class="metal-picker-label">Select Metal Finish:</span>
            <div class="metal-options-row">
              <button class="metal-option-btn active" onclick="selectQuickViewMetal(this, '18K Gold Vermeil')">18K Gold Vermeil</button>
              <button class="metal-option-btn" onclick="selectQuickViewMetal(this, '925 Platinum Silver')">925 Platinum Silver</button>
              <button class="metal-option-btn" onclick="selectQuickViewMetal(this, 'Rose Gold Luxe')">Rose Gold Luxe</button>
            </div>
          </div>

          <div class="quick-view-guarantee-strip">
            <div><i class="fas fa-tint"></i><br>Waterproof</div>
            <div><i class="fas fa-shield-alt"></i><br>Skin-Safe</div>
            <div><i class="fas fa-award"></i><br>1-Yr Warranty</div>
          </div>

          <div class="quick-view-cta-row">
            <button class="btn-primary-luxury" onclick="quickViewAddToCart()">
              <i class="fas fa-shopping-bag"></i> Add to Bag
            </button>
            <button class="btn-outline-luxury" style="color:#191715; border-color:#191715;" onclick="quickViewBuyNow()">
              Instant Checkout
            </button>
          </div>
        </div>
      </div>
    `;

    if (quickViewModal) quickViewModal.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  };

  window.selectQuickViewMetal = function(btn, metalName) {
    document.querySelectorAll('.metal-option-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMetal = metalName;
  };

  window.quickViewAddToCart = function() {
    if (!currentQuickViewProduct) return;
    cart.push({
      id: currentQuickViewProduct.id,
      title: currentQuickViewProduct.title,
      price: currentQuickViewProduct.price,
      originalPrice: currentQuickViewProduct.originalPrice,
      image: currentQuickViewProduct.image,
      metal: selectedMetal,
      quantity: 1
    });
    saveCart();
    closeAllModals();
    showToast(`Added "${currentQuickViewProduct.title}" to Bag!`);
    openCart();
  };

  window.quickViewBuyNow = function() {
    quickViewAddToCart();
    closeCart();
    openCheckout();
  };

  // ==========================================================================
  // 6. SIMULATED CHECKOUT MODAL
  // ==========================================================================
  window.openCheckout = function() {
    closeCart();
    if (cart.length === 0) {
      showToast("Please add items to your bag first!");
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const amountEl = document.getElementById('checkout-payable-amount');
    if (amountEl) amountEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

    const formScreen = document.getElementById('checkout-form-screen');
    const successScreen = document.getElementById('order-success-screen');
    if (formScreen) formScreen.style.display = 'block';
    if (successScreen) successScreen.style.display = 'none';

    if (checkoutModal) checkoutModal.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  };

  window.submitOrder = async function(event) {
    if (event) event.preventDefault();

    const form = event ? event.target : document.querySelector('#checkout-form-screen form');
    const inputs = form ? form.querySelectorAll('input') : [];
    const customerName = inputs.length >= 2 ? `${inputs[0].value} ${inputs[1].value}`.trim() : "Valued Customer";
    const customerEmail = inputs.length >= 3 ? inputs[2].value.trim() : "guest@example.com";
    const streetAddress = inputs.length >= 4 ? inputs[3].value.trim() : "Standard Address";
    const city = inputs.length >= 5 ? inputs[4].value.trim() : "City";
    const pincode = inputs.length >= 6 ? inputs[5].value.trim() : "400001";
    const paymentMethodCard = document.querySelector('.payment-method-card.active');
    const paymentMethod = paymentMethodCard ? paymentMethodCard.innerText.replace('\n', ' ').trim() : "Cash on Delivery";

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    if (appliedCoupon === 'AURELIA10') discount = Math.round(subtotal * 0.10);
    else if (appliedCoupon === 'STACKUP') discount = subtotal > 2000 ? 500 : 250;
    else if (appliedCoupon === 'PATIL50') discount = Math.round(subtotal * 0.50);
    const total = Math.max(0, subtotal - discount);

    let finalOrderId = `AUR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Try posting to real backend database
    const apiEndpoint = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api/orders'
      : 'https://ingredients-none-observations-details.trycloudflare.com/api/orders';


    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: "Not Provided",
          street_address: streetAddress,
          city: city,
          pincode: pincode,
          payment_method: paymentMethod,
          items: cart,
          subtotal: subtotal,
          discount: discount,
          total: total
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.order_id) {
          finalOrderId = result.order_id;
        }
      }
    } catch (err) {
      console.log("Backend offline or unreachable, order saved locally:", err);
    }

    const orderIdEl = document.getElementById('order-generated-id');
    if (orderIdEl) orderIdEl.textContent = finalOrderId;

    const formScreen = document.getElementById('checkout-form-screen');
    const successScreen = document.getElementById('order-success-screen');
    if (formScreen) formScreen.style.display = 'none';
    if (successScreen) successScreen.style.display = 'block';

    // Clear cart on successful order
    cart = [];
    saveCart();
    showToast("🎉 Order Placed Successfully & Recorded in Database!");
  };


  // ==========================================================================
  // 7. PINCODE DELIVERY ESTIMATOR (PALMONAS SIGNATURE WIDGET)
  // ==========================================================================
  window.checkPincodeDelivery = function() {
    const input = document.getElementById('pincode-input-field');
    const resultEl = document.getElementById('pincode-result-message');
    if (!input) return;

    const pin = input.value.trim();
    if (!/^\d{6}$/.test(pin)) {
      showToast("Please enter a valid 6-digit Indian PIN Code");
      return;
    }

    const metroPins = ['400', '411', '110', '560', '600', '700', '500', '380'];
    const isExpress = metroPins.some(prefix => pin.startsWith(prefix));

    if (resultEl) {
      resultEl.style.display = 'block';
      if (isExpress) {
        resultEl.innerHTML = `<span style="color:#2e7d32;"><i class="fas fa-bolt"></i> <strong>Express Delivery Available!</strong> Delivery to PIN ${pin} within <strong>24 to 48 Hours</strong>. Cash on Delivery is eligible.</span>`;
      } else {
        resultEl.innerHTML = `<span style="color:#a27e36;"><i class="fas fa-truck"></i> Standard Express Delivery to PIN ${pin} in <strong>3-4 business days</strong>. Free shipping included!</span>`;
      }
    }

    const headerPinBadge = document.getElementById('header-delivery-pin');
    if (headerPinBadge) {
      headerPinBadge.innerHTML = `<i class="fas fa-map-marker-alt"></i> Deliver to: <strong>${pin}</strong>`;
    }

    showToast(`Delivery location set to PIN: ${pin}`);
  };

  // ==========================================================================
  // 8. LIVE SEARCH MODAL
  // ==========================================================================
  window.openSearchModal = function() {
    if (searchModal) {
      searchModal.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
      const input = document.getElementById('main-search-input');
      if (input) {
        input.value = '';
        input.focus();
        handleSearchInput('');
      }
    }
  };

  window.closeSearchModal = function() {
    if (searchModal) searchModal.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
  };

  window.handleSearchInput = function(query) {
    const tray = document.getElementById('search-results-tray');
    if (!tray) return;

    const q = query.trim().toLowerCase();
    const matches = PRODUCTS_DATA.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      tray.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:#888;">No demi-fine jewellery matches found for "${query}"</div>`;
      return;
    }

    tray.innerHTML = matches.slice(0, 4).map(p => `
      <div class="product-card" onclick="closeSearchModal(); openQuickView('${p.id}')">
        <div class="product-card-media" style="padding-top:100%;">
          <img class="product-card-img" src="${p.image}" alt="${p.title}">
        </div>
        <div class="product-card-details">
          <h4 style="font-size:0.9rem; font-family:var(--font-serif);">${p.title}</h4>
          <span style="font-weight:700; color:var(--primary-gold-dark);">₹${p.price.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `).join('');
  };

  // ==========================================================================
  // 9. TOAST NOTIFICATIONS & MODAL CONTROLS
  // ==========================================================================
  function showToast(message) {
    if (!toastEl || !toastText) return;
    toastText.textContent = message;
    toastEl.classList.add('active');
    if (toastEl._timer) clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('active');
    }, 3200);
  }

  window.closeAllModals = function() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (quickViewModal) quickViewModal.classList.remove('active');
    if (checkoutModal) checkoutModal.classList.remove('active');
    if (searchModal) searchModal.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
  };

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeAllModals);
  }

  // ==========================================================================
  // 10. HERO SLIDER AUTO-PLAY & CONTROLS
  // ==========================================================================
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;

  function goToSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5500);

  // ==========================================================================
  // 11. TOP TICKER ROTATOR
  // ==========================================================================
  const tickerMessages = [
    "✨ Stack Up Fest – Buy Any 3 @ ₹2,999 | Free Express Shipping Across India",
    "💎 100% Anti-Tarnish & Waterproof | 18K Thick Gold Plated Demifine®",
    "📦 Ships within 24 Hours | 30-Day Hassle-Free Returns & Replating Guarantee",
    "🌿 Skin-Safe, Hypoallergenic & Certified Lab-Grown Diamonds"
  ];
  let tickerIdx = 0;
  const tickerEl = document.getElementById('ticker-cycle-text');
  if (tickerEl) {
    setInterval(() => {
      tickerIdx = (tickerIdx + 1) % tickerMessages.length;
      tickerEl.style.opacity = '0';
      setTimeout(() => {
        tickerEl.textContent = tickerMessages[tickerIdx];
        tickerEl.style.opacity = '1';
      }, 300);
    }, 3500);
  }

  // ==========================================================================
  // 12. FLASH SALE COUNTDOWN TIMER
  // ==========================================================================
  function updateCountdown() {
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    if (!hoursEl || !minsEl || !secsEl) return;

    let h = parseInt(hoursEl.textContent) || 12;
    let m = parseInt(minsEl.textContent) || 45;
    let s = parseInt(secsEl.textContent) || 30;

    s -= 1;
    if (s < 0) { s = 59; m -= 1; }
    if (m < 0) { m = 59; h -= 1; }
    if (h < 0) { h = 23; }

    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
  }
  setInterval(updateCountdown, 1000);

  // ==========================================================================
  // 13. FAQ ACCORDION
  // ==========================================================================
  document.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const isOpen = parent.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
      if (!isOpen) parent.classList.add('active');
    });
  });

  // ==========================================================================
  // 14. NEWSLETTER & WHATSAPP
  // ==========================================================================
  window.handleNewsletterSubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('newsletter-email-input');
    if (!input || !input.value.trim()) return;
    showToast(`Welcome! Use coupon code "AURELIA10" for 10% off your first order!`);
    input.value = '';
  };

  window.openWhatsAppSupport = function() {
    window.open("https://wa.me/?text=Hello%20Aurelia%20Luxe!%20I%20have%20an%20inquiry%20regarding%20Demi-Fine%20Jewellery.", "_blank");
  };

  // Initial Boot
  renderProducts();
  updateCartUI();
  updateWishlistUI();
});
