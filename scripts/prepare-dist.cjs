const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'client/dist');
const trackerSrc = path.resolve(rootDir, 'tracker/tracker.js');
const trackerDest = path.resolve(distDir, 'tracker.js');
const demoSrc = path.resolve(rootDir, 'demo');
const demoDest = path.resolve(distDir, 'demo');

// Ensure client/dist exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy tracker.js into client/dist/
if (fs.existsSync(trackerSrc)) {
  fs.copyFileSync(trackerSrc, trackerDest);
  console.log('[Build] Copied tracker/tracker.js to client/dist/tracker.js');
}

// Copy demo/ into client/dist/demo/
if (fs.existsSync(demoSrc)) {
  fs.cpSync(demoSrc, demoDest, { recursive: true });
  console.log('[Build] Copied demo/ directory to client/dist/demo/');
}

console.log('[Build] Distribution preparation complete for Vercel/Production deployment.');
