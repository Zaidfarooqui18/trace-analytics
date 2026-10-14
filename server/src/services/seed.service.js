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
  { tag: 'button', id: 'add-to-cart-btn', class: 'btn-primary', text: 'Add to Bag — $299', selector: 'div.action-row > button#add-to-cart-btn' },
  { tag: 'a', id: 'hero-cta-btn', class: 'btn-primary', text: 'Explore Aura Studio ($299)', selector: 'div.hero-actions > a#hero-cta-btn' },
  { tag: 'button', id: 'filter-audio', class: 'chip active', text: 'Wireless Audio', selector: 'div.filter-bar > button#filter-audio' },
  { tag: 'button', id: 'place-order-btn', class: 'btn-primary', text: 'Place Order • $324.50', selector: 'div.checkout-card > button#place-order-btn' },
  { tag: 'button', id: 'swatch-black', class: 'swatch', text: 'Matte Black', selector: 'div.swatches > button#swatch-black' },
  { tag: 'a', id: 'nav-products', class: 'nav-link', text: 'Products', selector: 'ul.nav-links > li > a#nav-products' },
  { tag: 'button', id: 'qty-plus', class: 'qty-btn', text: '+', selector: 'div.qty-control > button#qty-plus' },
  { tag: 'div', id: 'card-aura-headphone', class: 'card', text: 'Aura Studio Wireless', selector: 'div.grid > div#card-aura-headphone' },
];

export async function generateDemoSeedData(sessionCount = 20) {
  const events = [];
  const now = Date.now();

  for (let s = 0; s < sessionCount; s++) {
    const sessionId = crypto.randomUUID();
    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    const daysAgo = Math.random() * 6;
    const sessionStartTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000);
    let currentTime = new Date(sessionStartTime.getTime());

    const isMobile = device.type === 'mobile';
    const vw = isMobile ? 390 : 1440;
    const vh = isMobile ? 844 : 900;
    const dw = vw;
    const dh = isMobile ? 2200 : 1600;

    const pagesToVisit = Math.floor(Math.random() * 4) + 1;
    const visitedPages = PAGES.slice(0, pagesToVisit);
    const hasRageClick = Math.random() < 0.3;

    for (let p = 0; p < visitedPages.length; p++) {
      const page = visitedPages[p];

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

      const clickCount = Math.floor(Math.random() * 5) + 2;
      for (let c = 0; c < clickCount; c++) {
        currentTime = new Date(currentTime.getTime() + (Math.random() * 15 + 2) * 1000);

        const zone = Math.random();
        let normX, normY;

        if (zone < 0.3) {
          normX = 0.15 + Math.random() * 0.7;
          normY = 0.05 + Math.random() * 0.12;
        } else if (zone < 0.7) {
          normX = 0.45 + Math.random() * 0.35;
          normY = 0.25 + Math.random() * 0.25;
        } else {
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

      currentTime = new Date(currentTime.getTime() + (Math.random() * 20 + 5) * 1000);
    }
  }

  await Event.insertMany(events);
  return { sessionCount, eventCount: events.length };
}
