/**
 * Trace Commerce Authoritative Cart Engine
 * Handles catalog lookup, cart persistence, state updates, and price math.
 */

const CATALOG = {
  'aura-studio-wireless': {
    id: 'aura-studio-wireless',
    name: 'Aura Studio Wireless',
    price: 299.00,
    category: 'Audio',
    imageType: 'headphones',
    defaultVariant: 'Space Grey',
    pastelColor: '#87CEEB',
    accentColor: '#0284c7'
  },
  'lumina-dock': {
    id: 'lumina-dock',
    name: 'Lumina Thunderbolt Dock',
    price: 189.00,
    category: 'Desk Setup',
    imageType: 'dock',
    defaultVariant: 'Space Grey',
    pastelColor: '#90EE90',
    accentColor: '#16a34a'
  },
  'pulse-keyboard': {
    id: 'pulse-keyboard',
    name: 'Pulse Mechanical 75%',
    price: 165.00,
    category: 'Desk Setup',
    imageType: 'keyboard',
    defaultVariant: 'Anodized Grey',
    pastelColor: '#FFB6C1',
    accentColor: '#db2777'
  },
  'nomad-pack': {
    id: 'nomad-pack',
    name: 'Nomad Weatherproof Pack',
    price: 145.00,
    category: 'Carry',
    imageType: 'backpack',
    defaultVariant: 'Obsidian Black',
    pastelColor: '#DDA0DD',
    accentColor: '#9333ea'
  },
  'orbit-mouse': {
    id: 'orbit-mouse',
    name: 'Orbit Precision Mouse',
    price: 99.00,
    category: 'Desk Setup',
    imageType: 'mouse',
    defaultVariant: 'Space Grey',
    pastelColor: '#F0E68C',
    accentColor: '#b45309'
  },
  'wool-desk-mat': {
    id: 'wool-desk-mat',
    name: 'Merino Wool Desk Mat',
    price: 58.00,
    category: 'Desk Setup',
    imageType: 'mat',
    defaultVariant: 'Dark Charcoal',
    pastelColor: '#87CEEB',
    accentColor: '#0284c7'
  }
};

const CART_STORAGE_KEY = 'tc_authoritative_cart_v1';
const TAX_RATE = 0.085; // 8.5% illustrative sales tax

class CartEngine {
  constructor(storage = null) {
    if (storage) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      // Memory fallback for tests/SSR
      this.storage = {
        _data: {},
        getItem: function(k) { return this._data[k] || null; },
        setItem: function(k, v) { this._data[k] = String(v); },
        removeItem: function(k) { delete this._data[k]; }
      };
    }
  }

  getRawItems() {
    try {
      const raw = this.storage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
      return [];
    } catch (e) {
      return [];
    }
  }

  saveItems(items) {
    try {
      this.storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  addItem(productId, quantity = 1, variant = null) {
    const product = CATALOG[productId];
    if (!product) return this.getCartSummary();

    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
    const chosenVariant = variant || product.defaultVariant;
    const items = this.getRawItems();

    const existingIndex = items.findIndex(
      (item) => item.productId === productId && item.variant === chosenVariant
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += qtyToAdd;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qtyToAdd,
        variant: chosenVariant,
        category: product.category,
        imageType: product.imageType
      });
    }

    this.saveItems(items);
    return this.getCartSummary();
  }

  updateQuantity(productId, newQty, variant = null) {
    const items = this.getRawItems();
    const qty = parseInt(newQty, 10);
    const itemIndex = items.findIndex((item) => {
      if (variant) return item.productId === productId && item.variant === variant;
      return item.productId === productId;
    });

    if (itemIndex >= 0) {
      if (qty <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = qty;
      }
      this.saveItems(items);
    }

    return this.getCartSummary();
  }

  removeItem(productId, variant = null) {
    let items = this.getRawItems();
    items = items.filter((item) => {
      if (variant) return !(item.productId === productId && item.variant === variant);
      return item.productId !== productId;
    });
    this.saveItems(items);
    return this.getCartSummary();
  }

  clearCart() {
    this.saveItems([]);
    return this.getCartSummary();
  }

  getCartSummary() {
    const rawItems = this.getRawItems();
    let totalUnits = 0;
    let subtotalCents = 0;

    const validatedItems = rawItems.map((item) => {
      // Re-validate unit price against authoritative catalog to prevent stale/tampered prices
      const catalogItem = CATALOG[item.productId];
      const unitPrice = catalogItem ? catalogItem.price : (item.unitPrice || 0);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineSubtotalCents = Math.round(unitPrice * 100) * qty;

      totalUnits += qty;
      subtotalCents += lineSubtotalCents;

      return {
        productId: item.productId,
        name: catalogItem ? catalogItem.name : item.name,
        variant: item.variant || (catalogItem ? catalogItem.defaultVariant : ''),
        unitPrice: unitPrice,
        quantity: qty,
        lineSubtotal: lineSubtotalCents / 100,
        imageType: catalogItem ? catalogItem.imageType : (item.imageType || 'headphones'),
        pastelColor: catalogItem ? catalogItem.pastelColor : '#87CEEB',
        accentColor: catalogItem ? catalogItem.accentColor : '#0284c7'
      };
    });

    const subtotal = subtotalCents / 100;
    const shipping = subtotal > 0 ? 0.00 : 0.00; // Free express shipping policy
    const taxCents = subtotal > 0 ? Math.round(subtotalCents * TAX_RATE) : 0;
    const tax = taxCents / 100;
    const grandTotal = (subtotalCents + Math.round(shipping * 100) + taxCents) / 100;

    return {
      items: validatedItems,
      totalUnits,
      subtotal,
      shipping,
      tax,
      grandTotal,
      taxRatePercent: 8.5
    };
  }
}

function renderProductSvg(imageType, size = 32, strokeColor = 'currentColor') {
  switch (imageType) {
    case 'headphones':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
      </svg>`;
    case 'dock':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>`;
    case 'keyboard':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"></path>
      </svg>`;
    case 'backpack':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path>
      </svg>`;
    case 'mouse':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="7"></rect>
        <line x1="12" y1="6" x2="12" y2="10"></line>
      </svg>`;
    case 'mat':
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
        <path d="M7 15h10"></path>
      </svg>`;
  }
}

// Instantiate singleton
const cartInstance = new CartEngine();

if (typeof window !== 'undefined') {
  window.TCCart = cartInstance;
  window.TCCATALOG = CATALOG;
  window.TCRenderIcon = renderProductSvg;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CartEngine, CATALOG, renderProductSvg };
}
