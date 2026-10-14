import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

const BASE_URL = 'http://localhost:5000';

describe('Sessions API and CSV Export Integration Tests', () => {
  const now = Date.now();
  const SESS_1 = 'session-uuid-desktop-0001';
  const SESS_2 = 'session-uuid-mobile-0002';
  const SESS_3 = 'session-uuid-tablet-0003';

  beforeAll(async () => {
    // Session 1: Recent (2 hours ago), Desktop, Windows, 1 page_view, 2 clicks
    const t1 = new Date(now - 2 * 60 * 60 * 1000);
    const t1_end = new Date(t1.getTime() + 30 * 1000);

    // Session 2: 3 days ago, Mobile, iOS, 2 page_views, 2 clicks
    const t2 = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const t2_end = new Date(t2.getTime() + 120 * 1000);

    // Session 3: 15 days ago, Tablet, Android, 1 page_view, 0 clicks
    const t3 = new Date(now - 15 * 24 * 60 * 60 * 1000);

    const testEvents = [
      // Session 1 events
      {
        event_id: 'evt-1-pv',
        session_id: SESS_1,
        event_type: 'page_view',
        page_url: 'http://localhost:3001/index.html',
        page_path: '/index.html',
        page_title: 'Home',
        timestamp: t1.toISOString(),
        device: { type: 'desktop', browser: 'Chrome', os: 'Windows' },
        viewport_width: 1440,
        viewport_height: 900,
        document_width: 1440,
        document_height: 1800,
      },
      {
        event_id: 'evt-1-c1',
        session_id: SESS_1,
        event_type: 'click',
        page_url: 'http://localhost:3001/index.html',
        page_path: '/index.html',
        timestamp: new Date(t1.getTime() + 10 * 1000).toISOString(),
        x: 100,
        y: 200,
        page_x: 100,
        page_y: 200,
        device: { type: 'desktop', browser: 'Chrome', os: 'Windows' },
      },
      {
        event_id: 'evt-1-c2',
        session_id: SESS_1,
        event_type: 'click',
        page_url: 'http://localhost:3001/index.html',
        page_path: '/index.html',
        timestamp: t1_end.toISOString(),
        x: 150,
        y: 250,
        page_x: 150,
        page_y: 250,
        device: { type: 'desktop', browser: 'Chrome', os: 'Windows' },
      },

      // Session 2 events
      {
        event_id: 'evt-2-pv1',
        session_id: SESS_2,
        event_type: 'page_view',
        page_url: 'http://localhost:3001/products.html',
        page_path: '/products.html',
        page_title: 'Catalog',
        timestamp: t2.toISOString(),
        device: { type: 'mobile', browser: 'Safari', os: 'iOS' },
        viewport_width: 390,
        viewport_height: 844,
        document_width: 390,
        document_height: 2200,
      },
      {
        event_id: 'evt-2-c1',
        session_id: SESS_2,
        event_type: 'click',
        page_url: 'http://localhost:3001/products.html',
        page_path: '/products.html',
        timestamp: new Date(t2.getTime() + 30 * 1000).toISOString(),
        x: 50,
        y: 100,
        page_x: 50,
        page_y: 100,
        device: { type: 'mobile', browser: 'Safari', os: 'iOS' },
      },
      {
        event_id: 'evt-2-pv2',
        session_id: SESS_2,
        event_type: 'page_view',
        page_url: 'http://localhost:3001/product.html',
        page_path: '/product.html',
        page_title: 'Product Details',
        timestamp: new Date(t2.getTime() + 60 * 1000).toISOString(),
        device: { type: 'mobile', browser: 'Safari', os: 'iOS' },
        viewport_width: 390,
        viewport_height: 844,
        document_width: 390,
        document_height: 2200,
      },
      {
        event_id: 'evt-2-c2',
        session_id: SESS_2,
        event_type: 'click',
        page_url: 'http://localhost:3001/product.html',
        page_path: '/product.html',
        timestamp: t2_end.toISOString(),
        x: 60,
        y: 110,
        page_x: 60,
        page_y: 110,
        device: { type: 'mobile', browser: 'Safari', os: 'iOS' },
      },

      // Session 3 events
      {
        event_id: 'evt-3-pv',
        session_id: SESS_3,
        event_type: 'page_view',
        page_url: 'http://localhost:3001/checkout.html',
        page_path: '/checkout.html',
        page_title: 'Checkout',
        timestamp: t3.toISOString(),
        device: { type: 'tablet', browser: 'Chrome', os: 'Android' },
        viewport_width: 768,
        viewport_height: 1024,
        document_width: 768,
        document_height: 1500,
      },
    ];

    // Ingest events into running database
    await request(BASE_URL)
      .post('/api/events')
      .send(testEvents)
      .expect(201);
  });

  describe('1. Sessions Aggregation & Schema Contracts', () => {
    it('aggregates events into sessions with correct counts and response envelope', async () => {
      const res = await request(BASE_URL).get('/api/sessions').expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);

      const sess1 = res.body.sessions.find((s) => s.session_id === SESS_1);
      expect(sess1).toBeDefined();
      expect(sess1.total_events).toBe(3);
      expect(sess1.page_view_count).toBe(1);
      expect(sess1.click_count).toBe(2);
      expect(sess1.entry_page).toBe('/index.html');
      expect(sess1.device.type).toBe('desktop');
      expect(sess1.device.os).toBe('Windows');
      expect(sess1.duration_ms).toBe(30000);

      const sess2 = res.body.sessions.find((s) => s.session_id === SESS_2);
      expect(sess2).toBeDefined();
      expect(sess2.total_events).toBe(4);
      expect(sess2.page_view_count).toBe(2);
      expect(sess2.click_count).toBe(2);
      expect(sess2.entry_page).toBe('/products.html');
      expect(sess2.device.type).toBe('mobile');
      expect(sess2.device.os).toBe('iOS');
      expect(sess2.duration_ms).toBe(120000);
    });
  });

  describe('2. Date Filtering', () => {
    it('filters correctly for 24-hour range', async () => {
      const startDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const res = await request(BASE_URL)
        .get(`/api/sessions?startDate=${encodeURIComponent(startDate)}&search=${SESS_1}`)
        .expect(200);

      expect(res.body.pagination.total).toBe(1);
      expect(res.body.sessions[0].session_id).toBe(SESS_1);
    });

    it('filters correctly for 7-day range', async () => {
      const startDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(BASE_URL)
        .get(`/api/sessions?startDate=${encodeURIComponent(startDate)}&search=session-uuid`)
        .expect(200);

      const sessionIds = res.body.sessions.map((s) => s.session_id);
      expect(sessionIds).toContain(SESS_1);
      expect(sessionIds).toContain(SESS_2);
      expect(sessionIds).not.toContain(SESS_3);
    });

    it('returns all sessions including 15-day-old session when no date range is passed', async () => {
      const res = await request(BASE_URL)
        .get('/api/sessions?search=session-uuid')
        .expect(200);

      const sessionIds = res.body.sessions.map((s) => s.session_id);
      expect(sessionIds).toContain(SESS_1);
      expect(sessionIds).toContain(SESS_2);
      expect(sessionIds).toContain(SESS_3);
    });
  });

  describe('3. Search and Device Filtering', () => {
    it('filters by session UUID substring', async () => {
      const res = await request(BASE_URL)
        .get('/api/sessions?search=mobile-0002')
        .expect(200);

      expect(res.body.pagination.total).toBe(1);
      expect(res.body.sessions[0].session_id).toBe(SESS_2);
    });

    it('returns 0 results for non-matching search without throwing errors', async () => {
      const res = await request(BASE_URL)
        .get('/api/sessions?search=non-existent-xyz-999')
        .expect(200);

      expect(res.body.pagination.total).toBe(0);
      expect(res.body.sessions.length).toBe(0);
    });

    it('filters by device type', async () => {
      const desktopRes = await request(BASE_URL)
        .get(`/api/sessions?device=desktop&search=${SESS_1}`)
        .expect(200);
      expect(desktopRes.body.pagination.total).toBe(1);
      expect(desktopRes.body.sessions[0].session_id).toBe(SESS_1);

      const mobileRes = await request(BASE_URL)
        .get(`/api/sessions?device=mobile&search=${SESS_2}`)
        .expect(200);
      expect(mobileRes.body.pagination.total).toBe(1);
      expect(mobileRes.body.sessions[0].session_id).toBe(SESS_2);
    });
  });

  describe('4. Sorting and Pagination', () => {
    it('paginates results accurately', async () => {
      const page1Res = await request(BASE_URL)
        .get('/api/sessions?limit=1&page=1')
        .expect(200);

      expect(page1Res.body.pagination.total).toBeGreaterThanOrEqual(3);
      expect(page1Res.body.pagination.page).toBe(1);
      expect(page1Res.body.sessions.length).toBe(1);

      const page2Res = await request(BASE_URL)
        .get('/api/sessions?limit=1&page=2')
        .expect(200);
      expect(page2Res.body.sessions.length).toBe(1);
      expect(page2Res.body.sessions[0].session_id).not.toBe(
        page1Res.body.sessions[0].session_id
      );
    });
  });

  describe('5. CSV Export Endpoint (/api/sessions/export)', () => {
    it('returns valid CSV with headers, UTF-8 BOM, and Content-Disposition', async () => {
      const res = await request(BASE_URL)
        .get('/api/sessions/export')
        .expect(200)
        .expect('Content-Type', /text\/csv/);

      expect(res.headers['content-disposition']).toMatch(
        /attachment; filename="trace-analytics-sessions-\d{4}-\d{2}-\d{2}\.csv"/
      );

      // Verify UTF-8 BOM prefix
      expect(res.text.startsWith('\uFEFF')).toBe(true);

      const cleanText = res.text.replace(/^\uFEFF/, '').trim();
      const lines = cleanText.split(/\r?\n/);

      expect(lines[0]).toBe(
        'session_id,first_seen,last_active,duration_seconds,total_events,page_views,clicks,entry_page,device,operating_system'
      );

      // Verify row values for SESS_1
      const sess1Line = lines.find((l) => l.includes(SESS_1));
      expect(sess1Line).toBeDefined();
      expect(sess1Line).toContain('/index.html');
      expect(sess1Line).toContain('desktop');
      expect(sess1Line).toContain('Windows');
      expect(sess1Line).toContain(',30,3,1,2,'); // duration=30s, events=3, pv=1, clicks=2
    });

    it('honors active filters and exports all matching records', async () => {
      // Export with mobile device filter and search
      const mobileRes = await request(BASE_URL)
        .get(`/api/sessions/export?device=mobile&search=${SESS_2}`)
        .expect(200);

      const mobileLines = mobileRes.text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
      expect(mobileLines.length).toBe(2); // 1 header + 1 session
      expect(mobileLines[1]).toContain(SESS_2);
    });

    it('returns a clean header-only CSV when no sessions match filter', async () => {
      const res = await request(BASE_URL)
        .get('/api/sessions/export?search=non-existent-uuid-xyz-404')
        .expect(200);

      const cleanText = res.text.replace(/^\uFEFF/, '').trim();
      const lines = cleanText.split(/\r?\n/);
      expect(lines.length).toBe(1);
      expect(lines[0]).toBe(
        'session_id,first_seen,last_active,duration_seconds,total_events,page_views,clicks,entry_page,device,operating_system'
      );
    });

    it('properly escapes values with commas and double quotes in CSV', async () => {
      const specialSessionId = 'sess-special-"quote",comma-test';
      await request(BASE_URL)
        .post('/api/events')
        .send({
          event_id: 'evt-special-escape-1',
          session_id: specialSessionId,
          event_type: 'page_view',
          page_url: 'http://localhost:3001/special,path.html',
          page_path: '/special,path.html',
          timestamp: new Date().toISOString(),
          viewport_width: 1440,
          viewport_height: 900,
        })
        .expect(201);

      const res = await request(BASE_URL)
        .get(`/api/sessions/export?search=${encodeURIComponent('sess-special')}`)
        .expect(200);

      const cleanText = res.text.replace(/^\uFEFF/, '').trim();
      const lines = cleanText.split(/\r?\n/);
      expect(lines.length).toBe(2);
      expect(lines[1]).toContain('"sess-special-""quote"",comma-test"');
      expect(lines[1]).toContain('"/special,path.html"');
    });
  });
});
