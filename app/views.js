// HTML rendering for header, home deal finder, deal cards, and deal detail pages.

import { CHECKED_DATE_LABEL, LAST_AUDIT_UTC, VERDICT_META } from './data.js';
import { comparisonGroups, peersForDeal, renderPeerComparison } from './compare.js';
import { summarizeDeals, uniqueCategories, uniqueStores } from './filters.js';
import { discountPercent, savedDollars, SORT_OPTIONS } from './sort.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function money(n) {
  return Number.isInteger(n)
    ? `$${n.toLocaleString('en-US')}`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtUtcShort(iso) {
  const d = new Date(iso);
  const mon = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${mon} ${day}, ${hh}:${mm} UTC`;
}

export function fmtUtcFull(iso) {
  return `${new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
}

export function renderHeader(deals, route) {
  const cmpCount = comparisonGroups(deals).length;
  return `<div class="shell header-bar">
    <a class="brand" href="#/">
      <span class="brand-mark" aria-hidden="true">✓</span>
      <span class="brand-text">
        <strong>PriceAudit</strong>
        <small>Black Friday 2026 Deal Ledger</small>
      </span>
    </a>
    <nav class="main-nav" aria-label="Primary">
      <a href="#/" class="${route === 'home' || route === 'deal' ? 'active' : ''}">Deals <span class="nav-count">${deals.length}</span></a>
      <a href="#/compare" class="${route === 'compare' ? 'active' : ''}">Compare <span class="nav-count">${cmpCount}</span></a>
      <a href="#/method" class="${route === 'method' ? 'active' : ''}">Sources &amp; Method</a>
    </nav>
    <div class="audit-stamp" title="Latest UTC audit timestamp">
      <span class="pulse-dot" aria-hidden="true"></span>
      Checked ${esc(CHECKED_DATE_LABEL)} · ${fmtUtcShort(LAST_AUDIT_UTC).split(', ')[1]}
    </div>
  </div>`;
}

export function renderDealCards(shown, allDeals) {
  if (shown.length === 0) {
    return `<div class="empty-state">
      <h3>No deals match those filters</h3>
      <p>Try lowering the minimum discount, clearing the search term, or switching back to all categories.</p>
      <button type="button" class="btn-reset" data-action="reset-filters">Reset all filters</button>
    </div>`;
  }

  return shown
    .map((d) => {
      const pct = discountPercent(d);
      const saved = savedDollars(d);
      const v = VERDICT_META[d.verdict] || { slug: 'routine', icon: '•', short: d.verdict };
      const peers = peersForDeal(allDeals, d);
      const isBestPeer = peers.length > 1 && peers[0].price === d.price;
      const peerTag = peers.length > 1
        ? `<a class="peer-pill ${isBestPeer ? 'peer-best' : ''}" href="#/deal/${encodeURIComponent(d.id)}">${isBestPeer ? `Best of ${peers.length} stores` : `Compare ${peers.length} stores`}</a>`
        : '';

      return `<article class="deal-card verdict-border-${v.slug}">
        <div class="card-top">
          <div class="card-tags">
            <span class="store-badge">${esc(d.store)}</span>
            <span class="cat-pill">${esc(d.category)}</span>
          </div>
          <span class="verdict verdict-${v.slug}" title="${esc(v.meaning)}">${v.icon} ${esc(v.short)}</span>
        </div>
        <h3 class="card-title"><a href="#/deal/${encodeURIComponent(d.id)}">${esc(d.title)}</a></h3>
        <div class="price-row">
          <span class="price-now">${money(d.price)}</span>
          <s class="price-was">${money(d.was)}</s>
          <span class="discount-pill">-${pct}%</span>
          <span class="saved-text">Save ${money(saved)}</span>
        </div>
        <p class="card-evidence">${esc(d.verdictEvidence)}</p>
        ${d.condition || peerTag ? `<div class="card-perks">${peerTag}${d.condition ? `<span class="cond-tag">${esc(d.condition)}</span>` : ''}</div>` : ''}
        <div class="card-meta">
          <span>Checked ${fmtUtcShort(d.checked)}</span>
          <span class="meta-sep">·</span>
          <span class="meta-src">${esc(d.source)}</span>
        </div>
        <div class="card-actions">
          <a class="btn-detail" href="#/deal/${encodeURIComponent(d.id)}">Audit &amp; history</a>
          <a class="btn-store" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">View at ${esc(d.store)} ↗</a>
        </div>
      </article>`;
    })
    .join('');
}

export function renderActiveBar(shownCount, totalCount, state) {
  const parts = [];
  if (state.query.trim()) parts.push(`Search: "${state.query.trim()}"`);
  if (state.category !== 'All') parts.push(`Category: ${state.category}`);
  if (state.store !== 'All') parts.push(`Store: ${state.store}`);
  if (Number(state.minDiscount) > 0) parts.push(`${state.minDiscount}%+ off`);
  if (state.trueOnly) parts.push('True deals only');
  const sortLabel = SORT_OPTIONS.find((s) => s.id === state.sort)?.label || 'Biggest discount (%)';

  return `<div class="results-bar">
    <div class="results-text">
      <strong>Showing ${shownCount} of ${totalCount} verified deals</strong>
      ${parts.length ? `<span class="active-pills">${parts.map((p) => `<span class="active-pill">${esc(p)}</span>`).join('')}</span>` : ''}
      <span class="sort-readout">Sorted by ${esc(sortLabel)}</span>
    </div>
    ${parts.length || state.sort !== 'discount-desc' ? '<button type="button" class="btn-clear" data-action="reset-filters">Clear filters</button>' : ''}
  </div>`;
}

export function renderHome(allDeals, shownDeals, state) {
  const stats = summarizeDeals(allDeals);
  const categories = uniqueCategories(allDeals);
  const stores = uniqueStores(allDeals);
  const cmpCount = comparisonGroups(allDeals).length;

  const chips = [
    `<button type="button" class="chip ${state.category === 'All' ? 'active' : ''}" data-category="All">All <span>${allDeals.length}</span></button>`,
    ...categories.map(
      ([cat, n]) =>
        `<button type="button" class="chip ${state.category === cat ? 'active' : ''}" data-category="${esc(cat)}">${esc(cat)} <span>${n}</span></button>`,
    ),
  ].join('');

  const storeOpts = [
    `<option value="All">All stores (${stores.length})</option>`,
    ...stores.map(([s, n]) => `<option value="${esc(s)}" ${state.store === s ? 'selected' : ''}>${esc(s)} (${n})</option>`),
  ].join('');

  const discountOpts = [0, 20, 30, 40, 50]
    .map((v) => `<option value="${v}" ${Number(state.minDiscount) === v ? 'selected' : ''}>${v === 0 ? 'Any discount' : `${v}%+ off`}</option>`)
    .join('');

  const sortOpts = SORT_OPTIONS.map((o) => `<option value="${o.id}" ${state.sort === o.id ? 'selected' : ''}>${esc(o.label)}</option>`).join('');

  return `<section class="summary-strip" aria-label="Deal audit overview">
    <div class="kpi"><span class="kpi-val">${stats.total}</span><span class="kpi-lbl">Verified deals</span></div>
    <div class="kpi"><span class="kpi-val">${stats.stores}</span><span class="kpi-lbl">Major stores</span></div>
    <div class="kpi"><span class="kpi-val">${stats.avgDiscount}%</span><span class="kpi-lbl">Avg discount</span></div>
    <div class="kpi kpi-true"><span class="kpi-val">${stats.trueCount}</span><span class="kpi-lbl">True deals</span></div>
    <div class="kpi kpi-flag"><span class="kpi-val">${stats.inflatedCount}</span><span class="kpi-lbl">Inflated flagged</span></div>
    <a class="kpi kpi-link" href="#/compare"><span class="kpi-val">${cmpCount}</span><span class="kpi-lbl">Cross-store compares →</span></a>
  </section>

  <section class="controls-box" aria-label="Search and filter deals">
    <div class="controls-row">
      <label class="search-field">
        <span class="sr-only">Search deals</span>
        <input id="f-query" type="search" value="${esc(state.query)}" placeholder="Search product, brand, or store (e.g. OLED, AirPods, DeWalt)..." autocomplete="off">
      </label>
      <label class="select-field">
        <span>Store</span>
        <select id="f-store">${storeOpts}</select>
      </label>
      <label class="select-field">
        <span>Discount</span>
        <select id="f-discount">${discountOpts}</select>
      </label>
      <label class="select-field">
        <span>Sort</span>
        <select id="f-sort">${sortOpts}</select>
      </label>
      <label class="toggle-field">
        <input id="f-true" type="checkbox" ${state.trueOnly ? 'checked' : ''}>
        <span>True deals only</span>
      </label>
    </div>
    <div class="chip-row" role="group" aria-label="Filter by category">${chips}</div>
  </section>

  <div id="results-meta">${renderActiveBar(shownDeals.length, allDeals.length, state)}</div>
  <section class="deal-grid" id="deal-grid" aria-label="Black Friday deals">${renderDealCards(shownDeals, allDeals)}</section>`;
}

export function renderDealDetail(deal, allDeals) {
  const pct = discountPercent(deal);
  const saved = savedDollars(deal);
  const v = VERDICT_META[deal.verdict] || { slug: 'routine', icon: '•', short: deal.verdict, meaning: '' };
  const peerHtml = renderPeerComparison(allDeals, deal);

  return `<section class="detail-wrap">
    <p class="crumb"><a href="#/">← Back to all deals</a> <span>/</span> <a href="#/?category=${encodeURIComponent(deal.category)}">${esc(deal.category)}</a></p>

    <article class="panel detail-hero verdict-border-${v.slug}">
      <div class="detail-top">
        <div class="card-tags">
          <span class="store-badge">${esc(deal.store)}</span>
          <span class="cat-pill">${esc(deal.category)}</span>
        </div>
        <span class="verdict verdict-lg verdict-${v.slug}">${v.icon} ${esc(v.short)}</span>
      </div>

      <h1>${esc(deal.title)}</h1>

      <div class="detail-price-box">
        <div class="detail-price-main">
          <span class="detail-now">${money(deal.price)}</span>
          <span class="detail-was-stack">
            <span class="detail-was-lbl">Usual price</span>
            <s>${money(deal.was)}</s>
          </span>
          <span class="detail-cut">-${pct}% · Save ${money(saved)}</span>
        </div>
        <div class="detail-cta-col">
          <a class="btn-store-lg" href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer">Open deal at ${esc(deal.store)} ↗</a>
          ${deal.condition ? `<span class="cond-tag">${esc(deal.condition)}</span>` : ''}
        </div>
      </div>

      <div class="evidence-grid">
        <div class="evidence-box">
          <h2>Is it really a deal?</h2>
          <p class="evidence-lead">${esc(deal.verdictEvidence)}</p>
          <p class="verdict-def"><strong>${esc(v.short)}:</strong> ${esc(v.meaning)}</p>
        </div>

        <dl class="audit-dl">
          <dt>Retailer</dt><dd>${esc(deal.store)}</dd>
          <dt>Price math</dt><dd>${money(deal.was)} − ${money(deal.price)} = ${money(saved)} saved (${pct}% off)</dd>
          <dt>Checked (UTC)</dt><dd>${fmtUtcFull(deal.checked)}</dd>
          <dt>Price source</dt><dd><a href="${esc(deal.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(deal.source)} ↗</a></dd>
          <dt>Store link</dt><dd><a href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer">${esc(deal.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 62))}…</a></dd>
        </dl>
      </div>
    </article>

    ${peerHtml}
  </section>`;
}

export function renderMissing() {
  return `<section class="panel empty-state">
    <h1>Deal not found</h1>
    <p>That deal address does not match any verified item in our Black Friday 2026 ledger.</p>
    <p><a class="btn-store" href="#/">Return to all deals</a></p>
  </section>`;
}
