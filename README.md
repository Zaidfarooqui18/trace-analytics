# Trace Analytics 🔍
> **Understand every user journey.**  
> A lightweight, privacy-focused, real-time user interaction analytics platform with session journey replays and coordinate-normalized click heatmaps.

Built as a submission for the **Full Stack Engineer Intern** role at **CausalFunnel**.

---

## 🌟 Executive Summary & Key Highlights

**Trace Analytics** enables e-commerce and web product teams to observe how visitors interact with web pages, what routes they navigate, what elements they click, and where friction or rage-clicks occur.

- **Zero-Dependency Tracker (`< 3 KB`)**: Standalone vanilla JS embeddable script with asynchronous `navigator.sendBeacon` batching, `fetch(keepalive)` fallback, and an offline `localStorage` retry queue.
- **Strict Data Integrity**: Every single chart, metric card, and heatmap point is derived directly from MongoDB records via aggregation pipelines—no fabricated statistics.
- **Interactive Chronological User Journeys**: Ordered visual event timelines displaying relative timestamps, click coordinates, target element selectors, and a step-by-step **Session Replay-Lite** animation player.
- **Coordinate-Normalized Visual Heatmaps**: Canvas-rendered heatmaps supporting **Heat Gradient Blobs**, **Point Dots**, and **Grid Density** modes. Normalized coordinates (`0.0 – 1.0`) guarantee that click dots scale responsively across varying screen resolutions.
- **Rage-Click Detection**: Automatic detection of frustration patterns (3+ rapid clicks within 1,000ms within a 35px radius) flagged in both session timelines and heatmaps.
- **Apple & Material 3 Inspired Design**: Clean typography (Inter), glassmorphism header, 8px grid, smooth dark/light mode toggle with system preference detection, and `Cmd/Ctrl + K` global command palette.
- **Zero-Friction Evaluation**: Connects out of the box to MongoDB Atlas or local MongoDB. If neither is running, it automatically falls back to an in-memory MongoDB instance so reviewers can test the application in seconds without configuration blockers!

---

