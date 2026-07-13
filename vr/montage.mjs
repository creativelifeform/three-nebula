// Compose the captured example PNGs into a single labelled grid for review.
//
//   node vr/montage.mjs [examples|baselines]
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, process.argv[2] || 'examples');
const files = fs.readdirSync(src).filter(f => f.endsWith('.png') && f !== 'montage.png').sort();

const cells = files
  .map(f => {
    const b64 = fs.readFileSync(path.join(src, f)).toString('base64');
    return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${f.replace('.png', '')}</figcaption></figure>`;
  })
  .join('');

const html = `<html><body style="margin:0;background:#1b1b1b;color:#ddd;font-family:sans-serif">
  <h2 style="padding:12px;margin:0;color:#7fd1ff">three-nebula VR — ${path.basename(src)} <span style="color:#888;font-weight:normal">(${files.length})</span></h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px">${cells}</div>
  <style>figure{margin:0}img{width:100%;display:block;border:1px solid #333;background:#000}figcaption{font-size:13px;padding:5px;color:#bbb}</style>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
const out = path.join(src, 'montage.png');
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('MONTAGE ' + out);
