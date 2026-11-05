import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestMatcher, categorize, summarize } from '../lib/categorize.js';

const exact = buildTestMatcher(['C-10']);

test('ROOT parent is syndicated', () => {
  assert.equal(categorize({ ParentElementId: 'ROOT', ProviderElementId: '100_TEST' }, exact), 'syndicated');
});

test('CUSTOM parent is custom', () => {
  assert.equal(categorize({ ParentElementId: 'CUSTOM', ProviderElementId: 'X1' }, exact), 'custom');
});

test('C-10 is test regardless of parent', () => {
  assert.equal(categorize({ ParentElementId: 'ROOT', ProviderElementId: 'C-10' }, exact), 'test');
  assert.equal(categorize({ ParentElementId: 'CUSTOM', ProviderElementId: 'c-10' }, exact), 'test');
});

test('exact mode does not match C-101; prefix mode does', () => {
  const item = { ParentElementId: 'ROOT', ProviderElementId: 'C-101' };
  assert.equal(categorize(item, exact), 'syndicated');
  assert.equal(categorize(item, buildTestMatcher(['C-10'], 'prefix')), 'test');
});

test('unknown parent goes to other', () => {
  assert.equal(categorize({ ParentElementId: 'SOME_PARENT', ProviderElementId: 'A' }, exact), 'other');
});

test('summary counts active audiences per category', () => {
  const { summary } = summarize(
    [
      { ParentElementId: 'ROOT', ProviderElementId: 'a', ActiveIDsCount: 5, Buyable: true },
      { ParentElementId: 'ROOT', ProviderElementId: 'b', ActiveIDsCount: 0 },
      { ParentElementId: 'CUSTOM', ProviderElementId: 'c', ActiveIDsCount: null },
      { ParentElementId: 'CUSTOM', ProviderElementId: 'C-10', ActiveIDsCount: 7 },
    ],
    exact,
  );
  assert.deepEqual(summary.syndicated, { total: 2, active: 1, activeIds: 5, buyable: 1 });
  assert.deepEqual(summary.custom, { total: 1, active: 0, activeIds: 0, buyable: 0 });
  assert.deepEqual(summary.test, { total: 1, active: 1, activeIds: 7, buyable: 0 });
});
