const CATS = {
  all: { label: 'All', color: 'var(--accent)' },
  syndicated: { label: 'Syndicated', color: 'var(--syndicated)' },
  custom: { label: 'Custom', color: 'var(--custom)' },
  test: { label: 'Test', color: 'var(--test)' },
  other: { label: 'Other', color: 'var(--other)' },
};
const PAGE = 200;

const state = { data: null, tab: 'all', query: '', activeOnly: false, sortKey: 'DisplayName', sortDir: 'asc', limit: PAGE };
const $ = (id) => document.getElementById(id);
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function highlight(text, q) {
  const safe = esc(text);
  if (!q) return safe;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return safe.replace(re, '<mark>$1</mark>');
}

async function load(refresh = false) {
  $('refresh').disabled = true;
  $('meta').textContent = refresh ? 'Calling Trade Desk API…' : 'Loading…';
  $('error').hidden = true;
  try {
    const res = await fetch(`/api/audiences${refresh ? '?refresh=1' : ''}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    state.data = json;
    $('meta').textContent = `${json.rows.length.toLocaleString()} segments · source: ${json.source} · fetched ${new Date(json.fetchedAt).toLocaleString()}`;
    render();
  } catch (e) {
    $('error').textContent = `Failed to load audiences: ${e.message}`;
    $('error').hidden = false;
    $('meta').textContent = 'Load failed';
  } finally {
    $('refresh').disabled = false;
  }
}

function renderCards() {
  const s = state.data.summary;
  const all = Object.values(s).reduce(
    (a, c) => ({ total: a.total + c.total, active: a.active + c.active, activeIds: a.activeIds + c.activeIds, buyable: a.buyable + c.buyable }),
    { total: 0, active: 0, activeIds: 0, buyable: 0 },
  );
  const entries = [['all', all], ...Object.entries(s).filter(([k, v]) => k !== 'other' || v.total > 0)];
  $('cards').innerHTML = entries
    .map(([key, v]) => {
      const pct = v.total ? Math.round((v.active / v.total) * 100) : 0;
      return `<button class="card" style="--c:${CATS[key].color}" data-tab="${key}" aria-pressed="${state.tab === key}">
        <h2>${CATS[key].label}</h2>
        <div class="big">${fmt(v.active)} <small>active / ${fmt(v.total)} total</small></div>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="sub">${pct}% active · ${fmt(v.activeIds)} active IDs · ${fmt(v.buyable)} buyable</div>
      </button>`;
    })
    .join('');
}

function renderTabs() {
  const s = state.data.summary;
  const keys = ['all', 'syndicated', 'custom', 'test', ...(s.other.total ? ['other'] : [])];
  const total = state.data.rows.length;
  $('tabs').innerHTML = keys
    .map((k) => `<button role="tab" data-tab="${k}" aria-selected="${state.tab === k}">${CATS[k].label} (${fmt(k === 'all' ? total : s[k].total)})</button>`)
    .join('');
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  let rows = state.data.rows;
  if (state.tab !== 'all') rows = rows.filter((r) => r.Category === state.tab);
  if (state.activeOnly) rows = rows.filter((r) => r.IsActive);
  if (q) {
    rows = rows.filter(
      (r) => String(r.DisplayName ?? '').toLowerCase().includes(q) || String(r.ProviderElementId ?? '').toLowerCase().includes(q),
    );
  }
  const { sortKey: k, sortDir } = state;
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[k], y = b[k];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    if (typeof x === 'number' || typeof x === 'boolean') return (Number(x) - Number(y)) * dir;
    return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' }) * dir;
  });
}

function renderTable() {
  const rows = filtered();
  const q = state.query.trim();
  const shown = rows.slice(0, state.limit);
  const active = rows.filter((r) => r.IsActive).length;
  $('count').textContent = `Showing ${fmt(shown.length)} of ${fmt(rows.length)} matching segments · ${fmt(active)} active`;
  $('rows').innerHTML = shown.length
    ? shown
        .map(
          (r) => `<tr>
        <td>${highlight(r.DisplayName, q)}<div class="desc">${esc(r.Description)}</div></td>
        <td><code>${highlight(r.ProviderElementId, q)}</code></td>
        <td><span class="pill" style="--c:${CATS[r.Category].color}">${CATS[r.Category].label}</span></td>
        <td><span class="dot" style="--c:${r.IsActive ? 'var(--active)' : 'var(--inactive)'}">${r.IsActive ? 'Active' : 'Inactive'}</span></td>
        <td class="num">${fmt(r.ActiveIDsCount)}</td>
        <td class="num">${fmt(r.ReceivedIDsCount)}</td>
        <td>${r.Buyable ? 'Yes' : 'No'}</td>
        <td>${esc(r.TaxonomyComplianceStatus ?? '—')}</td>
        <td>${esc((r.LastUpdatedAtUTC ?? '—').replace('T', ' '))}</td>
      </tr>`,
        )
        .join('')
    : `<tr><td colspan="9" class="empty">No segments match.</td></tr>`;
  $('more').hidden = rows.length <= state.limit;
  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.dataset.dir = th.dataset.sort === state.sortKey ? state.sortDir : '';
  });
}

function render() {
  if (!state.data) return;
  renderCards();
  renderTabs();
  renderTable();
}

function exportCsv() {
  const cols = ['ThirdPartyDataId', 'ProviderId', 'ProviderElementId', 'ParentElementId', 'Category', 'IsActive', 'DisplayName', 'Description', 'Buyable', 'ActiveIDsCount', 'ReceivedIDsCount', 'AudienceSize', 'TaxonomyComplianceStatus', 'LastUpdatedAtUTC'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...filtered().map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `audiences-${state.tab}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function setTab(tab) {
  state.tab = tab;
  state.limit = PAGE;
  render();
}

document.addEventListener('click', (e) => {
  const tabEl = e.target.closest('[data-tab]');
  if (tabEl) return setTab(tabEl.dataset.tab);
  const th = e.target.closest('th[data-sort]');
  if (th) {
    const key = th.dataset.sort;
    state.sortDir = state.sortKey === key && state.sortDir === 'asc' ? 'desc' : 'asc';
    state.sortKey = key;
    renderTable();
  }
});

let t;
$('search').addEventListener('input', (e) => {
  clearTimeout(t);
  t = setTimeout(() => {
    state.query = e.target.value;
    state.limit = PAGE;
    renderTable();
  }, 120);
});
$('activeOnly').addEventListener('change', (e) => {
  state.activeOnly = e.target.checked;
  state.limit = PAGE;
  renderTable();
});
$('more').addEventListener('click', () => {
  state.limit += PAGE;
  renderTable();
});
$('refresh').addEventListener('click', () => load(true));
$('export').addEventListener('click', exportCsv);

load();
