// Audience Manager UI — vanilla JS, hash-routed.

const ICONS = {
  home: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/>',
  all: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  syndicated: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4"/><path d="M5 5a10 10 0 0 0 0 14M19 19a10 10 0 0 0 0-14"/>',
  custom: '<path d="M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  test: '<path d="M9.5 4h5M10.5 4v5.2L5.6 17.6A1.6 1.6 0 0 0 7 20h10a1.6 1.6 0 0 0 1.4-2.4L13.5 9.2V4"/><path d="M8 14.5h8"/>',
  other: '<circle cx="6.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="17.5" cy="12" r="1.3"/>',
  active: '<path d="M3.5 12h3.5l2.5-6 5 12 2.5-6h3.5"/>',
  buyable: '<path d="M4 7h16l-1.5 9.5a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4M12 17v.01"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M5 19.5h14"/>',
  ids: '<circle cx="9" cy="9" r="3"/><path d="M3.5 18a5.5 5.5 0 0 1 11 0"/><path d="M16 7h5M16 11h5M17.5 15H21"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a1 1 0 0 1 1-1h9"/>',
  empty: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8.5 11h5"/>',
};
const icon = (name, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICONS[name]}</svg>`;

const DECO = {
  syndicated: '<svg class="deco" viewBox="0 0 170 70"><path d="M0 35h18"/><path d="M26 22v26M36 12v46M46 26v18M56 6v58M66 18v34M76 28v14M86 10v50M96 22v26"/><path d="M104 35h18"/><path d="M130 26v18M140 30v10M150 35h20"/></svg>',
  custom: '<svg class="deco" viewBox="0 0 170 70"><path d="M2 50C30 50 34 14 62 14s34 42 62 42 32-30 44-34"/><path d="M2 40C30 40 36 24 62 24s36 30 62 30 34-24 44-26" opacity=".6"/><path d="M2 58C30 58 32 6 62 6s32 54 62 54 30-36 44-42" opacity=".35"/></svg>',
  test: '<svg class="deco" viewBox="0 0 170 70"><rect x="40" y="6" width="96" height="30" rx="7"/><rect x="66" y="32" width="100" height="32" rx="7"/><path d="M54 21h22M84 21h12M80 48h30M118 48h22"/></svg>',
};

const CATS = {
  all: { label: 'All audiences', short: 'All', color: 'var(--accent)', icon: 'all', blurb: 'Every segment returned by the API.' },
  syndicated: { label: 'Syndicated', short: 'Syndicated', color: 'var(--syndicated)', icon: 'syndicated', blurb: 'Segments whose parent is ROOT.' },
  custom: { label: 'Custom', short: 'Custom', color: 'var(--custom)', icon: 'custom', blurb: 'Segments whose parent is CUSTOM.' },
  test: { label: 'Test', short: 'Test', color: 'var(--test)', icon: 'test', blurb: 'Test element IDs (e.g. C-10).' },
  other: { label: 'Other', short: 'Other', color: 'var(--other)', icon: 'other', blurb: 'Segments under any other parent.' },
};
const PAGE = 100;

const state = {
  data: null,
  error: null,
  loading: false,
  route: 'overview',
  query: '',
  provider: '',
  active: 'any', // any | active | inactive
  compliance: 'any', // any | approved | review
  buyableOnly: false,
  sort: 'name',
  limit: PAGE,
  open: new Set(),
};

const $ = (id) => document.getElementById(id);
const fmt = (n) => (n == null || n === '' ? '—' : Number(n).toLocaleString());
const compact = (n) => (n == null ? '—' : Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hl(text) {
  const safe = esc(text);
  const q = state.query.trim();
  return q ? safe.replace(new RegExp(`(${reEsc(esc(q))})`, 'ig'), '<mark>$1</mark>') : safe;
}
function ago(iso) {
  if (!iso) return '—';
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  const s = (Date.now() - d) / 1000;
  if (s < 60) return 'just now';
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [u, sec] of units) if (s >= sec) return `${Math.floor(s / sec)}${u} ago`;
  return d.toLocaleDateString();
}
const needsReview = (r) => String(r.TaxonomyComplianceStatus ?? '').toLowerCase() !== 'approved';
function splitName(name) {
  const parts = String(name ?? '').split('>').map((s) => s.trim()).filter(Boolean);
  return { leaf: parts.pop() ?? '', path: parts.join(' › ') };
}

/* ---------------- data ---------------- */

async function load(refresh = false) {
  state.loading = true;
  setStatus();
  $('refresh').disabled = true;
  $('railRefresh').classList.add('spin');
  try {
    const res = await fetch(`/api/audiences${refresh ? '?refresh=1' : ''}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    state.data = json;
    state.error = null;
    if (refresh) toast(`Refreshed · ${json.rows.length.toLocaleString()} segments`);
  } catch (e) {
    state.error = e.message;
  } finally {
    state.loading = false;
    $('refresh').disabled = false;
    $('railRefresh').classList.remove('spin');
    render();
  }
}

