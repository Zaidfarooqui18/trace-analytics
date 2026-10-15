const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'client/dist');
const trackerSrc = path.resolve(rootDir, 'tracker/tracker.js');
const trackerDest = path.resolve(distDir, 'tracker.js');
const demoSrc = path.resolve(rootDir, 'demo');
const demoDest = path.resolve(distDir, 'demo');
const mainIndexHtml = path.resolve(distDir, 'index.html');

// Ensure client/dist exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Copy tracker.js into client/dist/
if (fs.existsSync(trackerSrc)) {
  fs.copyFileSync(trackerSrc, trackerDest);
  console.log('[Build] Copied tracker/tracker.js to client/dist/tracker.js');
}

// 2. Copy demo/ into client/dist/demo/
if (fs.existsSync(demoSrc)) {
  fs.cpSync(demoSrc, demoDest, { recursive: true });
  console.log('[Build] Copied demo/ directory to client/dist/demo/');
}

// 3. Ensure .nojekyll exists in client/dist/ for GitHub Pages
fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '', 'utf8');
console.log('[Build] Created client/dist/.nojekyll for GitHub Pages');

// 4. Pre-generate static HTML fallbacks for dashboard routes to enable direct refresh
if (fs.existsSync(mainIndexHtml)) {
  const routes = ['sessions', 'heatmaps'];
  routes.forEach((route) => {
    const routeDir = path.resolve(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.copyFileSync(mainIndexHtml, path.resolve(routeDir, 'index.html'));
  });
  console.log('[Build] Pre-generated static index.html fallbacks for /sessions and /heatmaps');
}

// 5. Ensure 404.html fallback exists in client/dist/
const public404 = path.resolve(rootDir, 'client/public/404.html');
const dist404 = path.resolve(distDir, '404.html');
if (fs.existsSync(public404) && !fs.existsSync(dist404)) {
  fs.copyFileSync(public404, dist404);
  console.log('[Build] Copied 404.html fallback to client/dist/404.html');
}

console.log('[Build] Distribution preparation complete for GitHub Pages & Production deployment.');

