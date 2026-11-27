# PriceAudit — Verified Black Friday 2026 Deal Finder

[![Black Friday Deal Finder Bounty](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Current Rank](https://make.fun/badge/black-friday-deal-finder-01/quick-gecko-11-5515/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Current Reward](https://make.fun/badge/black-friday-deal-finder-01/quick-gecko-11-5515/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

**PriceAudit** is a zero-dependency, offline-ready Black Friday & Cyber Monday 2026 deal finder built with vanilla ES modules and static HTML/CSS under `app/`. Every listing was verified on **November 27, 2026 (UTC)** with sale price, usual price, computed discount percentage and dollar savings, direct retailer link, source citation, and an honest deal-quality verdict (`True deal`, `Strong deal`, `Routine sale`, or `Inflated was-price`).

## Features

- **36 verified Black Friday 2026 deals** across **9 categories** (`Audio`, `TVs`, `Laptops`, `Kitchen`, `Smart Home`, `Toys`, `Fitness`, `Tools`, `Fashion`) and **8 major stores** (`Amazon`, `Best Buy`, `Walmart`, `Target`, `Home Depot`, `Lowe's`, `Costco`, `Kohl's`).
- **Live search, filtering & sorting:** search by product/store/source, filter by category chips, store, minimum discount percentage, or "True deals only", and sort by verdict, discount %, dollars saved, lowest price, or check time.
- **Cross-store comparison (`#/compare` and deal detail pages):** side-by-side price checks for identical products offered at multiple stores with the cheapest option highlighted.
- **Transparent audit trail (`#/method`):** dynamically loaded methodology and full source ledger listing every deal's UTC verification timestamp and source.

## Run locally

```bash
node serve.ts
# Open http://localhost:8080
```

## Build dossier

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
