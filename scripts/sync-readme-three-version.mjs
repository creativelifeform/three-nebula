#!/usr/bin/env node

/**
 * Keep the three.js version shown in README.md in sync with package.json.
 *
 * Two spots are kept up to date:
 *   1. the shields.io badge   -> three-vX.Y.Z
 *   2. the feature bullet      -> "Built and tested against `three@X.Y.Z`; supports `three` `<range>`"
 *
 * Source of truth:
 *   - devDependencies.three   -> the concrete version we build & test against
 *   - peerDependencies.three  -> the supported range
 *
 * Usage:
 *   node scripts/sync-readme-three-version.mjs            # rewrite README in place
 *   node scripts/sync-readme-three-version.mjs --check    # exit 1 if out of date (no write)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = resolve(root, 'package.json');
const readmePath = resolve(root, 'README.md');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const rawDev = pkg.devDependencies?.three;
const peerRange = pkg.peerDependencies?.three;

if (!rawDev) {
  console.error(
    'sync-readme-three-version: no devDependencies.three in package.json'
  );
  process.exit(1);
}

// Strip semver range operators (^ ~ >= <= > < =) to get the concrete version.
const tested = rawDev.replace(/^[\^~>=<\s]+/, '').trim();
const supports = (peerRange || `>=${tested}`).trim();

const before = readFileSync(readmePath, 'utf8');

let after = before
  // 1) badge: .../badge/three-vX.Y.Z-...
  .replace(/(img\.shields\.io\/badge\/three-v)[^-\s)"]+/, `$1${tested}`)
  // 2) feature bullet (keeps whatever URL is already linked)
  .replace(
    /(- Built and tested against \[`three@)[^`]+(`\]\([^)]+\); supports `three` `)[^`]+(`)/,
    `$1${tested}$2${supports}$3`
  );

if (after === before) {
  console.log(
    `README three version already in sync (three@${tested}, supports ${supports}).`
  );
  process.exit(0);
}

if (process.argv.includes('--check')) {
  console.error(
    `README three version is out of date (expected three@${tested}, supports ${supports}).\n` +
      'Run: npm run readme:sync-three'
  );
  process.exit(1);
}

writeFileSync(readmePath, after);
console.log(`Synced README to three@${tested} (supports ${supports}).`);