## 🏗️ Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                              DEMO STORE                                │
│                   (http://localhost:3001)                              │
│   - Home (index.html)        - Products Catalog (products.html)       │
│   - Detail (product.html)    - Checkout (checkout.html)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tracks Page Views, Clicks, Rage Clicks
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT-SIDE TRACKER                             │
│                  public/tracker.js (< 3 KB)                            │
│  - 30-min Inactivity Expiry  - Canonical URL Normalization             │
│  - Normalized Coordinates    - Beacon Batching (1.5s debounce)        │
│  - Offline Retry Queue       - Do Not Track (DNT) Compliance           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ POST /api/events (sendBeacon/fetch)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS REST BACKEND                           │
│                   (http://localhost:5000)                              │
│  - Zod Request Validation    - Idempotent Ingestion (unique event_id)  │
│  - Helmet & CORS Policies    - Rate Limiting (600 req/min)             │
│  - Layered Architecture      - Centralized Error Handling              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose Aggregation & Indexes
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         MONGODB PERSISTENCE                            │
│   - MongoDB Atlas / Local MongoDB / Auto In-Memory Fallback            │
│   - Compound Indexes: {session_id, timestamp}, {page_url, event_type}  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API Queries
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     REACT ANALYTICS DASHBOARD                          │
│                   (http://localhost:5173)                              │
│  - KPI Metric Cards          - Recharts Interaction Volume Chart       │
│  - Sessions Explorer Table   - Chronological Journey Drawer            │
│  - Session Replay-Lite       - Canvas Heatmaps (Blobs/Dots/Grid)       │
│  - Command Palette (Cmd+K)   - Dark / Light Theme Toggle               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Tracking Script** | Vanilla JavaScript (ES5/ES6), `navigator.sendBeacon`, `localStorage`, zero dependencies, `< 3 KB` |
| **Backend API** | Node.js (ES modules), Express.js, Mongoose 8, Zod 3, Helmet, CORS, Express-Rate-Limit |
| **Database** | MongoDB (Atlas compatible, local MongoDB, with automatic `mongodb-memory-server` dev fallback) |
| **Frontend Dashboard** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React, Recharts 2, TanStack Query, Framer Motion |
| **Demo Application** | Semantic HTML5, Vanilla CSS3, Interactive JavaScript with cart state and toasts |
| **Quality & Tests** | Vitest 3, ESLint, TypeScript Strict Checking, Supertest |
| **DevOps** | Docker, Docker Compose, Concurrently |

---

## 📁 Monorepo Project Structure

```
Simple User Analytics Application/
├── package.json               # Root workspace scripts (dev, seed, test, build)
├── docker-compose.yml         # Container definitions for MongoDB, Server, and Client
├── .env.example               # Root environment variables template
├── tracker/
│   └── tracker.js             # Standalone embeddable interaction tracker
├── server/
│   ├── package.json           # Backend dependencies and scripts
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.js             # Express app setup, security headers, rate limiting, routes
│   │   ├── server.js          # Server bootstrap and database connection
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection manager with in-memory fallback
│   │   │   └── env.js         # Environment variables validation & defaults
│   │   ├── models/
│   │   │   └── Event.js       # Mongoose Schema with compound indexes
│   │   ├── routes/            # Express route handlers
│   │   ├── controllers/       # Controller layer
│   │   ├── services/
│   │   │   ├── analytics.service.js  # Aggregation pipelines (sessions, heatmaps, overview)
│   │   │   ├── event.service.js      # Ingestion logic with bulk idempotency
│   │   │   └── seed.service.js       # Realistic seed data generator
│   │   ├── validators/
│   │   │   └── event.validator.js    # Zod schemas for event payloads and queries
│   │   └── utils/
│   │       └── url.js         # Canonical URL normalization
│   └── tests/
│       ├── url.test.js        # Unit tests for URL canonicalization
│       └── validation.test.js # Unit tests for Zod validation schemas
├── client/
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration with API reverse proxy
│   ├── tailwind.config.js     # Design tokens, Apple/Material 3 aesthetics, dark mode
│   ├── src/
│   │   ├── main.tsx           # React DOM root
│   │   ├── App.tsx            # App router and date range state
│   │   ├── index.css          # Design system tokens, glassmorphism, scrollbars
│   │   ├── components/
│   │   │   ├── common/        # MetricCard, Badge, Skeleton, EmptyState, CommandPalette, EmbedModal
│   │   │   ├── layout/        # Sidebar, Header, AppLayout
│   │   │   ├── overview/      # OverviewPage, ActivityChart, TopPagesTable, RecentSessionsList
│   │   │   ├── sessions/      # SessionsPage, SessionsTable, JourneyTimeline, SessionDetailDrawer
│   │   │   └── heatmap/       # HeatmapPage, HeatmapCanvas, HeatmapControls
│   │   ├── lib/               # api.ts (typed HTTP client), utils.ts (CSV export, formatters)
│   │   └── types/             # TypeScript interfaces
└── demo/                      # Standalone e-commerce demo website
    ├── index.html             # Homepage with featured products
    ├── products.html          # Product catalog with category filter chips
    ├── product.html           # Product detail with swatches & add-to-bag actions
    ├── checkout.html          # Checkout form with payment chips & place order
    ├── style.css              # Dark modern e-commerce styling
    └── script.js              # Interactive UI behaviors and toast notifications
```

---

## ⚡ Quick Start (Run in 2 Minutes)

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v22.16.0)
- **npm**: v9.0.0 or later

### Step 1: Clone & Install Dependencies
From the repository root:
```bash
# Install root, server, and client dependencies
npm run install:all
```

### Step 2: Configure Environment (Optional)
A `.env.example` file is included in the root. By default, **no configuration is required**: if `MONGODB_URI` is left blank, the server automatically starts an in-memory MongoDB instance.

To connect to your MongoDB Atlas or local MongoDB instance:
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/trace_analytics?retryWrites=true&w=majority
```

### Step 3: Run the Application
Start the Server, Client Dashboard, and Demo Store with a single command:
```bash
npm run dev
```

The terminals will launch:
1. **Analytics Dashboard**: [`http://localhost:5173`](http://localhost:5173)
2. **Demo E-Commerce Store**: [`http://localhost:3001`](http://localhost:3001)
3. **Backend API**: [`http://localhost:5000`](http://localhost:5000)
4. **Tracker Script**: [`http://localhost:5000/tracker.js`](http://localhost:5000/tracker.js)

### Step 4 (Optional): Seed Realistic Demo Data
To immediately populate the dashboard with 20 realistic visitor sessions, 250+ events, and heatmaps across the past 7 days:
```bash
npm run seed
```
*(Or send `POST http://localhost:5000/api/seed`)*

---

## 🔌 How to Embed the Tracker on Any Webpage

Install the tracker on any website by adding a single `<script>` tag before the closing `</body>` tag or inside `<head>`:

```html
<!-- Production Deployment -->
<script
  src="https://YOUR_DOMAIN/tracker.js"
  data-api="https://YOUR_API_DOMAIN"
  async
></script>

<!-- Local Development -->
<script
  src="http://localhost:5000/tracker.js"
  data-api="http://localhost:5000"
  async
></script>
```

### Configuration Attributes
| Attribute | Description | Default |
|---|---|---|
| `data-api` | Base URL of the backend ingestion server | Origin of script |
| `data-dnt` | Set to `"true"` to respect the browser's Do Not Track setting | `"false"` |

### Custom Events API
The script exposes a lightweight global API on `window.CFTracker`:
```javascript
// Track custom conversion or checkout milestone
window.CFTracker.track('purchase_completed', {
  order_id: 'ord_9872',
  value: 299.00,
  currency: 'USD'
});

// Immediately flush any queued events
window.CFTracker.flush();

// Access active session identifier
const currentSessionId = window.CFTracker.getSessionId();
```

---

## 📡 API Endpoint Documentation

All endpoints return structured JSON with consistent error formatting.

### 1. Ingest Events
- **`POST /api/events`**
- **Description**: Ingests a single event object or an array of event objects. Enforces Zod validation and duplicate prevention via `event_id`.
- **Request Body (Batch)**:
```json
[
  {
    "event_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "session_id": "4a712f5e-149b-4392-a1cb-917eefc40919",
    "event_type": "click",
    "page_url": "http://localhost:3001/product.html",
    "page_path": "/product.html",
    "page_title": "Aura Studio Wireless",
    "timestamp": "2026-10-14T15:00:00.000Z",
    "x": 720,
    "y": 420,
    "page_x": 720,
    "page_y": 420,
    "normalized_x": 0.5,
    "normalized_y": 0.2625,
    "is_rage_click": false,
    "viewport_width": 1440,
    "viewport_height": 900,
    "document_width": 1440,
    "document_height": 1600,
    "target": {
      "tag": "button",
      "id": "add-to-cart-btn",
      "text": "Add to Bag — $299",
      "selector": "div.action-row > button#add-to-cart-btn"
    },
    "device": { "type": "desktop", "browser": "Chrome", "os": "macOS" }
  }
]
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "insertedCount": 1,
    "duplicateCount": 0,
    "totalReceived": 1
  }
}
```

### 2. Sessions Explorer
- **`GET /api/sessions`**
- **Parameters**: `page` (default 1), `limit` (default 20), `search` (session ID filter), `sortBy` (`last_seen`, `first_seen`, `total_events`, `duration`), `sortOrder` (`asc`, `desc`), `device` (`desktop`, `mobile`, `tablet`, `all`), `startDate`, `endDate`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "session_id": "4a712f5e-149b-4392-a1cb-917eefc40919",
      "first_seen": "2026-10-14T14:58:10.000Z",
      "last_seen": "2026-10-14T15:02:45.000Z",
      "total_events": 12,
      "page_view_count": 3,
      "click_count": 9,
      "distinct_pages_count": 3,
      "pages_visited": ["/index.html", "/product.html", "/checkout.html"],
      "entry_page": "/index.html",
      "device": { "type": "desktop", "browser": "Chrome", "os": "macOS" },
      "has_rage_clicks": false,
      "duration_ms": 275000
    }
  ],
  "pagination": {
    "total": 21,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### 3. Chronological User Journey
- **`GET /api/sessions/:sessionId/events`**
- **Description**: Returns all events belonging to the specified session, sorted chronologically ascending with calculated `relative_time_seconds`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "total_events": 2,
  "data": [
    {
      "event_id": "e1",
      "session_id": "4a712f5e-149b-4392-a1cb-917eefc40919",
      "event_type": "page_view",
      "page_path": "/index.html",
      "relative_time_seconds": 0,
      "sequence": 1,
      "timestamp": "2026-10-14T14:58:10.000Z"
    },
    {
      "event_id": "e2",
      "session_id": "4a712f5e-149b-4392-a1cb-917eefc40919",
      "event_type": "click",
      "page_path": "/index.html",
      "relative_time_seconds": 4,
      "sequence": 2,
      "x": 720,
      "y": 280,
      "normalized_x": 0.5,
      "normalized_y": 0.175,
      "is_rage_click": false,
      "target": { "tag": "a", "id": "hero-cta-btn", "text": "Explore Aura Studio" }
    }
  ]
}
```

### 4. Click Heatmap Coordinates
- **`GET /api/heatmap?pageUrl=http://localhost:3001/product.html`**
- **Parameters**: `pageUrl` (or `url`), `startDate`, `endDate`, `device`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "page_url": "http://localhost:3001/product.html",
    "total_clicks": 36,
    "points": [
      {
        "x": 950,
        "y": 420,
        "page_x": 950,
        "page_y": 420,
        "normalized_x": 0.6597,
        "normalized_y": 0.2625,
        "is_rage_click": false,
        "target": { "tag": "button", "id": "add-to-cart-btn" },
        "timestamp": "2026-10-14T15:00:00.000Z"
      }
    ],
    "clusters": [
      {
        "col": 13,
        "row": 5,
        "centerX": 0.675,
        "centerY": 0.275,
        "count": 14,
        "hasRageClick": false
      }
    ]
  }
}
```

### 5. Distinct Tracked Pages
- **`GET /api/pages`**
- Returns all distinct canonical URLs with total page views, click counts, and last active timestamp.

### 6. Overview Analytics Summary
- **`GET /api/overview`** (or **`GET /api/stats/overview`**)
- Returns summary KPI cards, events-over-time time-series data for the Recharts graph, top pages, and recent sessions.

### 7. Application Health Check
- **`GET /api/health`**
- Returns server uptime and MongoDB connection state without exposing internal credentials.

---

## 🧠 Engineering Decisions & Trade-Offs

### 1. Session Management & 30-Minute Timeout
- **Implementation**: The visitor's `session_id` is generated on the client via `crypto.randomUUID()` and cached in `localStorage`.
- **Inactivity Expiry**: On every user event, the tracker checks `Date.now() - last_active`. If greater than 30 minutes (1,800,000 ms), a new session UUID is generated. This mirrors industry standards (Google Analytics 4 / Mixpanel).

### 2. Normalized Heatmap Coordinates
- **Why Normalized (0.0 to 1.0)?**: Direct pixel coordinates (`clientX`, `clientY`) change if users have different screen sizes, browser window dimensions, or zoom levels. By computing:
  $$\text{normalized\_x} = \frac{\text{pageX}}{\text{document\_width}}$$
  $$\text{normalized\_y} = \frac{\text{pageY}}{\text{document\_height}}$$
  the heatmap renders with precision whether viewed on a 13" laptop, a 27" 4K monitor, or a tablet.

### 3. Event Delivery: Beacon Batching & Pagehide
- **Why `navigator.sendBeacon`?**: Traditional `fetch()` requests can be cancelled by the browser when a user navigates to another page or closes the tab. `sendBeacon` offloads the payload to the browser process to guarantee delivery without freezing the UI thread.
- **Debounced Batching**: Events are queued and dispatched every 1.5 seconds or immediately when `document.visibilityState === 'hidden'`, minimizing HTTP overhead.

### 4. Privacy & Canonical URL Normalization
- The canonical URL logic strips query parameters (`?utm_source=...&token=...`) and URL fragments (`#review`) to prevent accidental ingestion of personal tokens or passwords in URLs.
- The tracker never collects `<input>` values or form passwords. Element descriptors only collect tags, IDs, class names, and button labels.

### 5. MongoDB Aggregation vs. Duplicate Counters
- Rather than maintaining duplicate counter collections (which are prone to drift and desynchronization during race conditions), session durations and page view/click counts are calculated using indexed aggregation pipelines (`$group`, `$facet`).

---

## 🧪 Testing & Quality Checks

Run the automated test suite:
```bash
# Run backend validation and URL normalization tests
npm test --prefix server
```

Expected output:
```
 ✓ tests/url.test.js (5 tests)
 ✓ tests/validation.test.js (5 tests)
 Test Files  2 passed (2)
      Tests  10 passed (10)
```

Run TypeScript strict checks and production build:
```bash
npm run build --prefix client
```

---

## 🐳 Docker Compose Deployment

To run the entire system (MongoDB container, Express API, and React frontend) in a single command using Docker:

```bash
docker-compose up --build
```

- MongoDB will run on port `27017`
- Express API on port `5000`
- React Client on port `5173`

---

## 🚀 Cloud Deployment Instructions

### Deploy Backend to Render / Railway
1. Push your repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
3. Set Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Set Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `CORS_ORIGINS`: Your deployed frontend URL.

### Deploy Frontend to Vercel
1. In [Vercel](https://vercel.com), import your repository.
2. Set Root Directory to `client`.
3. Set Framework Preset to `Vite`.
4. Set Environment Variable:
   - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g. `https://api.yourdomain.com`).

---

## 🛡️ License & Acknowledgments

Developed by **Full Stack Engineer Intern Candidate** for **CausalFunnel**.  
License: [MIT](LICENSE)