function setStatus() {
  const el = $('status');
  el.className = 'status ' + (state.loading ? 'busy' : state.error ? 'err' : state.data ? 'ok' : '');
  $('statusText').textContent = state.loading
    ? 'Calling API…'
    : state.error
      ? 'Load failed'
      : state.data
        ? `Synced ${ago(state.data.fetchedAt)}`
        : '';
  if (state.data) el.title = `Source: ${state.data.source}\nFetched: ${new Date(state.data.fetchedAt).toLocaleString()}`;
}

function totals() {
  const s = state.data.summary;
  return Object.values(s).reduce(
    (a, c) => ({ total: a.total + c.total, active: a.active + c.active, activeIds: a.activeIds + c.activeIds, buyable: a.buyable + c.buyable }),
    { total: 0, active: 0, activeIds: 0, buyable: 0 },
  );
}
const statFor = (cat) => (cat === 'all' ? totals() : state.data.summary[cat]);
const visibleCats = () => ['syndicated', 'custom', 'test', ...(state.data?.summary.other.total ? ['other'] : [])];

/* ---------------- routing ---------------- */

function readRoute() {
  const r = location.hash.replace(/^#\/?/, '').split('?')[0];
  state.route = r === '' ? 'overview' : CATS[r] ? r : 'overview';
}
function go(route) {
  const hash = route === 'overview' ? '#/' : `#/${route}`;
  if (location.hash !== hash) location.hash = hash;
  else render();
}
function resetListView() {
  state.limit = PAGE;
  state.open.clear();
}

/* ---------------- render: chrome ---------------- */

function renderChrome() {
  const route = state.route;
  const rail = [['overview', 'home', 'Overview', 'var(--accent)'], ['all', 'all', 'All audiences', 'var(--accent)'],
    ...visibleCats().map((c) => [c, CATS[c].icon, CATS[c].label, CATS[c].color])];
  $('railItems').innerHTML = rail
    .map(([r, ic, title, c]) => `<a href="${r === 'overview' ? '#/' : '#/' + r}" class="rail-btn ${route === r ? 'active' : ''}" style="--c:${c}" title="${title}" aria-label="${title}">${icon(ic)}</a>`)
    .join('');

  const items = [['overview', 'home', 'Overview', null, 'var(--accent)'], ['all', 'all', 'All audiences', state.data?.rows.length, 'var(--accent)'],
    ...visibleCats().map((c) => [c, CATS[c].icon, CATS[c].label, state.data?.summary[c].total, CATS[c].color])];
  $('sideNav').innerHTML = items
    .map(([r, ic, label, count, c]) => `<a href="${r === 'overview' ? '#/' : '#/' + r}" class="nav-item ${route === r ? 'active' : ''}" style="--c:${c}">${icon(ic)}<span class="label">${label}</span>${count != null ? `<span class="count">${fmt(count)}</span>` : ''}</a>`)
    .join('');

  const providers = new Map();
  for (const r of state.data?.rows ?? []) providers.set(r.ProviderId, (providers.get(r.ProviderId) ?? 0) + 1);
  const provList = [...providers].sort((a, b) => b[1] - a[1]);
  $('providerNav').innerHTML = provList.length
    ? provList
        .map(([p, n]) => `<button class="nav-item ${state.provider === p ? 'active' : ''}" data-provider="${esc(p)}"><span class="prov-dot"></span><span class="label">${esc(p || '(none)')}</span><span class="count">${fmt(n)}</span></button>`)
        .join('')
    : `<div class="nav-item" style="cursor:default">—</div>`;

  const crumbs = [`<a href="#/">Audiences</a>`];
  if (route === 'overview') crumbs.push(`<span class="sep">›</span><span class="current">Overview</span>`);
  else {
    crumbs.push(`<span class="sep">›</span><a href="#/${route}" class="${state.provider ? '' : 'current'}">${CATS[route].label}</a>`);
    if (state.provider) crumbs.push(`<span class="sep">›</span><span class="current">${esc(state.provider)}</span>`);
  }
  $('crumbs').innerHTML = crumbs.join('');
  setStatus();
}

/* ---------------- render: overview ---------------- */

function renderOverview() {
  const t = totals();
  const review = state.data.rows.filter(needsReview).length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  const feature = (c) => {
    const s = state.data.summary[c];
    return `<a class="feature" href="#/${c}" style="--c:${CATS[c].color}">
      ${DECO[c] ?? ''}
      <span class="tile">${icon(CATS[c].icon)}</span>
      <h3>${CATS[c].label}</h3>
      <div class="big">${fmt(s.active)} <small>active of ${fmt(s.total)}</small></div>
      <div class="bar"><span style="width:${pct(s.active, s.total)}%"></span></div>
      <div class="sub"><span>${pct(s.active, s.total)}% active</span><span>${compact(s.activeIds)} active IDs</span><span>${fmt(s.buyable)} buyable</span></div>
      <span class="arrow">${icon('arrow')}</span>
    </a>`;
  };

  const mini = (href, c, ic, title, html, data = '') => `<a class="mini" href="${href}" style="--c:${c}" ${data}>
      <span class="tile">${icon(ic)}</span>
      <div><h4>${title}</h4><p>${html}</p></div>
      <span class="arrow">${icon('arrow')}</span>
    </a>`;

  const recent = [...state.data.rows].sort((a, b) => String(b.LastUpdatedAtUTC ?? '').localeCompare(String(a.LastUpdatedAtUTC ?? ''))).slice(0, 6);

  return `
    <section class="hero">
      <div>
        <h1>Audience Manager</h1>
        <p>Track every Trade Desk third-party data segment, grouped into syndicated, custom and test audiences, with live active counts straight from the API.</p>
      </div>
      <div class="hero-meta">
        <span class="chip">${icon('ids')} <strong>${compact(t.activeIds)}</strong> active IDs</span>
        <span class="chip">${icon('clock')} ${ago(state.data.fetchedAt)}</span>
      </div>
    </section>

    <div class="grid-3">${['syndicated', 'custom', 'test'].map(feature).join('')}</div>

    <div class="grid-auto">
      ${mini('#/all', 'var(--accent)', 'all', 'All audiences', `<span class="num">${fmt(t.active)}</span> active of <span class="num">${fmt(t.total)}</span> segments`)}
      ${mini('#/all', 'var(--active)', 'buyable', 'Buyable', `<span class="num">${fmt(t.buyable)}</span> segments are buyable`, 'data-preset="buyable"')}
      ${mini('#/all', 'var(--warn)', 'shield', 'Needs review', `<span class="num">${fmt(review)}</span> not yet Approved`, 'data-preset="review"')}
      ${state.data.summary.other.total ? mini('#/other', 'var(--other)', 'other', 'Other', `<span class="num">${fmt(state.data.summary.other.total)}</span> under another parent`) : ''}
    </div>

    <div class="section-head"><h2>Recently updated</h2><a href="#/all" data-preset="recent">All</a></div>
    <div class="list">${recent.length ? recent.map(rowHtml).join('') : emptyHtml('No segments yet', 'The API returned no results.')}</div>
  `;
}

/* ---------------- render: list ---------------- */

function filtered() {
  const q = state.query.trim().toLowerCase();
  let rows = state.data.rows;
  if (state.route !== 'all') rows = rows.filter((r) => r.Category === state.route);
  if (state.provider) rows = rows.filter((r) => r.ProviderId === state.provider);
  if (state.active !== 'any') rows = rows.filter((r) => r.IsActive === (state.active === 'active'));
  if (state.compliance !== 'any') rows = rows.filter((r) => needsReview(r) === (state.compliance === 'review'));
  if (state.buyableOnly) rows = rows.filter((r) => r.Buyable);
  if (q) {
    rows = rows.filter(
      (r) => String(r.DisplayName ?? '').toLowerCase().includes(q) || String(r.ProviderElementId ?? '').toLowerCase().includes(q),
    );
  }
  const by = {
    name: (a, b) => String(a.DisplayName ?? '').localeCompare(String(b.DisplayName ?? ''), undefined, { sensitivity: 'base', numeric: true }),
    id: (a, b) => String(a.ProviderElementId ?? '').localeCompare(String(b.ProviderElementId ?? ''), undefined, { numeric: true }),
    ids: (a, b) => (Number(b.ActiveIDsCount) || 0) - (Number(a.ActiveIDsCount) || 0),
    updated: (a, b) => String(b.LastUpdatedAtUTC ?? '').localeCompare(String(a.LastUpdatedAtUTC ?? '')),
  }[state.sort];
  return [...rows].sort(by);
}

function rowHtml(r) {
  const key = String(r.ThirdPartyDataId ?? r.ProviderElementId);
  const open = state.open.has(key);
  const cat = CATS[r.Category];
  const { leaf, path } = splitName(r.DisplayName);
  const review = needsReview(r);
  return `<div class="row ${open ? 'open' : ''}" style="--c:${cat.color}">
    <button class="row-line" data-toggle="${esc(key)}" aria-expanded="${open}">
      ${icon('chev', 'chev')}
      <div style="min-width:0">
        ${path ? `<div class="row-path">${hl(path)}</div>` : ''}
        <div class="row-title">
          <span>${hl(leaf)}</span>
          <span class="pill" style="--c:${cat.color}">${cat.short}</span>
          ${r.IsActive ? `<span class="pill" style="--c:var(--active)">${icon('active')}Active</span>` : `<span class="pill muted">Inactive</span>`}
          ${r.Buyable ? `<span class="pill solid" style="--c:var(--active)">${icon('buyable')}Buyable</span>` : ''}
          ${review ? `<span class="pill" style="--c:var(--warn)">${icon('alert')}${esc(r.TaxonomyComplianceStatus ?? 'Unknown')}</span>` : ''}
        </div>
        ${r.Description ? `<div class="row-desc">${esc(r.Description)}</div>` : ''}
      </div>
      <div class="row-meta">
        <span class="chip mono">${hl(r.ProviderElementId)}</span>
        <span class="chip">${icon('ids')}<strong>${compact(r.ActiveIDsCount)}</strong></span>
        <span class="when" title="${esc(r.LastUpdatedAtUTC)} UTC">${ago(r.LastUpdatedAtUTC)}</span>
      </div>
    </button>
    ${open ? detailsHtml(r) : ''}
  </div>`;
}

function detailsHtml(r) {
  const kv = (k, v, cls = '') => `<div class="${cls.includes('wide') ? 'wide' : ''}"><div class="k">${k}</div><div class="v ${cls}">${v}</div></div>`;
  const copy = (v) => `<button class="copy" data-copy="${esc(v)}" title="Copy" aria-label="Copy ${esc(v)}">${icon('copy')}</button>`;
  return `<div class="details">
    ${kv('Display name', esc(r.DisplayName) + copy(r.DisplayName), 'wide')}
    ${r.Description ? kv('Description', esc(r.Description), 'wide') : ''}
    ${kv('Provider element ID', esc(r.ProviderElementId) + copy(r.ProviderElementId), 'mono')}
    ${kv('Third-party data ID', esc(r.ThirdPartyDataId) + copy(r.ThirdPartyDataId), 'mono')}
    ${kv('Parent element ID', esc(r.ParentElementId), 'mono')}
    ${kv('Provider', esc(r.ProviderId) + (r.SubProviderId ? ` / ${esc(r.SubProviderId)}` : ''))}
    ${kv('Active IDs', fmt(r.ActiveIDsCount))}
    ${kv('Received IDs', fmt(r.ReceivedIDsCount))}
    ${kv('Active IDs (expanded)', fmt(r.ActiveIDsCountExpanded))}
    ${kv('Audience size', fmt(r.AudienceSize))}
    ${kv('Audience expansion', esc(r.AudienceExpansion ?? '—'))}
    ${kv('Compliance', esc(r.TaxonomyComplianceStatus ?? '—'))}
    ${kv('Buyable', r.Buyable ? 'Yes' : 'No')}
    ${kv('Last updated (UTC)', esc(String(r.LastUpdatedAtUTC ?? '—').replace('T', ' ')))}
  </div>`;
}

const emptyHtml = (title, text) => `<div class="empty">${icon('empty')}<h3>${title}</h3><div>${text}</div></div>`;

function renderList() {
  const cat = CATS[state.route];
  const rows = filtered();
  const shown = rows.slice(0, state.limit);
  const activeN = rows.filter((r) => r.IsActive).length;
  const seg = (name, opts) =>
    `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-${name}="${v}" class="${state[name] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;

  return `
    <div class="list-head">
      <div class="list-title" style="--c:${cat.color}">
        <span class="tile">${icon(cat.icon)}</span>
        ${cat.label} <span class="count">${fmt(statFor(state.route).total)}</span>
      </div>
      <label class="search">${icon('search')}<input id="listSearch" type="search" placeholder="Search display name or element ID…" value="${esc(state.query)}" autocomplete="off" /></label>
    </div>
    <div class="toolbar">
      ${seg('active', [['any', 'All'], ['active', 'Active'], ['inactive', 'Inactive']])}
      ${seg('compliance', [['any', 'Any status'], ['approved', 'Approved'], ['review', 'Needs review']])}
      <button class="ghost-btn" data-buyable aria-pressed="${state.buyableOnly}" style="${state.buyableOnly ? 'border-color:var(--active);color:var(--active)' : ''}">${icon('buyable')}Buyable only</button>
      <select class="select" id="sort" aria-label="Sort">
        ${[['name', 'Sort: Name'], ['ids', 'Sort: Active IDs'], ['updated', 'Sort: Last updated'], ['id', 'Sort: Element ID']]
          .map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      ${hasFilters() ? `<button class="ghost-btn" id="clear">Clear filters</button>` : ''}
      <span class="spacer"></span>
      <span class="result-count">${fmt(rows.length)} matching · ${fmt(activeN)} active</span>
      <button class="ghost-btn" id="export">${icon('download')}Export CSV</button>
    </div>
    <div class="list">${shown.length ? shown.map(rowHtml).join('') : emptyHtml('No audiences match', hasFilters() ? 'Try a different search, or <button class="ghost-btn" id="clear" style="display:inline-flex;margin-left:6px">Clear filters</button>' : 'Nothing in this category yet.')}</div>
    ${rows.length > state.limit ? `<div class="more-wrap"><button class="ghost-btn" id="more">Show ${Math.min(PAGE, rows.length - state.limit)} more</button></div>` : ''}
  `;
}

/* ---------------- render: root ---------------- */

function render() {
  renderChrome();
  const view = $('view');
  const err = state.error
    ? `<div class="alert">${icon('alert')}<div><strong>Couldn't load audiences from the API</strong><pre>${esc(state.error)}</pre></div></div>`
    : '';
  if (!state.data) {
    view.innerHTML = err || `<div class="grid-3">${'<div class="skeleton" style="height:200px"></div>'.repeat(3)}</div><div class="skeleton" style="height:300px"></div>`;
    return;
  }
  const searchFocused = document.activeElement?.id === 'listSearch';
  const caret = searchFocused ? document.activeElement.selectionStart : null;
  view.innerHTML = err + (state.route === 'overview' ? renderOverview() : renderList());
  if (searchFocused) {
    const s = $('listSearch');
    s?.focus();
    s?.setSelectionRange(caret, caret);
  }
}

/* ---------------- interactions ---------------- */

function exportCsv() {
  const cols = ['ThirdPartyDataId', 'ProviderId', 'ProviderElementId', 'ParentElementId', 'Category', 'IsActive', 'DisplayName', 'Description', 'Buyable', 'ActiveIDsCount', 'ReceivedIDsCount', 'AudienceSize', 'TaxonomyComplianceStatus', 'LastUpdatedAtUTC'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...filtered().map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `audiences-${state.route}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

let toastTimer;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2200);
}

function setQuery(q) {
  state.query = q;
  resetListView();
  $('sideSearch').value = q;
  if (state.route === 'overview' && q) go('all');
  else render();
}

const hasFilters = () => state.query || state.provider || state.active !== 'any' || state.compliance !== 'any' || state.buyableOnly;

function clearFilters() {
  state.active = 'any';
  state.compliance = 'any';
  state.buyableOnly = false;
}

document.addEventListener('click', (e) => {
  const t = e.target;

  const preset = t.closest('[data-preset]');
  if (preset) {
    clearFilters();
    state.provider = '';
    const p = preset.dataset.preset;
    if (p === 'buyable') state.buyableOnly = true;
    if (p === 'review') state.compliance = 'review';
    if (p === 'recent') state.sort = 'updated';
    resetListView();
    return; // the href navigates
  }

  const navLink = t.closest('.rail a, .side-nav a, .crumbs a, a.feature, a.mini');
  if (navLink) {
    if (!t.closest('.crumbs')) state.provider = '';
    resetListView();
    if (window.matchMedia('(max-width: 900px)').matches) $('app').classList.remove('show-side');
    return;
  }

  const prov = t.closest('[data-provider]');
  if (prov) {
    state.provider = state.provider === prov.dataset.provider ? '' : prov.dataset.provider;
    resetListView();
    return state.route === 'overview' ? go('all') : render();
  }

  const copyBtn = t.closest('[data-copy]');
  if (copyBtn) {
    e.stopPropagation();
    navigator.clipboard?.writeText(copyBtn.dataset.copy).then(() => toast('Copied'), () => toast('Copy failed'));
    return;
  }

  const toggle = t.closest('[data-toggle]');
  if (toggle) {
    const k = toggle.dataset.toggle;
    state.open.has(k) ? state.open.delete(k) : state.open.add(k);
    return render();
  }

  for (const name of ['active', 'compliance']) {
    const b = t.closest(`[data-${name}]`);
    if (b) {
      state[name] = b.dataset[name];
      resetListView();
      return render();
    }
  }
  if (t.closest('[data-buyable]')) {
    state.buyableOnly = !state.buyableOnly;
    resetListView();
    return render();
  }
  if (t.closest('#more')) {
    state.limit += PAGE;
    return render();
  }
  if (t.closest('#export')) return exportCsv();
  if (t.closest('#clear')) {
    clearFilters();
    state.provider = '';
    return setQuery('');
  }
});

let debounce;
document.addEventListener('input', (e) => {
  if (e.target.id !== 'listSearch' && e.target.id !== 'sideSearch') return;
  clearTimeout(debounce);
  const v = e.target.value;
  debounce = setTimeout(() => setQuery(v), 120);
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'sort') {
    state.sort = e.target.value;
    resetListView();
    render();
  }
});

function focusSearch() {
  if (state.route === 'overview') {
    go('all');
    requestAnimationFrame(() => $('listSearch')?.focus());
  } else $('listSearch')?.focus();
}
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    focusSearch();
  } else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) {
    e.preventDefault();
    focusSearch();
  } else if (e.key === 'Escape' && /listSearch|sideSearch/.test(document.activeElement?.id) && state.query) {
    setQuery('');
  }
});

$('kbd').addEventListener('click', focusSearch);
$('refresh').addEventListener('click', () => load(true));
$('railRefresh').addEventListener('click', () => load(true));

function setCollapsed(c) {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  if (mobile) {
    $('app').classList.toggle('show-side', !c);
  } else {
    $('app').classList.toggle('collapsed', c);
    try { localStorage.setItem('am.collapsed', c ? '1' : ''); } catch {}
  }
  $('expand').hidden = mobile ? false : !c;
}
$('collapse').addEventListener('click', () => setCollapsed(true));
$('expand').addEventListener('click', () => {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  setCollapsed(mobile ? $('app').classList.contains('show-side') : false);
});
try { if (localStorage.getItem('am.collapsed')) setCollapsed(true); } catch {}
if (window.matchMedia('(max-width: 900px)').matches) $('expand').hidden = false;

window.addEventListener('hashchange', () => {
  readRoute();
  render();
  $('view').scrollTop = 0;
});
setInterval(setStatus, 30_000);

readRoute();
render();
load();
