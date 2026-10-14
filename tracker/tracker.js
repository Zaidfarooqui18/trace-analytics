/**
 * Trace Analytics Tracker (CausalFunnel)
 * Lightweight, zero-dependency, embeddable user interaction tracker.
 * Size: < 3KB minified.
 */
(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__CF_TRACKER_INITIALIZED__) return;
  window.__CF_TRACKER_INITIALIZED__ = true;

  try {
    // Read configuration from script tag attributes
    var currentScript =
      document.currentScript ||
      document.querySelector('script[data-api]') ||
      document.querySelector('script[src*="tracker.js"]');

    var apiBaseUrl =
      (currentScript &&
        (currentScript.getAttribute('data-api') ||
          currentScript.getAttribute('data-api-base-url'))) ||
      '';
    // If not specified, default to origin or fallback to localhost:5000
    if (!apiBaseUrl) {
      apiBaseUrl = window.location.origin.includes(':3001')
        ? 'http://localhost:5000'
        : window.location.origin;
    }
    // Remove trailing slash
    apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');

    var respectDnt = currentScript && currentScript.getAttribute('data-dnt') === 'true';
    if (respectDnt && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
      if (window.console && console.info) {
        console.info('[Trace Analytics] Do Not Track enabled. Tracking disabled.');
      }
      return;
    }

    var SESSION_KEY = 'cf_analytics_session_id';
    var LAST_ACTIVE_KEY = 'cf_analytics_last_active';
    var QUEUE_KEY = 'cf_analytics_retry_queue';
    var SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    var BATCH_INTERVAL_MS = 1500; // Batch flush every 1.5s
    var MAX_RETRY_QUEUE = 50;

    var eventBatch = [];
    var flushTimer = null;

    // Safe UUID Generator
    function generateUUID() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        try {
          return crypto.randomUUID();
        } catch (e) {}
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    // Safe Storage Helper
    var storage = {
      get: function (key) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      },
      set: function (key, val) {
        try {
          localStorage.setItem(key, val);
        } catch (e) {}
      },
      remove: function (key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      }
    };

    // Session Management with 30-min inactivity expiry
    function getSessionId() {
      var now = Date.now();
      var sessionId = storage.get(SESSION_KEY);
      var lastActive = parseInt(storage.get(LAST_ACTIVE_KEY) || '0', 10);

      if (!sessionId || !lastActive || now - lastActive > SESSION_TIMEOUT_MS) {
        sessionId = generateUUID();
        storage.set(SESSION_KEY, sessionId);
      }
      storage.set(LAST_ACTIVE_KEY, now.toString());
      return sessionId;
    }

    function touchSession() {
      storage.set(LAST_ACTIVE_KEY, Date.now().toString());
    }

    // Device & Browser Detection
    function detectDevice() {
      var ua = navigator.userAgent || '';
      var type = 'desktop';
      if (/tablet|ipad|playbook|silk/i.test(ua)) {
        type = 'tablet';
      } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) {
        type = 'mobile';
      }

      var browser = 'Other';
      if (/Chrome|CriOS/i.test(ua) && !/Edge|Edg|OPR/i.test(ua)) browser = 'Chrome';
      else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) browser = 'Safari';
      else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
      else if (/Edg/i.test(ua)) browser = 'Edge';
      else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

      var os = 'Other';
      if (/Windows/i.test(ua)) os = 'Windows';
      else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
      else if (/Linux/i.test(ua)) os = 'Linux';
      else if (/Android/i.test(ua)) os = 'Android';
      else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

      return { type: type, browser: browser, os: os };
    }

    var cachedDevice = detectDevice();

    // Canonical URL normalization (excludes sensitive query params/hash by default)
    function getCanonicalUrl() {
      try {
        var loc = window.location;
        return loc.origin + loc.pathname;
      } catch (e) {
        return window.location.href;
      }
    }

    // Safe Element Selector & Label Builder
    function getElementDescriptor(el) {
      if (!el || el === document || el === window) return null;
      try {
        var tag = (el.tagName || '').toLowerCase();
        var id = el.id ? '#' + el.id : '';
        var className =
          typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : '';
        var text = (el.innerText || el.textContent || el.value || '')
          .trim()
          .slice(0, 40)
          .replace(/[\n\r\t]+/g, ' ');

        // CSS Selector path (up to 3 levels)
        var path = [];
        var curr = el;
        while (curr && curr.nodeType === 1 && path.length < 3) {
          var part = (curr.tagName || '').toLowerCase();
          if (curr.id) {
            part += '#' + curr.id;
            path.unshift(part);
            break;
          }
          path.unshift(part);
          curr = curr.parentElement;
        }

        return {
          tag: tag,
          id: el.id || '',
          class: typeof el.className === 'string' ? el.className.slice(0, 100) : '',
          text: text,
          selector: path.join(' > ')
        };
      } catch (e) {
        return null;
      }
    }

    // Rage Click Detection (3+ clicks within 1000ms within 30px)
    var recentClicks = [];
    function checkRageClick(x, y, time) {
      recentClicks = recentClicks.filter(function (c) {
        return time - c.time < 1000;
      });
      recentClicks.push({ x: x, y: y, time: time });
      if (recentClicks.length >= 3) {
        var maxDist = 0;
        for (var i = 0; i < recentClicks.length; i++) {
          for (var j = i + 1; j < recentClicks.length; j++) {
            var dx = recentClicks[i].x - recentClicks[j].x;
            var dy = recentClicks[i].y - recentClicks[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDist) maxDist = dist;
          }
        }
        if (maxDist <= 35) {
          return true;
        }
      }
      return false;
    }

    // Event Dispatcher & Batch Queue
    function queueEvent(eventData) {
      touchSession();
      eventBatch.push(eventData);

      if (!flushTimer) {
        flushTimer = setTimeout(flushEvents, BATCH_INTERVAL_MS);
      }
    }

    function flushEvents() {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }

      if (eventBatch.length === 0) return;

      var eventsToSend = eventBatch.slice();
      eventBatch = [];

      // Check for any previously stored offline retry events
      var storedQueue = [];
      try {
        var raw = storage.get(QUEUE_KEY);
        if (raw) storedQueue = JSON.parse(raw);
      } catch (e) {}

      var allEvents = storedQueue.concat(eventsToSend);
      // Cap max queue
      if (allEvents.length > MAX_RETRY_QUEUE) {
        allEvents = allEvents.slice(allEvents.length - MAX_RETRY_QUEUE);
      }

      var payload = JSON.stringify(allEvents);
      var endpoint = apiBaseUrl + '/api/events';

      // 1. Try navigator.sendBeacon
      var sent = false;
      if (typeof navigator.sendBeacon === 'function') {
        try {
          var blob = new Blob([payload], { type: 'application/json' });
          sent = navigator.sendBeacon(endpoint, blob);
        } catch (e) {
          sent = false;
        }
      }

      // 2. Fallback to fetch with keepalive: true
      if (!sent) {
        try {
          fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          })
            .then(function (res) {
              if (res.ok) {
                storage.remove(QUEUE_KEY);
              } else {
                saveRetryQueue(allEvents);
              }
            })
            .catch(function () {
              saveRetryQueue(allEvents);
            });
        } catch (e) {
          saveRetryQueue(allEvents);
        }
      } else {
        storage.remove(QUEUE_KEY);
      }
    }

    function saveRetryQueue(events) {
      try {
        storage.set(QUEUE_KEY, JSON.stringify(events.slice(-MAX_RETRY_QUEUE)));
      } catch (e) {}
    }

    // Base Event Builder
    function createBaseEvent(eventType) {
      var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      var dw = Math.max(
        document.body.scrollWidth || 0,
        document.documentElement.scrollWidth || 0,
        vw
      );
      var dh = Math.max(
        document.body.scrollHeight || 0,
        document.documentElement.scrollHeight || 0,
        vh
      );

      return {
        event_id: generateUUID(),
        session_id: getSessionId(),
        event_type: eventType,
        page_url: getCanonicalUrl(),
        page_path: window.location.pathname || '/',
        page_title: document.title || '',
        timestamp: new Date().toISOString(),
        viewport_width: vw,
        viewport_height: vh,
        document_width: dw,
        document_height: dh,
        device: cachedDevice,
        referrer: document.referrer || '',
        user_agent: navigator.userAgent || ''
      };
    }

    // Page View Tracker
    var lastRecordedPath = null;
    function trackPageView() {
      var currentPath = window.location.pathname;
      // Prevent rapid duplicate page views on identical path within 500ms
      if (lastRecordedPath === currentPath && Date.now() - (window.__lastPvTime || 0) < 500) {
        return;
      }
      window.__lastPvTime = Date.now();
      lastRecordedPath = currentPath;

      var event = createBaseEvent('page_view');
      queueEvent(event);
    }

    // Click Tracker
    function handleClick(e) {
      try {
        var now = Date.now();
        var clientX = typeof e.clientX === 'number' ? e.clientX : 0;
        var clientY = typeof e.clientY === 'number' ? e.clientY : 0;
        var scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

        var pageX = typeof e.pageX === 'number' ? e.pageX : clientX + scrollX;
        var pageY = typeof e.pageY === 'number' ? e.pageY : clientY + scrollY;

        var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        var dw = Math.max(
          document.body.scrollWidth || 0,
          document.documentElement.scrollWidth || 0,
          vw
        );
        var dh = Math.max(
          document.body.scrollHeight || 0,
          document.documentElement.scrollHeight || 0,
          vh
        );

        // Normalized coordinates (0.0 to 1.0)
        // Normalized against document dimensions so heatmaps match page layout regardless of window size
        var normX = dw > 0 ? Math.min(Math.max(pageX / dw, 0), 1) : 0;
        var normY = dh > 0 ? Math.min(Math.max(pageY / dh, 0), 1) : 0;

        var isRageClick = checkRageClick(pageX, pageY, now);
        var targetInfo = getElementDescriptor(e.target);

        var event = createBaseEvent('click');
        event.x = clientX;
        event.y = clientY;
        event.page_x = pageX;
        event.page_y = pageY;
        event.scroll_x = scrollX;
        event.scroll_y = scrollY;
        event.normalized_x = parseFloat(normX.toFixed(4));
        event.normalized_y = parseFloat(normY.toFixed(4));
        event.is_rage_click = isRageClick;
        event.target = targetInfo;

        queueEvent(event);
      } catch (err) {}
    }

    // Bind Event Listeners
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      trackPageView();
    } else {
      window.addEventListener('DOMContentLoaded', trackPageView);
    }

    window.addEventListener('click', handleClick, { passive: true, capture: true });

    // SPA Navigation Detection: wrap history.pushState & replaceState, listen to popstate
    function wrapHistoryMethod(method) {
      var original = window.history[method];
      if (typeof original === 'function') {
        window.history[method] = function () {
          var result = original.apply(this, arguments);
          setTimeout(trackPageView, 50);
          return result;
        };
      }
    }
    wrapHistoryMethod('pushState');
    wrapHistoryMethod('replaceState');
    window.addEventListener('popstate', function () {
      setTimeout(trackPageView, 50);
    });

    // Flush batch when leaving page
    window.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        flushEvents();
      }
    });
    window.addEventListener('pagehide', flushEvents);
    window.addEventListener('beforeunload', flushEvents);

    // Global Public API for custom events
    window.CFTracker = {
      version: '1.0.0',
      track: function (customType, customProps) {
        try {
          var event = createBaseEvent(customType || 'custom');
          if (customProps && typeof customProps === 'object') {
            for (var k in customProps) {
              if (Object.prototype.hasOwnProperty.call(customProps, k)) {
                event[k] = customProps[k];
              }
            }
          }
          queueEvent(event);
        } catch (e) {}
      },
      flush: flushEvents,
      getSessionId: getSessionId
    };
  } catch (err) {
    if (window.console && console.warn) {
      console.warn('[Trace Analytics Tracker Error]', err);
    }
  }
})();
