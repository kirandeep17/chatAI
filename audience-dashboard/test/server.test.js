import { test } from 'node:test';
import assert from 'node:assert/strict';

delete process.env.TTD_API_URL;
const { startServer } = await import('../server.js');

test('serves the UI and categorized sample data', async () => {
  const { server, url } = await startServer({ port: 0, log: () => {} });
  try {
    const html = await (await fetch(url)).text();
    assert.match(html, /Audience Manager/);

    const data = await (await fetch(`${url}/api/audiences`)).json();
    assert.ok(data.rows.length > 0);
    assert.ok(data.rows.every((r) => ['syndicated', 'custom', 'test', 'other'].includes(r.Category)));
    assert.ok(data.rows.filter((r) => r.ProviderElementId === 'C-10').every((r) => r.Category === 'test'));

    const res = await fetch(`${url}/..%2fserver.js`);
    assert.notEqual(res.status, 200);
  } finally {
    server.close();
  }
});
