const pageName = window.location.pathname.split('/').pop();
const isHome = pageName === 'index.html';
const isMenu = pageName === 'menu.html';
const isAbout = pageName === 'about.html';
const isContact = pageName === 'contact.html';

// Home page carousel
if (isHome) {
  const leftBtn = document.querySelector('.arrow-left');
  const rightBtn = document.querySelector('.arrow-right');
  const gallery = document.querySelector('.food-gallery');
  const cards = Array.from(document.querySelectorAll('.food-card'));

  if (rightBtn && leftBtn && gallery) {
    rightBtn.addEventListener('click', () => {
      const first = cards.shift();
      gallery.appendChild(first);
    });
    leftBtn.addEventListener('click', () => {
      const last = cards.pop();
      gallery.prepend(last);
    });
  }
}

// Menu page
if (isMenu) {
  let cart = [];
  let modalQty = 1;
  let currentPayMethod = "Credit Card";
  let countdownInterval = null;

  const modalQtyText = document.querySelector('.qty-control span');
  const modalMinus = document.querySelector('.qty-control .qty-btn:first-child');
  const modalPlus = document.querySelector('.qty-control .qty-btn:last-child');
  const orderBtn = document.getElementById('orderBtn');
  const goToPayBtn = document.getElementById('goToPayBtn');
  const payNowBtn = document.getElementById('payNowBtn');
  const priceSlider = document.querySelector('.price-slider');
  const priceDisplay = document.getElementById('priceValue');
  const aiInput = document.getElementById("aiInput");
  const aiSearchBtn = document.getElementById("aiSearchBtn");
  const aiResetBtn = document.getElementById("aiResetBtn");
  const aiGuide = document.querySelector(".ai-guide-text");
  const aiResult = document.getElementById("aiResult");
  const aiRenderList = document.getElementById("aiRenderList");
  const menuGrid = document.querySelector('.menu-grid');
  const staticRecItems = document.querySelectorAll(".recommendation-item, .package-item");
  const searchInput = document.getElementById('searchInput');
  const categoryBtns = document.querySelectorAll('.category-list button');
  const menuCards = document.querySelectorAll('.menu-card');
  const cartTabs = document.querySelectorAll('.cart-tab');

  // Pop-up window control
  window.openModal = function openModal(name, price, img, tag, rating, reviews) {
    modalQty = 1;
    modalQtyText.innerText = 1;
    window.currentFood = { name, price, img };
    document.querySelectorAll('.dish-panel').forEach(p => p.style.display = 'none');
    const target = document.querySelector(`.dish-panel[data-dish="${name}"]`);
    if (target) target.style.display = 'block';
    document.querySelectorAll('.pref-btn').forEach(b => b.classList.remove('active'));
    const defaultPref = document.querySelector('.pref-btn');
    document.getElementById('foodModal').style.display = 'flex';
  }

  // Pop-up window add to cart
  const modalAddBtn = document.querySelector('.modal-add-btn');
  if (modalAddBtn) {
  modalAddBtn.onclick = () => {
    if (!window.currentFood) return;
    const selectedPref = document.querySelector('.pref-btn.active');
    if (!selectedPref) {
      alert('Please select your preference');
      return;
    }
    const selectedPrefText = selectedPref.innerText;
    addToCart({ ...window.currentFood, qty: modalQty, pref: selectedPrefText });
    document.getElementById('foodModal').style.display = 'none';
  };
}

  // Add shopping cart
  function addToCart(food) {
    const exist = cart.find(i => i.name === food.name && i.pref === food.pref);
    if (exist) exist.qty += food.qty;
    else cart.push({ ...food });
    renderCart();
  }

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.menu-card');
      if (!card) return;
      const name = card.querySelector('.card-title').innerText;
      const price = card.querySelector('.price').innerText;
      const img = card.querySelector('img').getAttribute('src');
      const tag = card.querySelector('.tag').innerText;
      const rating = card.querySelector('.rating span').innerText;
      const reviews = card.querySelectorAll('.rating span')[2].innerText;
      openModal(name, price, img, tag, rating, reviews);
    });
  });

  function renderCart() {
    const box = document.getElementById('cartItems');
    if (!box) return;
    box.innerHTML = '';
    if (cart.length === 0) {
      box.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      document.querySelector('.total-amount').innerText = '$0';
      return;
    }
    cart.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-details">
                <p class="cart-item-name">${item.name} (${item.pref || 'No Spicy'})</p>
                <p class="cart-item-price">${item.price}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
            </div>
        `;
      box.appendChild(div);
    });
    calcTotal();
  }

  // Modification of shopping cart quantity
  window.changeQty = function (index, num) {
    if (cart[index].qty + num < 1) {
      cart.splice(index, 1);
    } else {
      cart[index].qty += num;
    }
    renderCart();
  };

  // Quantity±
  if (modalMinus && modalPlus && modalQtyText) {
    modalMinus.onclick = () => {
      if (modalQty > 1) { modalQty--; modalQtyText.innerText = modalQty; }
    };
    modalPlus.onclick = () => { modalQty++; modalQtyText.innerText = modalQty; };
  }

  // Calculate the total price
  function calcTotal() {
    let total = 0;
    cart.forEach(item => {
      const price = parseFloat(item.price.replace('$', ''));
      total += price * item.qty;
    });
    document.querySelector('.total-amount').innerText = `$${total.toFixed(2)}`;
  }

  // Close the pop-up window
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.onclick = function () {
      clearInterval(countdownInterval);
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    };
  });

  // Payment Methods
  function openPaymentModal() {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    document.getElementById('paymentModal').style.display = 'flex';
    startPaymentCountdown();
  }
  if (orderBtn) orderBtn.onclick = openPaymentModal;

  // Select payment Methods
  document.querySelectorAll('.payment-option').forEach(option => {
    option.onclick = function () {
      currentPayMethod = this.innerText.trim();
      document.getElementById('paymentModal').style.display = 'none';
      const tab = document.querySelector('.cart-tab.active').innerText.trim();
      const addrInput = document.getElementById('deliveryAddress');
      const addrTitle = document.querySelector('#addressModal .modal-title');
      if (tab === 'Pick Up') {
        addrInput.value = '38 Railway Ave, Ringwood East Vic 3135';
        addrInput.disabled = true;
        addrTitle.innerText = 'Pick Up Information';
      } else {
        addrInput.value = '85 Barry Street, Carlton, VIC 3053';
        addrInput.disabled = false;
        addrTitle.innerText = 'Delivery Information';
      }
      document.getElementById('addressModal').style.display = 'flex';
    };
  });

  // Go to pay
  if (goToPayBtn) {
    goToPayBtn.onclick = () => {
      document.getElementById('addressModal').style.display = 'none';
      document.querySelector('#paymentDetailModal .modal-title').innerText = `Pay with ${currentPayMethod}`;
      document.getElementById('paymentDetailModal').style.display = 'flex';
    };
  }

  // Pay now
  if (payNowBtn) {
    payNowBtn.onclick = (e) => {
      e.preventDefault();
      clearInterval(countdownInterval);
      cart = [];
      renderCart();
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      document.getElementById('successModal').style.display = 'flex';
    };
  }

  // Back homepage
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.onclick = () => { window.location.href = 'index.html'; };
  }

  // Classification
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      menuCards.forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'flex' : 'none';
      });
    });
  });

  // Delivery / Pick Up switching
  cartTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      cartTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Price slider
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', () => {
      const max = parseInt(priceSlider.value);
      priceDisplay.innerText = max;
      menuCards.forEach(card => {
        const p = parseFloat(card.querySelector('.price').innerText.replace('$', ''));
        card.style.display = p <= max ? 'flex' : 'none';
      });
    });
  }

  // Association when searching
  if (searchInput) {
    const suggestBox = document.createElement('div');
    suggestBox.className = 'suggestion-box';
    document.querySelector('.search-bar').appendChild(suggestBox);
    const dishNames = [];
    document.querySelectorAll('.card-title').forEach(el => {
      dishNames.push(el.innerText.trim());
    });
    searchInput.addEventListener('input', function () {
      const key = this.value.trim().toLowerCase();
      suggestBox.innerHTML = '';
      if (!key) {
        suggestBox.style.display = 'none';
        menuCards.forEach(c => c.style.display = 'block');
        return;
      }
      const matches = dishNames.filter(name => name.toLowerCase().includes(key));
      if (matches.length > 0) {
        suggestBox.style.display = 'block';
        matches.forEach(word => {
          const div = document.createElement('div');
          div.className = 'suggest-item';
          div.innerText = word;
          div.onclick = () => {
            searchInput.value = word;
            suggestBox.style.display = 'none';
            doSearch(word);
          };
          suggestBox.appendChild(div);
        });
      } else {
        suggestBox.style.display = 'none';
      }
      doSearch(key);
    });
    function doSearch(keyword) {
      const key = keyword.toLowerCase();
      menuCards.forEach(card => {
        const name = card.querySelector('.card-title').innerText.toLowerCase();
        card.style.display = name.includes(key) ? 'flex' : 'none';
      });
    }
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-bar')) suggestBox.style.display = 'none';
    });
  }

  // Preference
  document.querySelectorAll('.pref-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pref-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // AI assistance
  const aiDishData = [
    { name: "Chinese Mushroom & Veg Soup", price: "$8.70", img: "menucard9.jpg", tag: "Seasonal", rating: "4.9", reviews: "8 reviews" },
    { name: "Shredded Duck Soup", price: "$9.80", img: "menucard10.jpg", tag: "Popular", rating: "4.6", reviews: "15 reviews" },
    { name: "Special Fried Rice", price: "$18.00", img: "menucard1.jpg", tag: "Popular", rating: "4.9", reviews: "12 reviews" },
    { name: "BBQ Roasted Duck", price: "$30.50", img: "menucard20.jpg", tag: "Popular", rating: "4.8", reviews: "18 reviews" },
    { name: "Homemade Dim Sims(3 Pcs)", price: "$9.80", img: "menucard2.jpg", tag: "Low Fat", rating: "4.7", reviews: "16 reviews" },
    { name: "Single-person Package", price: "$28.80", img: "single-person package.jpg", tag: "Set Meal", rating: "4.9", reviews: "—" },
    { name: "Chicken Sweet Corn Soup", price: "$8.70", img: "menucard8.jpg", tag: "Low Fat", rating: "4.9", reviews: "18 reviews" },
    { name: "Vegetarian Rice", price: "$16.90", img: "menucard26.jpg", tag: "Vegetarian", rating: "4.7", reviews: "14 reviews" },
    { name: "Stir Fried Mixed Vegetables", price: "$27.30", img: "menucard23.jpg", tag: "Vegetarian", rating: "4.8", reviews: "12 reviews" }
  ];

  // AI search
  function doAiSearch() {
    const val = aiInput.value.trim().toLowerCase();
    if (!val) {
      menuGrid.style.display = "grid";
      aiGuide.style.display = "block";
      aiResult.style.display = "none";
      staticRecItems.forEach(el => el.style.display = "flex");
      aiResetBtn.style.display = "none";
      return;
    }
    menuGrid.style.display = "none";
    aiGuide.style.display = "none";
    aiResult.style.display = "block";
    aiResetBtn.style.display = "block";
    aiRenderList.innerHTML = "";
    staticRecItems.forEach(el => el.style.display = "none");
    const matched = aiDishData.filter(d => {
      const t = (d.name + " " + d.tag).toLowerCase();
      return t.includes(val);
    });
    const showList = matched.length ? matched : aiDishData.slice(0, 3);
    showList.forEach(dish => {
      const div = document.createElement("div");
      div.className = "recommendation-item";
      div.innerHTML = `
            <img src="${dish.img}" alt="${dish.name}">
            <div class="ai-item-text">
                <p class="ai-item-title">${dish.name}</p>
                <p class="ai-item-desc">${dish.tag} ${dish.rating} ☆ ${dish.reviews}</p>
                <p class="ai-item-price">${dish.price}</p>
            </div>
            <button class="add-btn">+</button>
        `;
      div.querySelector(".add-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(dish.name, dish.price, dish.img, dish.tag, dish.rating, dish.reviews);
      });
      aiRenderList.appendChild(div);
    });
  }

  aiSearchBtn.addEventListener("click", doAiSearch);
  aiInput.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); doAiSearch(); }
  });

  aiResetBtn.addEventListener("click", () => {
    aiInput.value = "";
    menuGrid.style.display = "grid";
    aiGuide.style.display = "block";
    aiResult.style.display = "none";
    staticRecItems.forEach(el => el.style.display = "flex");
    aiResetBtn.style.display = "none";
  });

  // Payment countdown
  function startPaymentCountdown() {
    clearInterval(countdownInterval);
    let seconds = 15 * 60;
    const countdownEl = document.getElementById('countdownText');
    if (!countdownEl) return;
    countdownInterval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        countdownEl.innerText = "Payment expired, please place a new order.";
        countdownEl.className = "payment-expired";
        setTimeout(() => {
          document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
          alert("Payment time expired! Your order has been cancelled.");
        }, 1000);
        return;
      }
      let min = Math.floor(seconds / 60);
      let sec = seconds % 60;
      if (sec < 10) sec = "0" + sec;
      countdownEl.innerText = `Please make the payment within: ${min}:${sec}`;
    }, 1000);
  }

  // Initialize
  window.addEventListener('load', () => {
    renderCart();
  // Mobile bottom price
  const mobileTotal = document.querySelector('.total-price-text');
  const realTotal = document.querySelector('.total-amount');
  
  function syncMobileTotal() {
  if (mobileTotal && realTotal) {
    mobileTotal.innerHTML = `${realTotal.innerText} <span class="cart-toggle-btn">^</span>`;
  }
}
  
  // MObile payment process
  const mobileOrderBtn = document.querySelector('.order-submit-btn');
  const desktopOrderBtn = document.getElementById('orderBtn');

  if (mobileOrderBtn) {
  mobileOrderBtn.addEventListener('click', function () {
    const cartToggleBtn = document.querySelector('.cart-toggle-btn');
    if (cartToggleBtn) {
      cartToggleBtn.click();
    }
  });
}

  // Mobile order button
  const originalRenderCart = renderCart;
  renderCart = function () {
    originalRenderCart();
    syncMobileTotal();

    // Empty vehicles are covered with dust, and some goods have turned red
    if (mobileOrderBtn) {
      const isEmpty = cart.length === 0;
      mobileOrderBtn.style.backgroundColor = isEmpty ? '#cccccc' : '#A6423A';
      mobileOrderBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
    }
  };

  // First loading synchronization
  syncMobileTotal();
  });
}

// Contact us
if(isContact){
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');

// Sending messages
if (chatInput && chatMessages && sendBtn) {
function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';

    setTimeout(() => {
        const reply = getBotReply(text);
        appendMessage(reply, 'bot');
    }, 900);
}

function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    // Profile photo
    const avatar = role === 'bot' 
        ? '<div class="chat-avatar"><img src="logo.jpg" alt="Bot"/></div>'
        : '<div class="chat-avatar"><img src="user.jpg" alt="User"/></div>';

    div.innerHTML = `
        ${avatar}
        <div class="chat-bubble">
            <p>${text}</p >
        </div>
    `;

    chatMessages.appendChild(div);
    // Scroll to the latest news automatically
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Intelligent keyword reply
function getBotReply(text) {
    const t = text.toLowerCase().trim();

    // make an appointment
    if (t.includes('reserve') || t.includes('reservation') || t.includes('reserving') 
        || t.includes('book') || t.includes('booking') || t.includes('table')) {
        return 'Sure! We can help you make a table reservation. Please tell us how many people in your party, and your preferred date & time, thank you! 😊';
    }

    // business hours
    else if (t.includes('open') || t.includes('opening') || t.includes('hour') 
        || t.includes('close') || t.includes('when')) {
        return 'Our opening hours: Lunch 11:00 - 15:00, Dinner 17:00 - 22:30, open 7 days a week!';
    }

    // address
    else if (t.includes('address') || t.includes('location') || t.includes('where') 
        || t.includes('find') || t.includes('parking')) {
        return 'Our restaurant address: 38 Railway Ave, Ringwood East Vic 3135, Australia';
    }

    // menu/price
    else if (t.includes('menu') || t.includes('food') || t.includes('dish') 
        || t.includes('price') || t.includes('cost')) {
        return 'You can check our full Cantonese menu and all pricing on our dedicated Menu page!';
    }

    // delivery/pick up
    else if (t.includes('delivery') || t.includes('takeaway') || t.includes('pickup') 
        || t.includes('order')) {
        return 'We support both delivery and in-store pickup! You can place your order directly on our website.';
    }

    // contact
    else if (t.includes('call') || t.includes('phone') || t.includes('contact') 
        || t.includes('number')) {
        return 'You can reach us directly on our phone, or leave your question here and we will get back to you ASAP.';
    }

    // greet
    else if (t.includes('hi') || t.includes('hello') || t.includes('hey') 
        || t.includes('good morning') || t.includes('good afternoon')) {
        return 'Hello! Welcome to Taste of Cantonese! May I help you today?';
    }

    // good reputation
    else if (t.includes('thank') || t.includes('thanks')) {
        return "You're very welcome! It's our pleasure to serve you.";
    }

    // default reply
    else {
        return 'Thank you for your message! We have received your inquiry and will reply to you shortly.';
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});
}
}

// Hamburger menu
const hamburgerBtn = document.querySelector('.hamburger-btn');
const navLinks = document.querySelector('.nav-links');
if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
  });
  document.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
}

// Navigation highlighting
document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

// AI pop-up window on mobile phone
document.addEventListener('DOMContentLoaded', function() {
  if (typeof isMenu === 'undefined' || !isMenu) return;

  // create Pop-up
  const aiModal = document.createElement('div');
  aiModal.className = 'modal-overlay';
  aiModal.id = 'aiModal';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '×';

  modal.appendChild(closeBtn);
  aiModal.appendChild(modal);
  document.body.appendChild(aiModal);

  const aiOriginal = document.querySelector('.right-sidebar .sidebar-box:first-child');
  const aiResetBtn = document.getElementById('aiResetBtn');
  const aiBtn = document.querySelector('.ai-icon-btn');

  // AI button at the bottom opens a pop-up window
  if (aiBtn && aiOriginal) {
    aiBtn.addEventListener('click', function() {
      modal.appendChild(aiOriginal);
      aiModal.style.display = 'flex';
    });
  }

  // Close pop-up
  function closeAiModal() {
    aiModal.style.display = 'none';
  }

  closeBtn.addEventListener('click', closeAiModal);

  aiModal.addEventListener('click', function(e) {
    if (e.target === aiModal) closeAiModal();
  });
  if (aiResetBtn) {
    aiResetBtn.addEventListener('click', closeAiModal);
  }

  // Single-person package menu card
  const packageAddBtn = document.querySelector('.package-item .add-btn');
    if (packageAddBtn) {
      packageAddBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openModal(
          "Single-person Package",
          "$28.80",
          "single-person package.jpg",
          "Set Meal",
          "4.9",
          "—"
        );
      });
    } 
});

// Shopping cart
document.addEventListener('DOMContentLoaded', function () {
  if (typeof isMenu === 'undefined' || !isMenu) return;

  // Open a pop-up window
  const cartModal = document.createElement('div');
  cartModal.className = 'modal-overlay';
  cartModal.id = 'cartModal';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '×';

  modal.appendChild(closeBtn);
  cartModal.appendChild(modal);
  document.body.appendChild(cartModal);

  // Fixed get shopping cart
  const cartBox = document.querySelector('.right-sidebar .sidebar-box:last-child');
  const originalParent = cartBox.parentElement;

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('cart-toggle-btn')) {
      modal.appendChild(cartBox);
      cartModal.style.display = 'flex';
    }
  });

  // Close the pop-up window
  function closeCartModal() {
    cartModal.style.display = 'none';
    originalParent.appendChild(cartBox);
  }

  closeBtn.addEventListener('click', closeCartModal);
  cartModal.addEventListener('click', function (e) {
    if (e.target === cartModal) closeCartModal();
  });
});

// Mobile search
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSuggestBox = document.getElementById('mobileSuggestBox');
const mobileSearchModal = document.getElementById('mobileSearchModal');
const mobileSearchBtn = document.querySelector('.mobile-search-btn');
const mobileCloseBtn = mobileSearchModal?.querySelector('.modal-close');

// Open the pop-up window
if (mobileSearchBtn && mobileSearchModal) {
  mobileSearchBtn.addEventListener('click', () => {
    mobileSearchModal.style.display = 'flex';
    mobileSearchInput.value = ''; 
    mobileSearchInput.focus();
    mobileSuggestBox.style.display = 'none';
  });
}

// Close the pop-up window
function closeMobileSearch() {
  if (mobileSearchModal) mobileSearchModal.style.display = 'none';
}
if (mobileCloseBtn) {
  mobileCloseBtn.addEventListener('click', closeMobileSearch);
}
if (mobileSearchModal) {
  mobileSearchModal.addEventListener('click', (e) => {
    if (e.target === mobileSearchModal) closeMobileSearch();
  });
}

if (mobileSearchInput && mobileSuggestBox) {
  const dishNames = [];
  document.querySelectorAll('.card-title').forEach(el => {
    dishNames.push(el.innerText.trim());
  });

  mobileSearchInput.addEventListener('input', function () {
    const key = this.value.trim().toLowerCase();
    mobileSuggestBox.innerHTML = '';
    if (!key) {
      mobileSuggestBox.style.display = 'none';
      menuCards.forEach(c => c.style.display = 'block');
      return;
    }
    const matches = dishNames.filter(name => name.toLowerCase().includes(key));
    if (matches.length > 0) {
      mobileSuggestBox.style.display = 'block';
      matches.forEach(word => {
        const div = document.createElement('div');
        div.className = 'suggest-item';
        div.innerText = word;
        div.onclick = () => {
          mobileSearchInput.value = word;
          mobileSuggestBox.style.display = 'none';
          doSearch(word);
          closeMobileSearch(); 
        };
        mobileSuggestBox.appendChild(div);
      });
    } else {
      mobileSuggestBox.style.display = 'none';
    }
    doSearch(key);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-search-modal-bar')) {
      mobileSuggestBox.style.display = 'none';
    }
  });

  mobileSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch(mobileSearchInput.value.trim());
      closeMobileSearch(); 
    }
  });
}

// Automatically count the number of classified dishes
document.addEventListener('DOMContentLoaded', function () {
  if (!isMenu) return;

  // Count how many menu-cards there are in each category
  const categoryCount = {};
  const menuCards = document.querySelectorAll('.menu-card');

  menuCards.forEach(card => {
    const cat = card.dataset.category;
    if (cat) {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  });

  const categoryBtns = document.querySelectorAll('.category-list button');
  categoryBtns.forEach(btn => {
    const cat = btn.dataset.category;
    const countEl = btn.querySelector('.cat-count');
    if (countEl && categoryCount[cat]) {
      countEl.innerText = categoryCount[cat];
    }
  });
})

