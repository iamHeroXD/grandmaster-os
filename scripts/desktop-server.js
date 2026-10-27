import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const logFile = path.join(projectRoot, 'desktop.log');
const portFile = path.join(projectRoot, 'desktop.port');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  try {
    fs.appendFileSync(logFile, line);
  } catch {}
}

log('[Grandmaster OS] Starting desktop application supervisor...');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

// Check if dist exists; if not build it
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  log('[Grandmaster OS] Production build not found. Running build...');
  try {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  } catch (e) {
    log('[Grandmaster OS] Build error: ' + e.message);
  }
}

// Heartbeat management: automatic clean exit when window is closed
let lastHeartbeat = Date.now();
let hasReceivedFirstHeartbeat = false;

const heartbeatMonitor = setInterval(() => {
  const elapsed = Date.now() - lastHeartbeat;
  if (hasReceivedFirstHeartbeat && elapsed > 14000) {
    log('[Grandmaster OS] Application window closed (heartbeat timeout). Exiting cleanly.');
    clearInterval(heartbeatMonitor);
    try {
      if (fs.existsSync(portFile)) fs.unlinkSync(portFile);
    } catch {}
    process.exit(0);
  }
  // Grace period on initial launch: 60 seconds to open window
  if (!hasReceivedFirstHeartbeat && elapsed > 60000) {
    log('[Grandmaster OS] No window connected within 60s of launch. Exiting.');
    clearInterval(heartbeatMonitor);
    try {
      if (fs.existsSync(portFile)) fs.unlinkSync(portFile);
    } catch {}
    process.exit(0);
  }
}, 3000);

// Create static HTTP server for local offline bundle
const server = http.createServer((req, res) => {
  let reqPath = req.url ? req.url.split('?')[0] : '/';

  // Heartbeat endpoint
  if (reqPath === '/api/heartbeat') {
    lastHeartbeat = Date.now();
    hasReceivedFirstHeartbeat = true;
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
    });
    res.end(JSON.stringify({ status: 'ok', time: Date.now() }));
    return;
  }

  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(distDir, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Fallback to index.html for SPA routes
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500);
    res.end('Server Error: ' + err.message);
  }
});

function launchBrowser(appUrl) {
  const skipBrowser = process.argv.includes('--no-browser');
  if (skipBrowser) {
    log(`[Grandmaster OS] Server ready at ${appUrl} (browser launch handled by launcher)`);
    return;
  }

  log(`[Grandmaster OS] Desktop server running offline at ${appUrl}`);

  // Locate native Edge or Chrome executable for standalone app window
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  const browserPath = candidates.find((p) => fs.existsSync(p));
  const profileDir = path.join(
    process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'),
    'GrandmasterOS',
    'Profile'
  );

  if (browserPath) {
    log(`[Grandmaster OS] Launching desktop application window with: ${browserPath}`);
    const args = [
      `--app=${appUrl}`,
      `--user-data-dir=${profileDir}`,
      '--window-size=1400,900',
      '--window-position=center',
    ];

    const appProcess = spawn(browserPath, args, {
      detached: true,
      stdio: 'ignore',
    });
    appProcess.unref();
  } else {
    // Fallback: default browser open
    log(`[Grandmaster OS] Opening default browser at ${appUrl}`);
    const startCmd = process.platform === 'win32' ? 'start' : 'open';
    spawn(startCmd, [appUrl], { shell: true, detached: true }).unref();
  }
}

// Resilient port listener
function startServer(port = 5173) {
  const tryServer = http.createServer(server._events.request);

  tryServer.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log(`[Grandmaster OS] Port ${port} is occupied, trying port ${port + 1}...`);
      if (port < 5200) {
        startServer(port + 1);
      } else {
        log('[Grandmaster OS] Could not find an available port.');
        process.exit(1);
      }
    } else {
      log('[Grandmaster OS] Server error: ' + err.message);
      process.exit(1);
    }
  });

  tryServer.listen(port, '127.0.0.1', () => {
    const actualPort = tryServer.address().port;
    try {
      fs.writeFileSync(portFile, actualPort.toString(), 'utf8');
    } catch {}
    launchBrowser(`http://127.0.0.1:${actualPort}`);
  });
}

startServer(5173);
