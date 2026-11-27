// Methodology & full source audit ledger — dynamically loaded on #/method.

import { CHECKED_DATE_LABEL, LAST_AUDIT_UTC, VERDICT_META } from './data.js';
import { discountPercent, savedDollars } from './sort.js';
import { esc, fmtUtcShort, money } from './views.js';

export function renderMethodPage(deals) {
  const verdictCards = Object.entries(VERDICT_META)
    .map(([label, meta]) => {
      const count = deals.filter((d) => d.verdict === label).length;
      return `<div class="method-card verdict-border-${meta.slug}">
        <div class="method-card-top">
          <span class="verdict verdict-${meta.slug}">${meta.icon} ${esc(meta.short)}</span>
          <strong>${count} deals</strong>
        </div>
        <p>${esc(meta.meaning)}</p>
      </div>`;
    })
    .join('');

  const rows = deals
    .map((d) => {
      const v = VERDICT_META[d.verdict] || { slug: 'routine', icon: '•', short: d.verdict };
      return `<tr>
        <td><a href="#/deal/${encodeURIComponent(d.id)}"><strong>${esc(d.title)}</strong></a></td>
        <td>${esc(d.store)}</td>
        <td class="num">${money(d.price)} <s class="cmp-was">${money(d.was)}</s></td>
        <td class="num">-${discountPercent(d)}% (${money(savedDollars(d))})</td>
        <td><span class="verdict verdict-${v.slug}">${v.icon} ${esc(v.short)}</span></td>
        <td class="num">${fmtUtcShort(d.checked)}</td>
        <td><a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.source)} ↗</a></td>
      </tr>`;
    })
    .join('');

  return `<section class="page-intro">
    <p class="crumb"><a href="#/">← Back to all deals</a></p>
    <h1>Verification Method &amp; Source Ledger</h1>
    <p class="lead">Every listing on PriceAudit was checked on <strong>${esc(CHECKED_DATE_LABEL)}</strong> (latest UTC pass: ${fmtUtcShort(LAST_AUDIT_UTC)}). We never accept list-price discounts at face value—when an advertised "was" price sits above typical street pricing, we flag it openly.</p>
  </section>

  <section class="panel">
    <h2>How we assign deal verdicts</h2>
    <div class="method-grid">${verdictCards}</div>
    <ul class="method-rules">
      <li><strong>Math check:</strong> Every percentage off and dollar savings figure is calculated strictly from the verified sale price and usual price.</li>
      <li><strong>Same-day verification:</strong> All ${deals.length} prices were read directly from live Black Friday 2026 store coverage on Nov 27, 2026 (UTC).</li>
      <li><strong>Cross-store parity:</strong> When multiple major retailers discount the same SKU (such as AirPods Pro 3, Beats Studio Pro, MacBook Air M5, LG C6 OLED, and DeWalt 5.0Ah battery packs), we list each offer separately so shoppers can pick the lowest out-of-pocket total.</li>
    </ul>
  </section>

  <section class="panel">
    <h2>Full source ledger (${deals.length} checked deals)</h2>
    <div class="table-wrap">
      <table class="cmp-table ledger-table">
        <thead>
          <tr><th>Product</th><th>Store</th><th class="num">Sale / Usual</th><th class="num">Discount</th><th>Verdict</th><th class="num">Checked</th><th>Source</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}
