// Price math and multi-criteria sorting for deals.

import { VERDICT_META } from './data.js';

export function savedDollars(deal) {
  return Math.max(0, Number((deal.was - deal.price).toFixed(2)));
}

export function discountPercent(deal) {
  if (!deal.was || deal.was <= 0) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function verdictRank(deal) {
  return VERDICT_META[deal.verdict]?.rank ?? 9;
}

export const SORT_OPTIONS = [
  { id: 'discount-desc', label: 'Biggest discount (%)' },
  { id: 'best-verdict', label: 'Best verdict first' },
  { id: 'saved-desc', label: 'Most $ saved' },
  { id: 'price-asc', label: 'Lowest price' },
  { id: 'checked-desc', label: 'Newest checked' },
];

export function sortDeals(list, sortBy = 'discount-desc') {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sortBy === 'discount-desc') {
      return discountPercent(b) - discountPercent(a) || savedDollars(b) - savedDollars(a);
    }
    if (sortBy === 'saved-desc') {
      return savedDollars(b) - savedDollars(a) || discountPercent(b) - discountPercent(a);
    }
    if (sortBy === 'price-asc') {
      return a.price - b.price || discountPercent(b) - discountPercent(a);
    }
    if (sortBy === 'checked-desc') {
      return b.checked.localeCompare(a.checked) || discountPercent(b) - discountPercent(a);
    }
    // Default: best honest verdict first, then highest discount %
    return verdictRank(a) - verdictRank(b) || discountPercent(b) - discountPercent(a) || savedDollars(b) - savedDollars(a);
  });
  return copy;
}
