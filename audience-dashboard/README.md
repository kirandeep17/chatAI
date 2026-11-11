# Trade Desk Audience Manager

A local, dark-themed dashboard for your Trade Desk third-party data segments. It calls your POST endpoint, sorts every segment into **Syndicated / Custom / Test**, counts how many are active, and lets you search by display name or provider element ID.

It has no dependencies. It needs Node.js **20.12 or newer**.

## Install

From this folder, install it as a global command:

```bash
npm install -g .
```

You can also build a tarball to share with teammates:

```bash
npm pack
```

They install it with `npm install -g ttd-audience-dashboard-0.2.0.tgz`.

## Run

```bash
ttd-audiences --init
```

`--init` creates a `.env` template in the current folder. Fill in `TTD_API_URL`, `TTD_AUTH_TOKEN` and `TTD_REQUEST_BODY`, then start the dashboard:

```bash
ttd-audiences
```

It calls the API, then opens http://localhost:3000 in your browser.

| Option | |
|---|---|
| `-p, --port <n>` | Port (default `PORT` from `.env`, else 3000; if 3000 is busy it picks the next free port) |
| `-e, --env <file>` | Use a specific `.env` file |
| `--init` | Write a `.env` template in the current folder |
| `--no-open` | Don't open the browser |

The `.env` is read from `--env`, then `./.env`, then the install folder. With no `TTD_API_URL`, the dashboard runs on the bundled `sample-data.json`.

You can also run it without installing:

```bash
npm start
```

## How segments are categorized

Rules are checked in order and the first match wins (`lib/categorize.js`):

| Rule | Category |
|---|---|
| `ProviderElementId` is in `TEST_ELEMENT_IDS` (default `C-10`) | **Test** |
| `ParentElementId === "ROOT"` | **Syndicated** |
| `ParentElementId === "CUSTOM"` | **Custom** |
| anything else | **Other** (only shown if any exist) |

`TEST_MATCH_MODE` can be `exact` (default), `prefix` or `contains`. A segment is **active** when `ActiveIDsCount > 0`.

## Features

- **Overview:** a card for each category with active / total, % active, active IDs and buyable count, plus shortcuts to Buyable and Needs review (compliance status not Approved), and a list of recently updated segments.
- **Category lists:** expandable rows showing every field, with copy buttons for the IDs.
- **Search:** matches DisplayName and ProviderElementId and highlights the matches. Open it with `Ctrl K` or `/`; `Esc` clears it.
- **Filters:** Active/Inactive, compliance status, buyable only, filter by provider, sorting, and CSV export of the current view.
- **Paging:** if `TTD_REQUEST_BODY` contains `PageSize`, the server pages through all results automatically.
- **Token safety:** the token is sent as `TTD-Auth` from the local server only and never reaches the browser. The server listens on `127.0.0.1` only.

## Development

```bash
npm run dev
```

`npm run dev` auto-restarts the server on changes. Run the tests with `npm test`.
