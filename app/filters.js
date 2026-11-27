// Search, category, store, minimum discount, and verdict filtering + hash query state.

import { discountPercent, savedDollars } from './sort.js';

export const DEFAULT_FILTERS = {
  query: '',
  category: 'All',
  store: 'All',
  minDiscount: 0,
  trueOnly: false,
  sort: 'discount-desc',
};

export function uniqueCategories(deals) {
  const counts = new Map();
  for (const d of deals) counts.set(d.category, (counts.get(d.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function uniqueStores(deals) {
  const counts = new Map();
  for (const d of deals) counts.set(d.store, (counts.get(d.store) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function filterDeals(deals, state) {
  const q = (state.query || '').trim().toLowerCase();
  const minD = Number(state.minDiscount) || 0;
  return deals.filter((d) => {
    if (state.category && state.category !== 'All' && d.category !== state.category) return false;
    if (state.store && state.store !== 'All' && d.store !== state.store) return false;
    if (minD > 0 && discountPercent(d) < minD) return false;
    if (state.trueOnly && d.verdict !== 'True deal') return false;
    if (q) {
      const hay = `${d.title} ${d.store} ${d.category} ${d.verdict} ${d.source} ${d.condition || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function summarizeDeals(deals) {
  const total = deals.length;
  const stores = new Set(deals.map((d) => d.store)).size;
  const trueCount = deals.filter((d) => d.verdict === 'True deal').length;
  const inflatedCount = deals.filter((d) => d.verdict === 'Inflated was-price').length;
  const avgDiscount = total ? Math.round(deals.reduce((s, d) => s + discountPercent(d), 0) / total) : 0;
  const topDeal = deals.reduce((best, d) => (!best || savedDollars(d) > savedDollars(best) ? d : best), null);
  return { total, stores, trueCount, inflatedCount, avgDiscount, topDeal };
}

export function parseHomeQuery(hash) {
  const idx = hash.indexOf('?');
  if (idx < 0) return { ...DEFAULT_FILTERS };
  const params = new URLSearchParams(hash.slice(idx + 1));
  return {
    query: params.get('q') ?? '',
    category: params.get('category') ?? 'All',
    store: params.get('store') ?? 'All',
    minDiscount: Number(params.get('minDiscount') ?? 0) || 0,
    trueOnly: params.get('trueOnly') === '1',
    sort: params.get('sort') ?? 'discount-desc',
  };
}

export function buildHomeHash(state) {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q', state.query.trim());
  if (state.category !== 'All') params.set('category', state.category);
  if (state.store !== 'All') params.set('store', state.store);
  if (Number(state.minDiscount) > 0) params.set('minDiscount', String(state.minDiscount));
  if (state.trueOnly) params.set('trueOnly', '1');
  if (state.sort && state.sort !== 'discount-desc') params.set('sort', state.sort);
  const qs = params.toString();
  return qs ? `#/?${qs}` : '#/';
}
