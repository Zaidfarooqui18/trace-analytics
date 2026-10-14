/**
 * Trace Commerce Storefront Script
 * Powered by Authoritative TCCart Engine and Soft UI Evolution Components
 */

(function () {
  'use strict';

  // Product ID mapping for buttons with legacy or display names
  const PRODUCT_MAP = {
    'Aura Studio': 'aura-studio-wireless',
    'aura-studio': 'aura-studio-wireless',
    'aura-studio-wireless': 'aura-studio-wireless',
    'Lumina Dock': 'lumina-dock',
    'lumina-dock': 'lumina-dock',
    'Pulse Keyboard': 'pulse-keyboard',
    'pulse-keyboard': 'pulse-keyboard',
    'Nomad Pack': 'nomad-pack',
    'Nomad Weatherproof Pack': 'nomad-pack',
    'nomad-pack': 'nomad-pack',
    'Orbit Mouse': 'orbit-mouse',
    'orbit-mouse': 'orbit-mouse',
    'Wool Desk Mat': 'wool-desk-mat',
    'wool-desk-mat': 'wool-desk-mat'
  };

  function getCart() {
    return window.TCCart;
  }

  // Update all header badges across pages
  function syncBadge() {
    const cart = getCart();
    if (!cart) return;
    const summary = cart.getCartSummary();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach((badge) => {
      badge.textContent = summary.totalUnits.toString();
      // Add subtle bounce animation when badge updates
      badge.classList.remove('badge-bump');
      void badge.offsetWidth; // trigger reflow
      badge.classList.add('badge-bump');
    });
  }

  // Universal Toast Notification
  function showToast(message, type = 'success') {
    let toast = document.querySelector('.tc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'tc-toast';
      document.body.appendChild(toast);
    }
    const icon = type === 'success' 
      ? '<span class="tc-toast-icon success">✓</span>' 
      : '<span class="tc-toast-icon info">ℹ</span>';

    toast.innerHTML = `${icon} <span class="tc-toast-message">${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial badge synchronization
    syncBadge();

    // 2. Handle "Add to Bag" buttons across all storefront pages
    document.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cart = getCart();
        if (!cart) return;

        const rawItem = btn.getAttribute('data-product-id') || btn.getAttribute('data-item') || 'aura-studio-wireless';
        const productId = PRODUCT_MAP[rawItem] || rawItem;

        // Determine quantity if on detail page with quantity stepper
        let qty = 1;
        const qtyValEl = document.querySelector('#qty-val');
        if (qtyValEl && btn.id === 'add-to-cart-btn') {
          qty = Math.max(1, parseInt(qtyValEl.textContent, 10) || 1);
        }

        // Determine variant if on detail page
        let variant = null;
        const activeSwatch = document.querySelector('.swatch.active');
        if (activeSwatch && btn.id === 'add-to-cart-btn') {
          variant = activeSwatch.getAttribute('data-color') || null;
        }

        const summary = cart.addItem(productId, qty, variant);
        syncBadge();

        const catalogItem = window.TCCATALOG && window.TCCATALOG[productId];
        const name = catalogItem ? catalogItem.name : 'Item';
        const variantText = variant ? ` (${variant})` : '';
        const qtyText = qty > 1 ? ` (${qty}x)` : '';

        showToast(`Added ${name}${variantText}${qtyText} to your bag!`);
      });
    });

    // 3. Handle Product Detail Page Color Swatches
    document.querySelectorAll('.swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        const colorName = swatch.getAttribute('data-color') || 'Color';
        const label = document.querySelector('#selected-color-label');
        if (label) label.textContent = colorName;
      });
    });

    // 4. Handle Product Detail Page Quantity Stepper
    const qtyPlus = document.querySelector('#qty-plus');
    const qtyMinus = document.querySelector('#qty-minus');
    const qtyVal = document.querySelector('#qty-val');
    if (qtyPlus && qtyMinus && qtyVal) {
      qtyPlus.addEventListener('click', () => {
        let q = parseInt(qtyVal.textContent, 10) || 1;
        q++;
        qtyVal.textContent = q.toString();
      });
      qtyMinus.addEventListener('click', () => {
        let q = parseInt(qtyVal.textContent, 10) || 1;
        if (q > 1) {
          q--;
          qtyVal.textContent = q.toString();
        }
      });
    }

    // 5. Handle "Buy Now" button on product detail page
    const buyNowBtn = document.querySelector('#buy-now-btn');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const cart = getCart();
        if (cart) {
          const qty = qtyVal ? Math.max(1, parseInt(qtyVal.textContent, 10) || 1) : 1;
          const activeSwatch = document.querySelector('.swatch.active');
          const variant = activeSwatch ? activeSwatch.getAttribute('data-color') : null;
          cart.addItem('aura-studio-wireless', qty, variant);
          syncBadge();
        }
        window.location.href = 'checkout.html';
      });
    }

    // 6. Handle Gallery Angle Thumbnails on product detail page
    document.querySelectorAll('.thumb-btn').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.thumb-btn').forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
        // Visual indicator on main gallery
        const gallery = document.querySelector('#gallery-viewport svg');
        if (gallery) {
          gallery.style.transform = 'scale(0.92)';
          setTimeout(() => {
            gallery.style.transform = 'scale(1)';
          }, 150);
        }
      });
    });

    // 7. Handle Category Filtering on products/index pages
    const filterChips = document.querySelectorAll('.filter-bar .chip');
    if (filterChips.length > 0) {
      filterChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          filterChips.forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');

          const chipId = chip.id;
          const cards = document.querySelectorAll('.grid .card');
          cards.forEach((card) => {
            if (chipId === 'cat-all' || chipId === 'filter-all') {
              card.style.display = 'flex';
            } else if (chipId === 'cat-audio' || chipId === 'filter-audio') {
              card.style.display = card.id.includes('aura') ? 'flex' : 'none';
            } else if (chipId === 'cat-work' || chipId === 'filter-desk') {
              card.style.display = (card.id.includes('dock') || card.id.includes('keyboard') || card.id.includes('mouse') || card.id.includes('mat')) ? 'flex' : 'none';
            } else if (chipId === 'cat-bags' || chipId === 'filter-accessories') {
              card.style.display = card.id.includes('backpack') || card.id.includes('pack') ? 'flex' : 'none';
            } else {
              card.style.display = 'flex';
            }
          });
        });
      });
    }

    // 8. CHECKOUT PAGE CONTROLLER
    const checkoutContainer = document.querySelector('.checkout-layout');
    if (checkoutContainer) {
      initCheckoutPage();
    }
  });

  // Render & Manage Dynamic Checkout
  function initCheckoutPage() {
    const cart = getCart();
    if (!cart) return;

    const itemsContainer = document.querySelector('#cart-items-container');
    const emptyState = document.querySelector('#cart-empty-state');
    const summaryCard = document.querySelector('#order-summary-card');
    const subtotalEl = document.querySelector('#summary-subtotal');
    const shippingEl = document.querySelector('#summary-shipping');
    const taxEl = document.querySelector('#summary-tax');
    const grandTotalEl = document.querySelector('#summary-total');
    const placeOrderBtn = document.querySelector('#place-order-btn');
    const placeOrderTotalSpan = document.querySelector('#place-order-total-amount');

    function renderCartSummary() {
      const summary = cart.getCartSummary();
      syncBadge();

      if (summary.items.length === 0) {
        if (itemsContainer) itemsContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (shippingEl) shippingEl.textContent = '$0.00';
        if (taxEl) taxEl.textContent = '$0.00';
        if (grandTotalEl) grandTotalEl.textContent = '$0.00';
        if (placeOrderTotalSpan) placeOrderTotalSpan.textContent = '$0.00';
        if (placeOrderBtn) {
          placeOrderBtn.disabled = true;
          placeOrderBtn.style.opacity = '0.55';
          placeOrderBtn.style.cursor = 'not-allowed';
        }
        return;
      }

      if (itemsContainer) itemsContainer.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';

      // Render line items
      let html = '';
      summary.items.forEach((item) => {
        const renderIcon = window.TCRenderIcon || (() => '');
        const iconSvg = renderIcon(item.imageType, 24, item.accentColor || '#3878F5');

        html += `
          <div class="cart-line-item" data-product-id="${item.productId}" data-variant="${item.variant}">
            <div class="cart-item-icon-box" style="background: ${item.pastelColor || '#EEF3F8'}33; border-color: ${item.pastelColor || '#E2E8F0'}66;">
              ${iconSvg}
            </div>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-meta">
                <span class="cart-item-variant">${item.variant}</span>
                <span class="cart-item-unit-price">$${item.unitPrice.toFixed(2)} each</span>
              </div>
            </div>
            <div class="cart-item-actions">
              <div class="cart-item-stepper">
                <button type="button" class="stepper-btn" data-action="decrease-line" data-product-id="${item.productId}" data-variant="${item.variant}" aria-label="Decrease quantity">−</button>
                <span class="stepper-val">${item.quantity}</span>
                <button type="button" class="stepper-btn" data-action="increase-line" data-product-id="${item.productId}" data-variant="${item.variant}" aria-label="Increase quantity">+</button>
              </div>
              <div class="cart-item-price-col">
                <div class="cart-item-subtotal">$${item.lineSubtotal.toFixed(2)}</div>
                <button type="button" class="cart-item-remove-btn" data-action="remove-line" data-product-id="${item.productId}" data-variant="${item.variant}" title="Remove item">Remove</button>
              </div>
            </div>
          </div>
        `;
      });

      if (itemsContainer) {
        itemsContainer.innerHTML = html;
        bindItemEvents();
      }

      // Update Summary Numbers
      if (subtotalEl) subtotalEl.textContent = `$${summary.subtotal.toFixed(2)}`;
      if (shippingEl) shippingEl.textContent = summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`;
      if (taxEl) taxEl.textContent = `$${summary.tax.toFixed(2)}`;
      if (grandTotalEl) grandTotalEl.textContent = `$${summary.grandTotal.toFixed(2)}`;
      if (placeOrderTotalSpan) placeOrderTotalSpan.textContent = `$${summary.grandTotal.toFixed(2)}`;

      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.style.opacity = '1';
        placeOrderBtn.style.cursor = 'pointer';
      }
    }

    function bindItemEvents() {
      if (!itemsContainer) return;

      // Increase line
      itemsContainer.querySelectorAll('[data-action="increase-line"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-product-id');
          const variant = btn.getAttribute('data-variant');
          const item = cart.getRawItems().find((i) => i.productId === pid && i.variant === variant);
          if (item) {
            cart.updateQuantity(pid, item.quantity + 1, variant);
            renderCartSummary();
          }
        });
      });

      // Decrease line
      itemsContainer.querySelectorAll('[data-action="decrease-line"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-product-id');
          const variant = btn.getAttribute('data-variant');
          const item = cart.getRawItems().find((i) => i.productId === pid && i.variant === variant);
          if (item) {
            if (item.quantity > 1) {
              cart.updateQuantity(pid, item.quantity - 1, variant);
              renderCartSummary();
            } else {
              // At 1, prompt or remove directly
              cart.removeItem(pid, variant);
              showToast('Item removed from bag');
              renderCartSummary();
            }
          }
        });
      });

      // Remove line
      itemsContainer.querySelectorAll('[data-action="remove-line"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-product-id');
          const variant = btn.getAttribute('data-variant');
          cart.removeItem(pid, variant);
          showToast('Item removed from bag');
          renderCartSummary();
        });
      });
    }

    // Initial render
    renderCartSummary();

    // Payment Chips selection
    document.querySelectorAll('.payment-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.payment-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Fill Demo Data helper
    const fillDemoBtn = document.querySelector('#btn-fill-demo');
    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const firstName = document.querySelector('#input-first-name');
        const lastName = document.querySelector('#input-last-name');
        const email = document.querySelector('#input-email');
        const address = document.querySelector('#input-address');

        if (firstName) firstName.value = 'Sarah';
        if (lastName) lastName.value = 'Jenkins';
        if (email) email.value = 'sarah.jenkins@example.com';
        if (address) address.value = '742 Evergreen Terrace, Suite 400';

        // Clear any previous error states
        document.querySelectorAll('.form-error').forEach((err) => (err.textContent = ''));
        document.querySelectorAll('.form-input').forEach((inp) => inp.classList.remove('input-error'));
        showToast('Sample demo details filled for testing');
      });
    }

    // Checkout Form Validation & Submission
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const summary = cart.getCartSummary();
        if (summary.items.length === 0) {
          showToast('Your bag is empty! Add items from the catalog first.', 'info');
          return;
        }

        const firstNameInput = document.querySelector('#input-first-name');
        const lastNameInput = document.querySelector('#input-last-name');
        const emailInput = document.querySelector('#input-email');
        const addressInput = document.querySelector('#input-address');

        let isValid = true;

        function validateField(input, errorId, condition, errorMsg) {
          const errorEl = document.querySelector(`#${errorId}`);
          if (!condition) {
            if (errorEl) errorEl.textContent = errorMsg;
            if (input) input.classList.add('input-error');
            isValid = false;
          } else {
            if (errorEl) errorEl.textContent = '';
            if (input) input.classList.remove('input-error');
          }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        validateField(
          firstNameInput,
          'error-first-name',
          firstNameInput && firstNameInput.value.trim().length > 0,
          'First name is required'
        );
        validateField(
          lastNameInput,
          'error-last-name',
          lastNameInput && lastNameInput.value.trim().length > 0,
          'Last name is required'
        );
        validateField(
          emailInput,
          'error-email',
          emailInput && emailRegex.test(emailInput.value.trim()),
          'Please enter a valid email address'
        );
        validateField(
          addressInput,
          'error-address',
          addressInput && addressInput.value.trim().length >= 5,
          'Please enter a valid shipping address'
        );

        if (!isValid) {
          // Focus first invalid input
          const firstErr = document.querySelector('.form-input.input-error');
          if (firstErr) firstErr.focus();
          return;
        }

        // Show loading state
        const originalText = placeOrderBtn.innerHTML;
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `
          <span class="btn-spinner"></span>
          <span>Authorizing Demonstration Order...</span>
        `;

        // Record privacy-safe tracking event if tracker is available
        // Note: Zero personal details (name, email, address) are included in properties!
        try {
          if (window._cf_tracker && typeof window._cf_tracker.track === 'function') {
            window._cf_tracker.track('checkout_completed', {
              item_count: summary.totalUnits,
              order_total: summary.grandTotal,
              currency: 'USD'
            });
          }
        } catch (err) {}

        setTimeout(() => {
          // Clear cart
          cart.clearCart();
          syncBadge();

          // Render Success Modal / Confirmation View
          const orderNum = 'TC-' + Math.floor(100000 + Math.random() * 900000);
          showOrderSuccessModal(orderNum, summary.grandTotal);
        }, 1200);
      });
    }
  }

  function showOrderSuccessModal(orderId, total) {
    let modal = document.querySelector('#order-success-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'order-success-modal';
      modal.className = 'tc-modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="tc-modal-card">
        <div class="tc-success-icon-box">✓</div>
        <h2 style="font-size: 22px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">Order Confirmed!</h2>
        <p style="color: #64748B; font-size: 14px; margin-bottom: 20px;">
          Thank you for testing the Trace Commerce demo store. Your simulated order has been placed.
        </p>

        <div class="tc-order-receipt-box">
          <div class="receipt-row">
            <span>Order Reference</span>
            <strong>${orderId}</strong>
          </div>
          <div class="receipt-row">
            <span>Total Amount</span>
            <strong>$${total.toFixed(2)}</strong>
          </div>
          <div class="receipt-row">
            <span>Shipping</span>
            <span style="color: #16a34a; font-weight: 600;">Express (Free)</span>
          </div>
          <div class="receipt-row">
            <span>Analytics Status</span>
            <span style="color: #3878F5; font-weight: 600;">Event Recorded</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <a href="index.html" class="btn-primary" style="flex: 1; text-align: center; justify-content: center; text-decoration: none;">
            Return to Storefront
          </a>
          <a href="http://localhost:5173" target="_blank" class="btn-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>View Analytics</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }
})();
