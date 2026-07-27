# Spec 06 — TypeScript Migration

Convert the library source (`src/`, ~116 files / ~11.3k LOC) to TypeScript and
ship first-party type declarations, replacing the community
[`@types/three-nebula`](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/three-nebula).

**Enables:** safer delivery of every runtime spec (01–05) — schema changes,
emitter hierarchy, and asset refs are all far less error-prone with a checked
type layer underneath them.
**Blocks:** nothing hard. But see *Sequencing* — landing this before 01/04 pays
for itself.
**Size:** large, but almost entirely mechanical. The design surface is small; the
file count is the work.

---

## Why now, and why it's worth it

Three things make this cheaper than it looks and more valuable than it seems:

1. **The types largely already exist.** There are **877 JSDoc annotations**
   (`@param` / `@return` / `@type` / `@property`) across `src/`. The public shape
   is documented; migration is mostly transcribing comments into signatures, not
   inventing types.
2. **A reference implementation exists.** `@types/three-nebula@10.0.5` on
   DefinitelyTyped is a hand-written `.d.ts` for the public API. It's for v10 and
   community-maintained, but it's a real spec of the export surface — use it to
   check the shipped types, then deprecate it (Stage 5).
3. **The toolchain is already TS-ready.** Vite (esbuild) and Vitest both consume
   `.ts` with zero extra config. There is no bundler migration in this spec —
   only adding a type layer and a declaration-emit step.

The value: `fromJSON`/`fromJSONAsync` is a stringly-typed registry today (a
`type` string resolves to a class). Every runtime spec touches that boundary. A
checked schema turns a class of silent load-time failures into compile errors.

---

## Stage 0 — Audit

Verify before building. These are grounded from a first pass but confirm:

1. **JSDoc coverage** — ~877 annotations found. How many are *accurate* vs stale?
   Spot-check the base classes; stale JSDoc is worse than none once it becomes a
   type.
2. **The `THREE` injection contract.** Constructors take `(container, THREE)`
   (e.g. `SpriteRenderer`, `BaseRenderer`). Where else is `THREE` threaded? Is it
   ever stored, re-passed, or partially destructured? This determines whether
   `THREE` types as `typeof import('three')` or a narrower structural subset.
3. **The JSON registry.** How does `fromJSON` map a `type` string to a class —
   one central map, or per-module registration? (initializers and behaviours each
   have a `fromJSON` static.) This is the shape the discriminated unions must
   mirror.
4. **Circular dependencies.** `npm run lint` already runs `madge --circular` and
   reports none. Confirm still true — TS's `import type` matters where cycles exist.
5. **Shaders.** GPURenderer shaders are GLSL in `.js` template-string modules.
   Confirm they carry no logic that needs typing (they're strings; they stay
   trivial `.ts` exporting `string`).
6. **Runtime `dependencies: {}`.** The package ships zero runtime deps (lodash /
   potpack / uuid are bundled). Confirm none of these leak into the *public* type
   surface; if they do, their types must be vendored or the API adjusted.
7. **`three` version.** Peer range `>=0.122.0 <1.0.0`; `@types/three` is bundled
   with `three`. Decide the minimum `@types/three` the public types compile against.

If the audit contradicts anything below, trust the repo.

---

## Stage 1 — Toolchain (no code conversion yet)

Stand up the type layer so a single file can be `.ts` while the other 115 stay
`.js`, and the build/test/CI keep working throughout.

- **`typescript` as a devDependency.** Pin it; TS is not semver in the usual sense.
- **`tsconfig.json`**, starting permissive:
  - `allowJs: true`, `checkJs: false` — `.js` and `.ts` coexist during migration.
  - `strict: false` initially. Ratchet up per Stage 3.
  - `moduleResolution: "bundler"`, `target: "es2020"` (matches `vite.config.js`).
  - `noEmit: true` here — Vite/esbuild does the transpile; `tsc` is for checking
    and declarations only (below).
- **Declaration emit is a separate step.** esbuild does **not** emit `.d.ts` or
  type-check. Add `vite-plugin-dts` (rolls declarations into `dist/`) *or* a
  `tsc --emitDeclarationOnly --declaration` pass. Prefer the plugin so `npm run
  build` produces `.d.ts` alongside the existing `.mjs`/`.cjs`/`.umd.js`.
- **`package.json` wiring:**
  - Add a `types` field and a `"types"` condition to `exports["."]` pointing at
    the emitted `dist/three-nebula.d.ts`. (Put `"types"` **first** in each exports
    entry — resolvers read in order.)
  - Add `typecheck: "tsc --noEmit"` and fold it into `ci:src` next to `lint`.
- **Vitest:** no change needed — it type-strips `.ts` automatically. Tests can
  convert last (Stage 4).

**Acceptance for Stage 1:** rename one leaf module (e.g. `src/math/MathUtils`) to
`.ts`, and `npm run build`, `npm test`, `npm run typecheck` all pass with `.js`
and `.ts` mixed.

---

## Stage 2 — Convert bottom-up, leaf-first

Dependency order, so every file is converted only after the things it imports.
Convert, type, keep it green, commit per layer:

1. **`math/`, `utils/`, `constants/`, `ease/`, `events/`** — leaves, no internal deps.
2. **Base classes** — `Behaviour`, `Initializer`, `Zone`, `BaseRenderer`,
   `Particle`, `Pool`. These define the shapes everything else extends; get them
   right and subclasses fall into place.
3. **Subsystems** — `behaviour/`, `initializer/`, `zone/`, `emitter/`, `debug/`.
4. **Renderers** — `renderer/` incl. the `GPURenderer/` subtree. Shaders become
   `.ts` exporting `string`.
5. **`core/`** — `System`, `core/three/`, and the `fromJSON` path last (it depends
   on every registered type).
6. **`src/index.ts`** — the barrel. Its emitted `.d.ts` *is* the public API.

Rules:
- **One layer per commit**, build + typecheck + tests green at each.
- **Transcribe JSDoc into signatures**, then delete the now-redundant `@param`/
  `@type` tags (keep prose descriptions). Consider a `ts-migrate` / jsdoc-based
  first pass to seed signatures, but hand-review every file — generated `any`s are
  debt.
- **`import type`** for type-only imports (cheap, and it sidesteps any cycle).

---

## Stage 3 — The type-modelling problems worth designing

Most of the migration is mechanical. These few are not — decide them deliberately:

### 3a. The `THREE` injection

`three` is a peer, passed into constructors at runtime. Type it as
`typeof import('three')` (the whole namespace) unless the audit shows only a
narrow slice is used, in which case a structural interface is friendlier to
consumers on odd `three` builds. Do **not** `import * as THREE from 'three'` in
`src/` for values — that would un-externalise it and bloat the bundle. Types only.

### 3b. The JSON schema as discriminated unions

`fromJSON` reads `{ type: 'Alpha', properties: {...} }`. Model each initializer/
behaviour/zone as a member of a discriminated union keyed on `type`, with
`properties` typed per member. This is the single highest-value type in the
library — it's what makes hand-authored and generated JSON checkable, and it's
the seam every runtime spec (01 hierarchy, 04 versioning, 05 assets) modifies.

### 3c. The string→class registry

The registry that resolves `type` → constructor must stay in lockstep with 3b.
Prefer a typed registry object whose keys are the union's `type` values, so adding
a class without a schema member (or vice versa) is a compile error.

### 3d. Generics vs. `any` on the collections

`System.emitters`, `Emitter.behaviours`/`initializers` are heterogeneous arrays.
Resist `any[]`. Use the base-class types (`Behaviour[]`, `Initializer[]`); reserve
generics for genuinely parameterised spots. Over-generic code is as unreadable as
untyped code.

### 3e. Strictness ratchet

Land the conversion at `strict: false`, then turn on, in order:
`noImplicitAny` → `strictNullChecks` → full `strict`. Each is its own PR-sized
cleanup. Do **not** block the initial conversion on full strict — that couples two
large efforts and neither ships.

---

## Stage 4 — Tests

- Convert `test/` (~39 files / ~4.7k LOC) to `.ts` after `src/`. Lower priority —
  Vitest runs `.js` tests against `.ts` source fine, so this can trail.
- Value: tests become the first real consumer of the public types, catching
  signature regressions the unit assertions miss.
- The `vr/` harness and `sandbox/` can convert opportunistically; the sandbox
  already imports the library by name and would immediately benefit from types.

---

## Stage 5 — Ship the types, retire the community package

- `npm run build` emits `dist/three-nebula.d.ts`; `package.json` advertises it.
- **Validate against `@types/three-nebula@10.0.5`**: diff the shipped surface
  against the DT declarations. Every export they typed, we must type (or
  consciously drop with a note). Differences are either our bugs or their drift —
  resolve each.
- Once first-party types ship, **open a DefinitelyTyped PR deprecating
  `@types/three-nebula`** (add the `// Type definitions for ... DEPRECATED`
  stub that points at the bundled types). Leaving both live means consumers get
  conflicting definitions.
- Add a `.d.ts` smoke test to CI: a tiny `.ts` file that imports the built package
  and exercises the public API, compiled with `tsc`, so a broken declaration fails
  the build.

---

## Sequencing with the runtime specs

TypeScript is orthogonal to 01–05 but **cheaper first**:

- **Before 04 (versioning) and 01 (hierarchy):** both reshape the JSON schema
  (3b). Doing them on a typed schema means the migration functions and the tree
  transform are compiler-checked. Doing them first means typing a moving target
  twice.
- **Not a hard blocker.** If a runtime spec is urgent, it can land in `.js` and be
  typed as its files are reached in Stage 2. But the ordering that minimises rework
  is: **06 (or at least 06 Stages 1–3b) → 04 → 01 → 05 → 03**.

---

## Explicitly out of scope

- **Rewriting logic.** This is a type layer over existing behaviour. No refactors,
  no API changes riding along — a typed line must behave identically to the JS line
  it replaced. Behaviour changes go in their own specs.
- **Full `strict` on day one.** Ratcheted separately (3e).
- **Bundler / test-runner changes.** Vite and Vitest already handle TS.
- **Typing `website/`.** Separate workspace, separate concern (and slated to move
  to the `gs` monorepo).
- **Runtime schema validation** (zod, etc.). Types are compile-time; runtime
  validation is a distinct, later choice — do not couple them.
