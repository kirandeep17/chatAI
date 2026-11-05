import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAudiences } from './lib/ttdClient.js';
import { buildTestMatcher, summarize } from './lib/categorize.js';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

// Load .env if present (built into Node >= 20.12, no dotenv needed).
try {
  process.loadEnvFile(join(ROOT, '.env'));
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}

const PORT = Number(process.env.PORT) || 3000;
const isTest = buildTestMatcher(
  (process.env.TEST_ELEMENT_IDS ?? 'C-10').split(','),
  process.env.TEST_MATCH_MODE ?? 'exact',
);

let cache = null; // { fetchedAt, source, summary, rows }
let inflight = null;

async function load() {
  if (inflight) return inflight;
  inflight = (async () => {
    const started = Date.now();
    const { items, source } = await fetchAudiences();
    const { summary, rows } = summarize(items, isTest);
    cache = { fetchedAt: new Date().toISOString(), source, tookMs: Date.now() - started, summary, rows };
    console.log(`[audiences] loaded ${rows.length} segments from ${source} in ${cache.tookMs}ms`);
    return cache;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/api/audiences') {
      const data = !cache || url.searchParams.get('refresh') === '1' ? await load() : cache;
      return sendJson(res, 200, data);
    }

    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = normalize(join(ROOT, 'public', path));
    if (!file.startsWith(join(ROOT, 'public'))) return sendJson(res, 403, { error: 'Forbidden' });
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    if (e.code === 'ENOENT') return sendJson(res, 404, { error: 'Not found' });
    console.error('[audiences]', e.message);
    sendJson(res, 502, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Audience dashboard running at http://localhost:${PORT}`);
  // Call the API up front so the first page load is instant.
  load().catch((e) => console.error('[audiences] initial load failed:', e.message));
});
