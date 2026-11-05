// Classifies Trade Desk third-party data segments into dashboard categories.
//
// Rules (first match wins):
//   1. ProviderElementId matches one of TEST_ELEMENT_IDS  -> "test"
//   2. ParentElementId === "ROOT"                         -> "syndicated"
//   3. ParentElementId === "CUSTOM"                       -> "custom"
//   4. anything else                                      -> "other"

export const CATEGORIES = ['syndicated', 'custom', 'test', 'other'];

export function buildTestMatcher(ids = ['C-10'], mode = 'exact') {
  const wanted = ids.map((s) => s.trim().toUpperCase()).filter(Boolean);
  return (providerElementId) => {
    const id = String(providerElementId ?? '').trim().toUpperCase();
    if (!id) return false;
    return wanted.some((w) =>
      mode === 'prefix' ? id.startsWith(w) : mode === 'contains' ? id.includes(w) : id === w,
    );
  };
}

export function categorize(item, isTest) {
  if (isTest(item.ProviderElementId)) return 'test';
  const parent = String(item.ParentElementId ?? '').trim().toUpperCase();
  if (parent === 'ROOT') return 'syndicated';
  if (parent === 'CUSTOM') return 'custom';
  return 'other';
}

export function isActive(item) {
  return Number(item.ActiveIDsCount) > 0;
}

export function summarize(items, isTest) {
  const summary = Object.fromEntries(
    CATEGORIES.map((c) => [c, { total: 0, active: 0, activeIds: 0, buyable: 0 }]),
  );
  const rows = items.map((item) => {
    const category = categorize(item, isTest);
    const active = isActive(item);
    const s = summary[category];
    s.total += 1;
    if (active) s.active += 1;
    s.activeIds += Number(item.ActiveIDsCount) || 0;
    if (item.Buyable) s.buyable += 1;
    return { ...item, Category: category, IsActive: active };
  });
  return { summary, rows };
}
