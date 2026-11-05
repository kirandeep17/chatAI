// Calls the Trade Desk POST endpoint configured in .env and returns every
// segment in `Result`, following PageStartIndex/PageSize paging when the
// request body includes a PageSize.

import { readFile } from 'node:fs/promises';

const MAX_PAGES = 1000;

function parseBody(raw) {
  if (!raw || !raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`TTD_REQUEST_BODY is not valid JSON: ${e.message}`);
  }
}

async function postOnce(url, token, body, timeoutMs) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['TTD-Auth'] = token;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Trade Desk API returned ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Trade Desk API returned non-JSON response: ${text.slice(0, 200)}`);
  }
}

export async function fetchAudiences(env = process.env) {
  // No URL configured -> serve the bundled sample so the UI can be tried out.
  if (!env.TTD_API_URL) {
    const sample = JSON.parse(await readFile(new URL('../sample-data.json', import.meta.url), 'utf8'));
    return { items: sample.Result ?? [], source: 'sample-data.json (TTD_API_URL not set)' };
  }

  const url = env.TTD_API_URL;
  const token = env.TTD_AUTH_TOKEN;
  const timeoutMs = Number(env.TTD_TIMEOUT_MS) || 60_000;
  const baseBody = parseBody(env.TTD_REQUEST_BODY);
  const paginate = typeof baseBody.PageSize === 'number' && baseBody.PageSize > 0;

  if (!paginate) {
    const json = await postOnce(url, token, baseBody, timeoutMs);
    return { items: json.Result ?? [], source: url };
  }

  const items = [];
  let start = baseBody.PageStartIndex ?? 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const json = await postOnce(url, token, { ...baseBody, PageStartIndex: start }, timeoutMs);
    const batch = json.Result ?? [];
    items.push(...batch);
    start += batch.length;
    const total = json.ResultCount;
    if (batch.length === 0 || batch.length < baseBody.PageSize || (typeof total === 'number' && start >= total)) {
      break;
    }
  }
  return { items, source: url };
}
