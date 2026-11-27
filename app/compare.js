// Cross-store comparison grouping and side-by-side renderer.

import { VERDICT_META } from './data.js';
import { discountPercent, savedDollars } from './sort.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const money = (n) => (Number.isInteger(n) ? `$${n.toLocaleString('en-US')}` : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

export function comparisonGroups(deals) {
  const map = new Map();
  for (const d of deals) {
    if (!d.group) continue;
    if (!map.has(d.group)) map.set(d.group, { key: d.group, title: d.groupTitle || d.title, category: d.category, offers: [] });
    map.get(d.group).offers.push(d);
  }
  const groups = [];
  for (const g of map.values()) {
    if (g.offers.length < 2) continue;
    g.offers.sort((a, b) => a.price - b.price || a.store.localeCompare(b.store));
    g.lowest = g.offers[0].price;
    g.highest = g.offers[g.offers.length - 1].price;
    g.spread = Number((g.highest - g.lowest).toFixed(2));
    groups.push(g);
  }
  groups.sort((a, b) => b.spread - a.spread || b.offers.length - a.offers.length);
  return groups;
}

export function peersForDeal(deals, deal) {
  if (!deal.group) return [];
  return deals
    .filter((d) => d.group === deal.group)
    .sort((a, b) => a.price - b.price || a.store.localeCompare(b.store));
}

export function renderPeerComparison(deals, currentDeal) {
  const peers = peersForDeal(deals, currentDeal);
  if (peers.length < 2) return '';
  const lowest = peers[0].price;
  const rows = peers
    .map((p) => {
      const isLowest = p.price === lowest;
      const isCurrent = p.id === currentDeal.id;
      const delta = Number((p.price - lowest).toFixed(2));
      const v = VERDICT_META[p.verdict] || { slug: 'routine', icon: '•', short: p.verdict };
      return `<tr class="${isLowest ? 'cmp-best' : ''} ${isCurrent ? 'cmp-current' : ''}">
        <td>
          <strong>${esc(p.store)}</strong>
          ${isCurrent ? '<span class="tag-viewing">Viewing</span>' : ''}
          ${p.condition ? `<div class="cmp-note">${esc(p.condition)}</div>` : ''}
        </td>
        <td class="num">
          <span class="cmp-price">${money(p.price)}</span>
          <s class="cmp-was">${money(p.was)}</s>
        </td>
        <td class="num">
          ${isLowest ? '<span class="badge-lowest">Cheapest</span>' : `<span class="cmp-delta">+${money(delta)}</span>`}
        </td>
        <td><span class="verdict verdict-${v.slug}">${v.icon} ${esc(v.short)}</span></td>
        <td class="cmp-actions-cell">
          <div class="cmp-actions">
            ${isCurrent ? '' : `<a class="link-subtle" href="#/deal/${encodeURIComponent(p.id)}">Audit</a>`}
            <a class="btn-store-sm" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">View at ${esc(p.store)} ↗</a>
          </div>
        </td>
      </tr>`;
    })
    .join('');

  return `<section class="panel compare-panel">
    <div class="panel-head">
      <h2>Same product at other stores (${peers.length} verified listings)</h2>
      <a class="link-subtle" href="#/compare">Compare all multi-store products →</a>
    </div>
    <div class="table-wrap">
      <table class="cmp-table">
        <thead>
          <tr><th>Store &amp; terms</th><th class="num">Sale / Usual</th><th class="num">Difference</th><th>Verdict</th><th>Action</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}

export function renderComparePage(deals) {
  const groups = comparisonGroups(deals);
  const cards = groups
    .map((g) => {
      const rows = g.offers
        .map((o) => {
          const isBest = o.price === g.lowest;
          const diff = Number((o.price - g.lowest).toFixed(2));
          const v = VERDICT_META[o.verdict] || { slug: 'routine', icon: '•', short: o.verdict };
          return `<tr class="${isBest ? 'cmp-best' : ''}">
            <td>
              <strong>${esc(o.store)}</strong>
              ${o.condition ? `<div class="cmp-note">${esc(o.condition)}</div>` : ''}
            </td>
            <td class="num"><span class="cmp-price">${money(o.price)}</span> <s class="cmp-was">${money(o.was)}</s></td>
            <td class="num">${discountPercent(o)}% off · Save ${money(savedDollars(o))}</td>
            <td class="num">${isBest ? '<span class="badge-lowest">Cheapest</span>' : `<span class="cmp-delta">+${money(diff)}</span>`}</td>
            <td><span class="verdict verdict-${v.slug}">${v.icon} ${esc(v.short)}</span></td>
            <td class="cmp-actions-cell">
              <div class="cmp-actions">
                <a class="link-subtle" href="#/deal/${encodeURIComponent(o.id)}">Details</a>
                <a class="btn-store-sm" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">Shop ${esc(o.store)} ↗</a>
              </div>
            </td>
          </tr>`;
        })
        .join('');

      return `<article class="panel compare-card">
        <div class="panel-head">
          <div>
            <span class="cat-pill">${esc(g.category)}</span>
            <h2>${esc(g.title)}</h2>
          </div>
          <div class="spread-pill">${g.spread > 0 ? `Save up to ${money(g.spread)} by picking ${esc(g.offers[0].store)}` : `Price-matched at ${money(g.lowest)}`}</div>
        </div>
        <div class="table-wrap">
          <table class="cmp-table">
            <thead>
              <tr><th>Store &amp; terms</th><th class="num">Price</th><th class="num">Discount</th><th class="num">Spread</th><th>Verdict</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </article>`;
    })
    .join('');

  return `<section class="page-intro">
    <p class="crumb"><a href="#/">← Back to all deals</a></p>
    <h1>Cross-Store Price Comparison</h1>
    <p class="lead">The same Black Friday 2026 products checked side by side across competing retailers. Cheapest verified offer is highlighted in green.</p>
  </section>
  <div class="compare-stack">${cards}</div>`;
}
