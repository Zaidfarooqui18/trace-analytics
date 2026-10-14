import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { CartEngine, CATALOG } = require('../../demo/cart.js');

describe('Trace Commerce Cart Engine', () => {
  let cart;
  let mockStorage;

  beforeEach(() => {
    const store = {};
    mockStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    };
    cart = new CartEngine(mockStorage);
  });

  it('Scenario A: Starts with empty cart, adds one product', () => {
    const emptySummary = cart.getCartSummary();
    expect(emptySummary.totalUnits).toBe(0);
    expect(emptySummary.items.length).toBe(0);
    expect(emptySummary.grandTotal).toBe(0);

    const summary = cart.addItem('aura-studio-wireless', 1);
    expect(summary.totalUnits).toBe(1);
    expect(summary.items.length).toBe(1);
    expect(summary.items[0].productId).toBe('aura-studio-wireless');
    expect(summary.items[0].quantity).toBe(1);
    expect(summary.items[0].unitPrice).toBe(299.00);
    expect(summary.subtotal).toBe(299.00);
    expect(summary.tax).toBe(25.42); // 299 * 0.085 = 25.415 -> 25.42
    expect(summary.grandTotal).toBe(324.42);
  });

  it('Scenario B: Adds the same product twice', () => {
    cart.addItem('aura-studio-wireless', 1);
    const summary = cart.addItem('aura-studio-wireless', 1);

    expect(summary.totalUnits).toBe(2);
    expect(summary.items.length).toBe(1); // exactly one line item
    expect(summary.items[0].quantity).toBe(2);
    expect(summary.items[0].lineSubtotal).toBe(598.00);
    expect(summary.subtotal).toBe(598.00);
  });

  it('Scenario C: Adds multiple distinct products', () => {
    cart.addItem('aura-studio-wireless', 2); // 299 * 2 = 598
    const summary = cart.addItem('orbit-mouse', 3); // 99 * 3 = 297

    expect(summary.totalUnits).toBe(5); // 2 + 3 = 5
    expect(summary.items.length).toBe(2);
    expect(summary.items[0].lineSubtotal).toBe(598.00);
    expect(summary.items[1].lineSubtotal).toBe(297.00);
    expect(summary.subtotal).toBe(895.00);
  });

  it('Scenario D: Increases and decreases quantity', () => {
    cart.addItem('pulse-keyboard', 1); // 165
    let summary = cart.updateQuantity('pulse-keyboard', 3);

    expect(summary.totalUnits).toBe(3);
    expect(summary.items[0].quantity).toBe(3);
    expect(summary.subtotal).toBe(495.00);

    summary = cart.updateQuantity('pulse-keyboard', 2);
    expect(summary.totalUnits).toBe(2);
    expect(summary.items[0].quantity).toBe(2);
    expect(summary.subtotal).toBe(330.00);
  });

  it('Scenario E: Removes an item preserving others', () => {
    cart.addItem('aura-studio-wireless', 1);
    cart.addItem('lumina-dock', 1);
    let summary = cart.getCartSummary();
    expect(summary.items.length).toBe(2);
    expect(summary.totalUnits).toBe(2);

    summary = cart.removeItem('aura-studio-wireless');
    expect(summary.items.length).toBe(1);
    expect(summary.items[0].productId).toBe('lumina-dock');
    expect(summary.totalUnits).toBe(1);
    expect(summary.subtotal).toBe(189.00);
  });

  it('Scenario F: Persistence across new engine instances with same storage', () => {
    cart.addItem('nomad-pack', 2);

    // New instance reading from same mock storage
    const cart2 = new CartEngine(mockStorage);
    const summary = cart2.getCartSummary();

    expect(summary.items.length).toBe(1);
    expect(summary.items[0].productId).toBe('nomad-pack');
    expect(summary.items[0].quantity).toBe(2);
    expect(summary.totalUnits).toBe(2);
    expect(summary.subtotal).toBe(290.00);
  });
});
