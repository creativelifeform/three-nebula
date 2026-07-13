// The VR gate: re-render every example and diff against the committed golden
// master (vr/baselines/). Renders on one machine (the M1) and tolerance-diffs,
// exactly like gs — a small tolerance absorbs the software-rasteriser noise
// floor. Exits non-zero on any regression; writes diff images to vr/diff/.
//
//   node vr/diff.mjs
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
const baseDir = path.join(dir, 'baselines');
const diffDir = path.join(dir, 'diff');
const W = 800;
const H = 600;

// Max fraction of pixels allowed to differ per image. Same-machine renders are
// deterministic (~0), so this only absorbs rasteriser noise, not real change.
const TOLERANCE = 0.001;

const server = await createServer({ configFile: path.join(dir, 'vite.config.js') });
await server.listen();
const port = server.httpServer.address().port;
const base = `http://localhost:${port}`;
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});

async function render(name, frames) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
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

fs.rmSync(diffDir, { recursive: true, force: true });
fs.mkdirSync(diffDir, { recursive: true });

const failures = [];

for (const [name, spec] of Object.entries(EXAMPLES)) {
  if (spec.broken) continue;
  const basePath = path.join(baseDir, `${name}.png`);
  if (!fs.existsSync(basePath)) {
    failures.push(`${name}: no baseline (run vr:baseline)`);
    continue;
  }
  try {
    const cur = await render(name, spec.frames);
    const a = PNG.sync.read(fs.readFileSync(basePath));
    const b = PNG.sync.read(cur);
    if (a.width !== b.width || a.height !== b.height) {
      failures.push(`${name}: size ${b.width}x${b.height} vs baseline ${a.width}x${a.height}`);
      continue;
    }
    const diff = new PNG({ width: a.width, height: a.height });
    const mismatch = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
    const frac = mismatch / (a.width * a.height);
    if (frac > TOLERANCE) {
      fs.writeFileSync(path.join(diffDir, `${name}.png`), PNG.sync.write(diff));
      failures.push(`${name}: ${mismatch}px (${(frac * 100).toFixed(3)}%) > tolerance`);
    }
  } catch (e) {
    failures.push(`${name}: ERROR ${e.message}`);
  }
}

await browser.close();
await server.close();

if (failures.length) {
  console.error('\nVR regressions:');
  for (const f of failures) console.error(`  ${f}`);
  console.error(`\nDiff images in ${diffDir}/. If intentional, review then re-baseline (vr:baseline).`);
  process.exit(1);
}
console.log('\nVR: all examples within tolerance of the golden master.');
