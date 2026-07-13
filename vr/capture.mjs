// Render a website example twice via the deterministic harness and pixel-diff
// the two captures. This proves determinism (a good build → diff ≈ 0) before we
// scale to all examples + a committed golden master.
//
//   node vr/capture.mjs [Example] [frames]
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import pngjs from 'pngjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { PNG } = pngjs;
const dir = path.dirname(fileURLToPath(import.meta.url));

const example = process.argv[2] || 'SpriteRendererGravity';
const frames = Number(process.argv[3] || 120);
const W = 800;
const H = 600;

const server = await createServer({ configFile: path.join(dir, 'vite.config.js') });
await server.listen();
const port = server.httpServer.address().port;
const base = `http://localhost:${port}`;

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});

async function shot() {
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });
  await page.goto(
    `${base}/?example=${example}&frames=${frames}&seed=nebula&w=${W}&h=${H}`
  );
  await page.waitForFunction(() => window.__vrDone || window.__vrError, {
    timeout: 30000,
  });
  const err = await page.evaluate(() => window.__vrError);
  if (err) throw new Error(`harness error:\n${err}`);
  const buf = await page.locator('#c').screenshot();
  await page.close();
  return buf;
}

const out = path.join(dir, 'examples');
fs.mkdirSync(out, { recursive: true });

try {
  const a = await shot();
  const b = await shot();
  fs.writeFileSync(path.join(out, `${example}-a.png`), a);
  fs.writeFileSync(path.join(out, `${example}-b.png`), b);

  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  const diff = new PNG({ width: pa.width, height: pa.height });
  const mismatch = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, {
    threshold: 0.1,
  });
  fs.writeFileSync(path.join(out, `${example}-diff.png`), PNG.sync.write(diff));

  const total = pa.width * pa.height;
  console.log(
    `\nDETERMINISM ${example}: ${mismatch}/${total} px differ ` +
      `(${((mismatch / total) * 100).toFixed(4)}%) over 2 renders @ ${frames} frames`
  );
} finally {
  await browser.close();
  await server.close();
}
