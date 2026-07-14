// Render every (non-broken) website example through the deterministic harness,
// check determinism (render twice, diff), and write the golden-master baselines.
//
//   node vr/capture-all.mjs [--baselines]   # write to vr/baselines/ (else vr/examples/)
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import pngjs from 'pngjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EXAMPLES } from './examples.js';

const { PNG } = pngjs;
const dir = path.dirname(fileURLToPath(import.meta.url));
const toBaselines = process.argv.includes('--baselines');
const outDir = path.join(dir, toBaselines ? 'baselines' : 'examples');
const W = 800;
const H = 600;

const server = await createServer({ configFile: path.join(dir, 'vite.config.js') });
await server.listen();
const port = server.httpServer.address().port;
const base = `http://localhost:${port}`;
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});

async function shot(name, frames) {
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${base}/?example=${name}&frames=${frames}&seed=nebula&w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__vrDone || window.__vrError, undefined, {
    polling: 100,
    timeout: 30000,
  });
  const err = await page.evaluate(() => window.__vrError);
  const buf = err ? null : await page.locator('#c').screenshot();
  await page.close();
  if (err) throw new Error(err.split('\n')[0]);
  return buf;
}

fs.mkdirSync(outDir, { recursive: true });
const results = [];

for (const [name, spec] of Object.entries(EXAMPLES)) {
  if (spec.broken) {
    results.push({ name, status: 'skipped (repair item)' });
    continue;
  }
  try {
    const a = await shot(name, spec.frames);
    const b = await shot(name, spec.frames);
    const pa = PNG.sync.read(a);
    const pb = PNG.sync.read(b);
    const diff = new PNG({ width: pa.width, height: pa.height });
    const mismatch = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, {
      threshold: 0.1,
    });
    fs.writeFileSync(path.join(outDir, `${name}.png`), a);
    const pct = ((mismatch / (pa.width * pa.height)) * 100).toFixed(4);
    results.push({ name, status: mismatch === 0 ? 'deterministic ✓' : `NONDETERMINISTIC ${mismatch}px (${pct}%)` });
  } catch (e) {
    results.push({ name, status: `ERROR: ${e.message}` });
  }
}

await browser.close();
await server.close();

console.log(`\n=== ${toBaselines ? 'baselines' : 'examples'} → ${outDir} ===`);
for (const r of results) console.log(`  ${r.name.padEnd(24)} ${r.status}`);
