import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAudiences } from './lib/ttdClient.js';
import { buildTestMatcher, summarize } from './lib/categorize.js';

const PUBLIC = fileURLToPath(new URL('./public', import.meta.url));
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

/**
 * Starts the dashboard server. Reads configuration from process.env, so load
 * the .env file before calling this.
 * Resolves with { server, url } once listening.
 */
export function startServer({ port = 3000, host = '127.0.0.1', log = console.log } = {}) {
  const isTest = buildTestMatcher(
    (process.env.TEST_ELEMENT_IDS ?? 'C-10').split(','),
    process.env.TEST_MATCH_MODE ?? 'exact',
  );

  let cache = null;
  let inflight = null;

  function load() {
    if (inflight) return inflight;
    inflight = (async () => {
      const started = Date.now();
      const { items, source } = await fetchAudiences();
      const { summary, rows } = summarize(items, isTest);
      cache = { fetchedAt: new Date().toISOString(), source, tookMs: Date.now() - started, summary, rows };
      log(`[audiences] loaded ${rows.length} segments from ${source} in ${cache.tookMs}ms`);
      return cache;
    })().finally(() => {
      inflight = null;
    });
    return inflight;
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/api/audiences') {
        const data = !cache || url.searchParams.get('refresh') === '1' ? await load() : cache;
        return sendJson(res, 200, data);
      }
      const path = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
      const file = normalize(join(PUBLIC, path));
      if (!file.startsWith(PUBLIC + sep)) return sendJson(res, 403, { error: 'Forbidden' });
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch (e) {
      if (e.code === 'ENOENT' || e.code === 'EISDIR') return sendJson(res, 404, { error: 'Not found' });
      log(`[audiences] ${e.message}`);
      sendJson(res, 502, { error: e.message });
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      const url = `http://${host === '127.0.0.1' || host === '0.0.0.0' ? 'localhost' : host}:${server.address().port}`;
      // Call the API up front so the first page load is instant.
      load().catch((e) => log(`[audiences] initial load failed: ${e.message}`));
      resolve({ server, url });
    });
  });
}
