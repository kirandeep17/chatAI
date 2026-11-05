# Trade Desk Audience Dashboard

A local dashboard that calls your Trade Desk third-party data POST endpoint, sorts every segment into a category, and lets you search and filter them.

It has no dependencies (plain Node ≥ 20.12, built-in `fetch`/`http`), so you don't need `npm install`.

## Run

```bash
cd audience-dashboard
cp .env.example .env     # then fill in TTD_API_URL and TTD_AUTH_TOKEN
npm start                # http://localhost:3000
```

If `TTD_API_URL` is left empty, the app loads `sample-data.json` instead, so you can try the UI first.
Use `npm run dev` to auto-restart the server on code changes, and `npm test` to run the categorization tests.

## How segments are categorized

The rules run in order, and the first match wins (`lib/categorize.js`):

| Rule | Category |
|---|---|
| `ProviderElementId` is in `TEST_ELEMENT_IDS` (default `C-10`) | **Test** |
| `ParentElementId === "ROOT"` | **Syndicated** |
| `ParentElementId === "CUSTOM"` | **Custom** |
| anything else (e.g. child nodes under another parent) | **Other** (only shown if any exist) |

`TEST_MATCH_MODE` can be `exact` (default), `prefix` (`C-10`, `C-101`, `C-10_X` …) or `contains`.

A segment counts as **active** when `ActiveIDsCount > 0`.

## What it does

- On startup the server calls the API once and caches the result in memory. **Refresh from API** calls it again.
- If `TTD_REQUEST_BODY` contains `PageSize`, the server pages through every result by advancing `PageStartIndex` until it has `ResultCount` segments.
- The token is sent as the `TTD-Auth` header. It stays on the server and is never sent to the browser.
- Summary cards show active / total / % active / total active IDs / buyable for each category. Clicking a card filters the table.
- Search matches **DisplayName** and **ProviderElementId** (case-insensitive) and highlights the matches.
- You can turn on an "Active only" filter, sort by any column, and export the current view to CSV.

## Files

- `server.js` – HTTP server: `/api/audiences[?refresh=1]` plus static UI
- `lib/ttdClient.js` – API call and pagination
- `lib/categorize.js` – categorization and summary counts
- `public/` – UI (vanilla HTML/CSS/JS)
