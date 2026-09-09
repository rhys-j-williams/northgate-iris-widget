#!/usr/bin/env node
/* eslint-disable */
/**
 * IRIS-0900 host verification driver (evidence script, not part of the build).
 *
 * Serves retail-web-host.html the way retail-web's ingress lays things out and drives it through
 * headless Chrome (same technique as scripts/harness/check-mount.js):
 *
 *   /                      -> retail-web-host.html (host page shape, host CSP)
 *   /host/zone-flags.js    -> retail-web src/zone-flags.ts, as plain JS
 *   /host/zone.js          -> the HOST's zone.js (dist/zone.js from the version the host pins)
 *   /host/probe.js         -> probe.js
 *   /assets/widgets/<f>    -> dist/iris-widget/<f>
 *
 * Usage:
 *   CHROME_BIN=... node retail-web-host-check.js --host-repo <retail-web checkout> --host-zone <zone.js pkg dir>
 *
 * --host-repo is only read (package.json zone.js pin, src/zone-flags.ts presence); nothing is written.
 * --host-zone is an unpacked zone.js package whose version must equal the host pin.
 * Exit 0 on HOST-VERIFIED, 1 otherwise.
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
}
const hostRepo = path.resolve(arg('--host-repo', '/home/ubuntu/scratch/retail-web-host'));
const hostZoneDir = path.resolve(arg('--host-zone', '/home/ubuntu/scratch/host-verify/package'));
const irisRepo = path.resolve(__dirname, '..', '..', '..', '..', '..');
const dist = path.join(irisRepo, 'dist', 'iris-widget');
const here = __dirname;

const hostPkg = JSON.parse(fs.readFileSync(path.join(hostRepo, 'package.json'), 'utf8'));
const hostZonePin = hostPkg.dependencies['zone.js'];
const hostAngular = hostPkg.dependencies['@angular/core'];
const zonePkg = JSON.parse(fs.readFileSync(path.join(hostZoneDir, 'package.json'), 'utf8'));
if (zonePkg.version !== hostZonePin) {
  console.error(`[host-check] host pins zone.js ${hostZonePin} but --host-zone is ${zonePkg.version}`);
  process.exit(1);
}
const zoneFile = path.join(hostZoneDir, 'dist', 'zone.js'); // retail-web polyfills.ts: import 'zone.js/dist/zone'
for (const f of [zoneFile, path.join(dist, 'iris.js'), path.join(dist, 'iris.manifest.json'), path.join(hostRepo, 'src', 'zone-flags.ts')]) {
  if (!fs.existsSync(f)) {
    console.error(`[host-check] missing ${f}`);
    process.exit(1);
  }
}
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'iris.manifest.json'), 'utf8'));
const irisAngularPeerZone = JSON.parse(fs.readFileSync(path.join(irisRepo, 'node_modules', '@angular', 'core', 'package.json'), 'utf8')).peerDependencies['zone.js'];

console.log(`[host-check] host: northgate-retail-web @ ${hostRepo} (Angular ${hostAngular}, zone.js ${hostZonePin}, polyfills import 'zone.js/dist/zone', flags src/zone-flags.ts)`);
console.log(`[host-check] widget: ${manifest.file} (Angular ${manifest.angular}, zoneJsCompatible ${manifest.zoneJsCompatible}); @angular/core peer zone.js "${irisAngularPeerZone}"`);

// src/zone-flags.ts from retail-web, as plain JS (the TS file is `(window as any).X = ...`).
const zoneFlags =
  "window.__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove'];\n" +
  'window.__Zone_disable_requestAnimationFrame = true;\n';

const types = { '.js': 'application/javascript', '.svg': 'image/svg+xml', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' };
function send(res, file, body) {
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
}
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  try {
    if (url === '/' || url === '/index.html') return send(res, 'x.html', fs.readFileSync(path.join(here, 'retail-web-host.html')));
    if (url === '/host/zone-flags.js') return send(res, url, zoneFlags);
    if (url === '/host/zone.js') return send(res, url, fs.readFileSync(zoneFile));
    if (url === '/host/probe.js') return send(res, url, fs.readFileSync(path.join(here, 'probe.js')));
    if (url.startsWith('/assets/widgets/')) {
      const rel = path.normalize(url.slice('/assets/widgets/'.length));
      if (!rel.startsWith('..')) return send(res, rel, fs.readFileSync(path.join(dist, rel)));
    }
  } catch (e) {
    /* fall through to 404 */
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found ' + url);
});

const port = Number(process.env.IRIS_HOST_CHECK_PORT || 4206);
server.listen(port, '127.0.0.1', () => {
  console.log(`[host-check] http://localhost:${port}/`);
  execFile(
    process.env.CHROME_BIN || 'google-chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'iris-host-check-'))}`,
      '--virtual-time-budget=6000',
      '--dump-dom',
      `http://localhost:${port}/`,
    ],
    { encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024 },
    (err, dom) => {
      let code = 1;
      if (err) console.error('[host-check] chrome failed:', err.message);
      dom = dom || '';
      const m = dom.match(/<pre id="log">([\s\S]*?)<\/pre>/);
      if (m) console.log(m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim());
      const zoneScripts = (dom.match(/<script[^>]+src="\/host\/zone\.js"/g) || []).length;
      const bundleHasZone = /function\s+Zone\s*\(/.test(fs.readFileSync(path.join(dist, 'iris.js'), 'utf8'));
      console.log(`[host-check] zone.js <script> tags on page: ${zoneScripts} (the host's); widget bundle defines Zone: ${bundleHasZone}`);
      if (/data-iris-host-verified="true"/.test(dom) && /<div id="iris-root">\s*<northgate-iris-widget[\s\S]*class="iris-root/.test(dom)) {
        console.log(`[host-check] HOST-VERIFIED: ${manifest.file} (Angular ${manifest.angular}) registered <northgate-iris-widget> and rendered inside the retail-web host shape with the host's zone.js ${hostZonePin}`);
        code = 0;
      } else {
        console.error('[host-check] HOST-FAILED. DOM follows.');
        console.error(dom.slice(0, 4000));
      }
      server.close(() => process.exit(code));
    },
  );
});
