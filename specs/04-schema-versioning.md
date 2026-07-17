# Spec 04 — Schema Versioning

A `version` field and a migration chain, so the schema can change without
stranding six years of saved systems.

**Blocks:** 01 (hierarchy), 05 (assets) — both break the schema.
**Size:** small. Boring. Lands first.

---

## Why first

01 turns `emitters[]` into a tree. 05 replaces inlined base64 with hash refs.
Both are breaking changes to the JSON.

There are systems in the wild right now — six years of them, in Discords, in
gists, in people's projects. If a new three-nebula rejects them, the goodwill
that survived six years of dormancy does not survive that.

This spec is the escape hatch that makes every later schema change cheap. It must
exist before the first one lands, not after.

---

## Stage 0 — Audit

1. Does the JSON have any version marker today? Any at all?
2. What does `System.fromJSON` / `fromJSONAsync` do on unrecognised fields —
   throw, ignore, or crash?
3. Are there existing JSON fixtures in the test suite? How many? Are they
   representative?
4. Is the JSON schema documented anywhere authoritative, or is the parser the spec?

---

## Stage 1 — The field

```jsonc
{
  "version": 2,
  "emitters": [ /* ... */ ]
}
```

**Integer, monotonic. Not semver.** Semver invites debate about what counts as a
minor change. An integer that increments whenever the shape changes has no
ambiguity and the migration chain is trivially ordered.

Rules:

- **Missing `version` → treat as `0`** (legacy, pre-versioning). This is the
  entire back-compat story for existing content and it must never be removed.
- **`version` > current → clear, actionable error.** Not a crash, not silent
  partial parse. `"This system was created with a newer version of three-nebula
  (v5). This build supports up to v3. Update three-nebula."`
- **`version` < current → run the migration chain.**

---

## Stage 2 — Migration registry

```js
const migrations = {
  0: migrate0to1,   // legacy → versioned
  1: migrate1to2,   // flat emitters → tree (spec 01)
  2: migrate2to3,   // base64 textures → hash refs (spec 05)
};

function migrate(json) {
  let v = json.version ?? 0;
  while (v < CURRENT_VERSION) {
    json = migrations[v](json);
    v += 1;
    json.version = v;
  }
  return json;
}
```

Requirements:

- Each migration is a **pure function**: JSON in, JSON out. No side effects, no
  network, no I/O. (05 needs async blob writes — see that spec for how it splits
  the pure transform from the storage step.)
- Migrations are **append-only**. Once shipped, a migration is frozen forever.
  Never edit a released migration; add a new one.
- `System.fromJSON` runs `migrate()` before anything else touches the object.
- Migrations must be individually unit-testable without instantiating a system.

---

## Stage 3 — The fixture corpus

This is what stops the guarantee from rotting.

- Collect **real** legacy JSON. Not synthesised — actual systems from the repo's
  examples, the docs site, and (if you can get them) from users. Ask in the
  Discords; people will send you their old files and it's a nice re-engagement
  excuse.
- Store under `test/fixtures/schema/v0/`, `v1/`, etc.
- Golden test: every fixture at every version loads without error and produces
  a system whose structure matches an expected snapshot.
- **Add a fixture for every version, at the time that version ships.** A v2
  fixture written after v4 exists is not evidence of anything.

**Acceptance:** CI fails if any historical fixture stops loading.

---

## Stage 4 — Write path

- `System.toJSON()` always emits the current version. Never write old versions.
- No "save as v1" affordance. Downgrade is not a supported operation and
  pretending otherwise creates an infinite matrix.
- The editor's export always produces current-version JSON.

---

## Interaction with 01 and 05

The migration for **01** (flat → tree) is mechanical: wrap each existing emitter
with `children: []`. Every legacy system is a tree of depth 1. Lossless.

The migration for **05** (base64 → refs) is *not* purely mechanical, because it
must write blobs somewhere. The pure transform can only rewrite the reference;
the blob extraction needs a storage target. See 05, Stage 3 — the resolution is
that the migration emits an intermediate form carrying the decoded bytes, and the
asset store consumes it.

Do not let 05's awkwardness leak into this spec's design. Migrations stay pure;
05 adapts.

---

## Explicitly out of scope

- Downgrade / backward migration
- Schema validation (JSON Schema, zod, etc.) — worth doing, separate concern,
  do not couple it to versioning
- Versioning the *bundle* format (05's container) — related but distinct
