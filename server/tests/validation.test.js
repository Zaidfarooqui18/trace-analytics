import { describe, it, expect } from 'vitest';
import { EventIngestSchema } from '../src/validators/event.validator.js';

describe('EventIngestSchema', () => {
  it('validates a valid page_view event', () => {
    const payload = {
      session_id: 'test-session-123',
      event_type: 'page_view',
      page_url: 'https://myshop.com/products?ref=ad',
      timestamp: new Date().toISOString(),
      viewport_width: 1440,
      viewport_height: 900,
    };

    const res = EventIngestSchema.safeParse(payload);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.session_id).toBe('test-session-123');
      expect(res.data.page_url).toBe('https://myshop.com/products'); // query stripped
      expect(res.data.event_id).toBeDefined(); // auto generated if missing
    }
  });

  it('validates a valid click event with coordinates', () => {
    const payload = {
      event_id: 'evt-12345',
      session_id: 'test-session-123',
      event_type: 'click',
      page_url: 'https://myshop.com/product.html',
      timestamp: new Date().toISOString(),
      x: 350,
      y: 420,
      normalized_x: 0.243,
      normalized_y: 0.467,
    };

    const res = EventIngestSchema.safeParse(payload);
    expect(res.success).toBe(true);
  });

  it('rejects a click event missing coordinates', () => {
    const payload = {
      session_id: 'test-session-123',
      event_type: 'click',
      page_url: 'https://myshop.com/product.html',
      timestamp: new Date().toISOString(),
    };

    const res = EventIngestSchema.safeParse(payload);
    expect(res.success).toBe(false);
  });

  it('rejects an invalid timestamp', () => {
    const payload = {
      session_id: 'test-session-123',
      event_type: 'page_view',
      page_url: 'https://myshop.com',
      timestamp: 'not-a-date',
    };

    const res = EventIngestSchema.safeParse(payload);
    expect(res.success).toBe(false);
  });

  it('accepts a batch array of events', () => {
    const batch = [
      {
        session_id: 's-1',
        event_type: 'page_view',
        page_url: 'https://myshop.com',
        timestamp: new Date().toISOString(),
      },
      {
        session_id: 's-1',
        event_type: 'click',
        page_url: 'https://myshop.com',
        timestamp: new Date().toISOString(),
        x: 100,
        y: 200,
      },
    ];

    const res = EventIngestSchema.safeParse(batch);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBe(2);
    }
  });
});
