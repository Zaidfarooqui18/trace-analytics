import { connectDb, disconnectDb } from '../config/db.js';
import { Event } from '../models/Event.js';
import crypto from 'crypto';

const PAGES = [
  { url: 'http://localhost:3001/index.html', path: '/index.html', title: 'Trace Commerce — Minimalist Essentials' },
  { url: 'http://localhost:3001/products.html', path: '/products.html', title: 'Catalog & Collections — Trace Commerce' },
  { url: 'http://localhost:3001/product.html', path: '/product.html', title: 'Aura Studio Wireless Headphones — Trace Commerce' },
  { url: 'http://localhost:3001/checkout.html', path: '/checkout.html', title: 'Secure Checkout — Trace Commerce' },
];

const DEVICES = [
  { type: 'desktop', browser: 'Chrome', os: 'macOS' },
  { type: 'desktop', browser: 'Safari', os: 'macOS' },
  { type: 'desktop', browser: 'Firefox', os: 'Windows' },
  { type: 'desktop', browser: 'Chrome', os: 'Windows' },
  { type: 'mobile', browser: 'Safari', os: 'iOS' },
  { type: 'mobile', browser: 'Chrome', os: 'Android' },
  { type: 'tablet', browser: 'Safari', os: 'iOS' },
];

const BUTTON_TARGETS = [
  { tag: 'button', id: 'add-to-cart-btn', class: 'btn-primary', text: 'Add to Cart — $299', selector: 'div.product-actions > button#add-to-cart-btn' },
  { tag: 'a', id: 'shop-now-hero', class: 'cta-button', text: 'Explore Spring Collection', selector: 'section.hero > a#shop-now-hero' },
  { tag: 'button', id: 'filter-audio', class: 'chip active', text: 'Audio & Acoustics', selector: 'div.filter-bar > button.chip' },
  { tag: 'button', id: 'checkout-submit', class: 'btn-checkout', text: 'Pay $324.50 with Apple Pay', selector: 'form#checkout-form > button' },
  { tag: 'button', id: 'color-matte-black', class: 'color-swatch active', text: 'Matte Space Black', selector: 'div.swatches > button' },
  { tag: 'a', id: 'nav-products', class: 'nav-link', text: 'Products', selector: 'nav > a.nav-link' },
  { tag: 'button', id: 'qty-plus-btn', class: 'qty-btn', text: '+', selector: 'div.qty-control > button' },
  { tag: 'div', id: 'product-card-1', class: 'card-media', text: '', selector: 'div.grid > div.card' },
];

