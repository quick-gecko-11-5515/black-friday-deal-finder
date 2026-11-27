// Entry hand-in script for PriceAudit (Black Friday 2026 Deal Finder).
// Copies static site assets (app/) and browser captures (screenshots/) into the output directory
// and emits a deterministic dossier.json via the unchanged kit library in vendor/makefun-frontend.ts.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function packageEntry(): void {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  const appSource = join(repoRoot, 'app');
  const shotsSource = join(repoRoot, 'screenshots');

  mkdirSync(outputDir, { recursive: true });
  cpSync(appSource, join(outputDir, 'app'), { recursive: true });

  const shotsDest = join(outputDir, 'screenshots');
  mkdirSync(shotsDest, { recursive: true });
  if (existsSync(shotsSource)) {
    cpSync(shotsSource, shotsDest, { recursive: true });
  }

  const dossierBytes = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
}

packageEntry();
