// Interactive demo helpers to provide rich feedback when clicking
document.addEventListener('DOMContentLoaded', () => {
  let cartCount = parseInt(localStorage.getItem('cf_demo_cart_count') || '1', 10);
  const cartBadge = document.querySelector('.cart-badge');
  if (cartBadge) cartBadge.textContent = cartCount.toString();

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="color:#34d399">✓</span> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Handle Add to Cart buttons
  document.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cartCount++;
      localStorage.setItem('cf_demo_cart_count', cartCount.toString());
      if (cartBadge) cartBadge.textContent = cartCount.toString();
      const title = btn.getAttribute('data-item') || 'Product';
      showToast(`Added ${title} to your bag!`);
    });
  });

  // Handle Swatches
  document.querySelectorAll('.swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
      const colorName = swatch.getAttribute('data-color') || 'Color';
      const label = document.querySelector('#selected-color-label');
      if (label) label.textContent = colorName;
    });
  });

  // Handle Qty Stepper
  const qtyPlus = document.querySelector('#qty-plus');
  const qtyMinus = document.querySelector('#qty-minus');
  const qtyVal = document.querySelector('#qty-val');
  if (qtyPlus && qtyMinus && qtyVal) {
    qtyPlus.addEventListener('click', () => {
      let q = parseInt(qtyVal.textContent, 10);
      q++;
      qtyVal.textContent = q.toString();
    });
    qtyMinus.addEventListener('click', () => {
      let q = parseInt(qtyVal.textContent, 10);
      if (q > 1) {
        q--;
        qtyVal.textContent = q.toString();
      }
    });
  }

  // Handle Payment Chips
  document.querySelectorAll('.payment-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.payment-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Handle Place Order
  const checkoutBtn = document.querySelector('#place-order-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Order confirmed! Tracking event recorded.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }
});