async function seed() {
  console.log('[Seed] Starting database seed...');
  await connectDb();

  // Clear existing events for fresh demo data
  const deleteCount = await Event.deleteMany({});
  console.log(`[Seed] Cleared ${deleteCount.deletedCount} existing events.`);

  const events = [];
  const now = Date.now();
  const sessionCount = 22;

  for (let s = 0; s < sessionCount; s++) {
    const sessionId = crypto.randomUUID();
    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    // Stagger sessions over past 6 days
    const daysAgo = Math.random() * 6;
    const sessionStartTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000);
    let currentTime = new Date(sessionStartTime.getTime());

    const isMobile = device.type === 'mobile';
    const vw = isMobile ? 390 : 1440;
    const vh = isMobile ? 844 : 900;
    const dw = vw;
    const dh = isMobile ? 2400 : 1800;

    // How many pages this session visits (1 to 4)
    const pagesToVisit = Math.floor(Math.random() * 4) + 1;
    const visitedPages = PAGES.slice(0, pagesToVisit);

    // Random chance of rage click in this session
    const hasRageClick = Math.random() < 0.25;

    for (let p = 0; p < visitedPages.length; p++) {
      const page = visitedPages[p];

      // Page view event
      events.push({
        event_id: crypto.randomUUID(),
        session_id: sessionId,
        event_type: 'page_view',
        page_url: page.url,
        page_path: page.path,
        page_title: page.title,
        timestamp: new Date(currentTime.getTime()),
        received_at: new Date(currentTime.getTime() + 100),
        viewport_width: vw,
        viewport_height: vh,
        document_width: dw,
        document_height: dh,
        device,
        referrer: p === 0 ? 'https://google.com/search' : visitedPages[p - 1].url,
        user_agent: `Mozilla/5.0 (${device.os}) AppleWebKit/537.36 (${device.browser})`,
      });

      // 2 to 6 clicks per page
      const clickCount = Math.floor(Math.random() * 5) + 2;
      for (let c = 0; c < clickCount; c++) {
        currentTime = new Date(currentTime.getTime() + (Math.random() * 15 + 2) * 1000);

        // Click coordinates concentrated in realistic zones
        // Header / Nav (top 15%), Main Hero/Actions (20-45%), Content items (50-80%)
        const zone = Math.random();
        let normX, normY;

        if (zone < 0.3) {
          // Navigation / Filters
          normX = 0.15 + Math.random() * 0.7;
          normY = 0.05 + Math.random() * 0.12;
        } else if (zone < 0.7) {
          // Primary CTAs (Add to cart, hero button)
          normX = 0.45 + Math.random() * 0.35;
          normY = 0.25 + Math.random() * 0.25;
        } else {
          // Product cards / Footer
          normX = 0.15 + Math.random() * 0.7;
          normY = 0.55 + Math.random() * 0.35;
        }

        const isThisRage = hasRageClick && p === visitedPages.length - 1 && c === clickCount - 1;
        const target = BUTTON_TARGETS[Math.floor(Math.random() * BUTTON_TARGETS.length)];

        const pageX = Math.round(normX * dw);
        const pageY = Math.round(normY * dh);
        const clientX = Math.min(pageX, vw);
        const clientY = Math.min(pageY % vh, vh);

        events.push({
          event_id: crypto.randomUUID(),
          session_id: sessionId,
          event_type: 'click',
          page_url: page.url,
          page_path: page.path,
          page_title: page.title,
          timestamp: new Date(currentTime.getTime()),
          received_at: new Date(currentTime.getTime() + 120),
          x: clientX,
          y: clientY,
          page_x: pageX,
          page_y: pageY,
          scroll_x: 0,
          scroll_y: Math.max(0, pageY - clientY),
          normalized_x: parseFloat(normX.toFixed(4)),
          normalized_y: parseFloat(normY.toFixed(4)),
          is_rage_click: isThisRage,
          viewport_width: vw,
          viewport_height: vh,
          document_width: dw,
          document_height: dh,
          target,
          device,
          user_agent: `Mozilla/5.0 (${device.os}) AppleWebKit/537.36 (${device.browser})`,
        });

        // If rage click, insert 2 more rapid clicks in identical spot
        if (isThisRage) {
          for (let r = 1; r <= 2; r++) {
            events.push({
              event_id: crypto.randomUUID(),
              session_id: sessionId,
              event_type: 'click',
              page_url: page.url,
              page_path: page.path,
              page_title: page.title,
              timestamp: new Date(currentTime.getTime() + r * 150),
              received_at: new Date(currentTime.getTime() + r * 150 + 100),
              x: clientX + (Math.random() * 4 - 2),
              y: clientY + (Math.random() * 4 - 2),
              page_x: pageX,
              page_y: pageY,
              scroll_x: 0,
              scroll_y: Math.max(0, pageY - clientY),
              normalized_x: parseFloat(normX.toFixed(4)),
              normalized_y: parseFloat(normY.toFixed(4)),
              is_rage_click: true,
              viewport_width: vw,
              viewport_height: vh,
              document_width: dw,
              document_height: dh,
              target,
              device,
              user_agent: `Mozilla/5.0 (${device.os}) AppleWebKit/537.36 (${device.browser})`,
            });
          }
        }
      }

      // Time gap before next page view
      currentTime = new Date(currentTime.getTime() + (Math.random() * 20 + 5) * 1000);
    }
  }

  await Event.insertMany(events);
  console.log(`[Seed] Successfully seeded ${events.length} realistic events across ${sessionCount} sessions!`);

  await disconnectDb();
  console.log('[Seed] Done.');
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
