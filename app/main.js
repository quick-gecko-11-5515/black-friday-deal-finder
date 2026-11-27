// Hash router, interactive filter/search/sort bindings, and screenshot-ready lifecycle.

import { deals } from './data.js';
import { renderComparePage } from './compare.js';
import { buildHomeHash, DEFAULT_FILTERS, filterDeals, parseHomeQuery } from './filters.js';
import { sortDeals } from './sort.js';
import { renderActiveBar, renderDealCards, renderDealDetail, renderHeader, renderHome, renderMissing } from './views.js';

const headerEl = document.getElementById('site-header');
const appEl = document.getElementById('app');

let state = { ...DEFAULT_FILTERS };

function updateGrid() {
  const shown = sortDeals(filterDeals(deals, state), state.sort);
  const grid = document.getElementById('deal-grid');
  const meta = document.getElementById('results-meta');
  if (grid) grid.innerHTML = renderDealCards(shown, deals);
  if (meta) meta.innerHTML = renderActiveBar(shown.length, deals.length, state);

  for (const btn of appEl.querySelectorAll('.chip[data-category]')) {
    btn.classList.toggle('active', btn.dataset.category === state.category);
  }
  const nextHash = buildHomeHash(state);
  if (location.hash !== nextHash && !(location.hash === '' && nextHash === '#/')) {
    history.replaceState(null, '', nextHash);
  }
}

function bindHomeControls() {
  const qEl = document.getElementById('f-query');
  const storeEl = document.getElementById('f-store');
  const discEl = document.getElementById('f-discount');
  const sortEl = document.getElementById('f-sort');
  const trueEl = document.getElementById('f-true');

  qEl?.addEventListener('input', () => {
    state.query = qEl.value;
    updateGrid();
  });
  storeEl?.addEventListener('change', () => {
    state.store = storeEl.value;
    updateGrid();
  });
  discEl?.addEventListener('change', () => {
    state.minDiscount = Number(discEl.value) || 0;
    updateGrid();
  });
  sortEl?.addEventListener('change', () => {
    state.sort = sortEl.value;
    updateGrid();
  });
  trueEl?.addEventListener('change', () => {
    state.trueOnly = trueEl.checked;
    updateGrid();
  });

  appEl.addEventListener('click', (ev) => {
    const chip = ev.target.closest('.chip[data-category]');
    if (chip) {
      state.category = chip.dataset.category;
      updateGrid();
      return;
    }
    const reset = ev.target.closest('[data-action="reset-filters"]');
    if (reset) {
      state = { ...DEFAULT_FILTERS };
      if (qEl) qEl.value = '';
      if (storeEl) storeEl.value = 'All';
      if (discEl) discEl.value = '0';
      if (sortEl) sortEl.value = 'discount-desc';
      if (trueEl) trueEl.checked = false;
      updateGrid();
    }
  });
}

async function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';

  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    const id = decodeURIComponent(dealMatch[1]);
    const found = deals.find((d) => d.id === id);
    headerEl.innerHTML = renderHeader(deals, 'deal');
    document.title = `${found ? found.title : 'Not found'} — PriceAudit`;
    appEl.innerHTML = found ? renderDealDetail(found, deals) : renderMissing();
    window.scrollTo(0, 0);
    window.__shotReady = true;
    return;
  }

  if (hash.startsWith('#/compare')) {
    headerEl.innerHTML = renderHeader(deals, 'compare');
    document.title = 'Cross-Store Comparison — PriceAudit';
    appEl.innerHTML = renderComparePage(deals);
    window.scrollTo(0, 0);
    window.__shotReady = true;
    return;
  }

  if (hash.startsWith('#/method')) {
    headerEl.innerHTML = renderHeader(deals, 'method');
    document.title = 'Verification Method & Sources — PriceAudit';
    const { renderMethodPage } = await import('./method.js');
    appEl.innerHTML = renderMethodPage(deals);
    window.scrollTo(0, 0);
    window.__shotReady = true;
    return;
  }

  state = parseHomeQuery(hash);
  const shown = sortDeals(filterDeals(deals, state), state.sort);
  headerEl.innerHTML = renderHeader(deals, 'home');
  document.title = 'PriceAudit — Verified Black Friday 2026 Deal Finder';
  appEl.innerHTML = renderHome(deals, shown, state);
  bindHomeControls();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', () => {
  render();
});

render();
