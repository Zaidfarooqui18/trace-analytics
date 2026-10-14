import { describe, it, expect } from 'vitest';
import { normalizeCanonicalUrl } from '../src/utils/url.js';

describe('normalizeCanonicalUrl', () => {
  it('removes query parameters and fragments', () => {
    const raw = 'https://example.com/products/headphones?utm_source=google&token=secret#reviews';
    const normalized = normalizeCanonicalUrl(raw);
    expect(normalized).toBe('https://example.com/products/headphones');
  });

  it('removes trailing slashes from path', () => {
    const raw = 'https://example.com/checkout/';
    const normalized = normalizeCanonicalUrl(raw);
    expect(normalized).toBe('https://example.com/checkout');
  });

  it('preserves root path slash', () => {
    const raw = 'https://example.com/';
    const normalized = normalizeCanonicalUrl(raw);
    expect(normalized).toBe('https://example.com/');
  });

  it('lowercases hostname but preserves case of pathname', () => {
    const raw = 'https://EXAMPLE.COM/Shop/Item123';
    const normalized = normalizeCanonicalUrl(raw);
    expect(normalized).toBe('https://example.com/Shop/Item123');
  });

  it('handles relative paths gracefully', () => {
    const raw = '/products?color=blue';
    const normalized = normalizeCanonicalUrl(raw);
    expect(normalized).toBe('/products');
  });
});
