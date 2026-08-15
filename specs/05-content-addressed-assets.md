# Spec 05 — Content-Addressed Assets

Add an optional content-addressed texture reference (`textureRef`) alongside the
existing base64 `texture`, with a pluggable resolver. **The library only reads
both forms.** Producing, storing, deduplicating and packaging refs is the
consumer's job, not the runtime's.

**Additive — not a schema break.** The existing `texture` (base64) field is left
exactly as it is; `textureRef` is a new optional field. Old systems load
unchanged, so this is **not gated on 04 (schema versioning)**. 04 stays useful
hygiene (the `version` stamp), not a prerequisite.
**Relates to:** 03 — audio blobs reuse the same ref shape + resolver.

---

## Context: the current design was correct

Textures are currently base64-encoded directly into the system JSON. **This was
the right call.** Nebula was an NW.js desktop app with no server: one portable
file, no asset resolution, no CORS, atomically versioned, works offline.

The constraint has changed, not the reasoning. A consumer holding many systems —
a gallery, a shared library — needs dedup, CDN caching and stable asset identity,
none of which are possible when assets are anonymous strings inside documents.

**Do not frame this as fixing a mistake. It's an inherited constraint being lifted** —
and base64 stays a first-class, permanently-supported form (see below).

---

## What breaks at scale

| Problem | Consequence |
|---|---|
| No dedup | The same dozen smoke puffs stored once per system. 500 systems = 500 copies. |
| No CDN caching | Texture bytes ride inside the JSON; every fetch re-downloads them. Nothing is reusable across systems. |
| Flipbooks | A 4K 8×8 sheet is several MB raw, ~33% more base64'd. `JSON.parse` on a 10MB blob stalls the main thread. |
| No asset identity | Two systems using the same texture are unrelatable. "What uses this asset?" is unanswerable. |
| Useless diffs | Any texture tweak rewrites the whole document. |

Asset identity is the one with no workaround. With a content hash, "what uses
this?" is a single lookup; with inlined base64 the question cannot be asked.

## Precedent

glTF ships the same asset two ways — embedded `data:` URIs, or external file
references — and treats **both as first-class, permanent** forms. That is exactly
the split here: `texture` (base64, portable) and `textureRef` (hosted, efficient).
Lean on it in docs; three.js users already know this shape.

---

## Stage 0 — Audit

1. How are textures currently represented in the JSON? Exact field paths (which
   initializer/renderer, what the value is — bare base64, `data:` URI, or URL).
2. Is base64 the only accepted form, or are URLs also accepted today?
3. Where does texture loading happen — a single choke point, or scattered across
   renderers/initializers? (The resolver branch wants one choke point.)
4. Is `Body` / sprite texture handling shared with anything else?
5. Is there any caching of decoded textures today?

If the audit contradicts anything below, trust the repo and correct this spec.

---

## Stage 1 — The two representations

A texture asset carries **exactly one** of two first-class, permanent encodings:

- **`texture`** — base64 (inline). **Unchanged from today.** Self-contained;
  loads with no resolver and no network. This is the **portable / distribution**
  form — what an exported, hand-it-to-anyone system uses.
- **`textureRef: { hash, mime }`** — a content-addressed reference (new). Hosted;
  resolved to bytes via the resolver. This is the **efficient storage** form —
  what a gallery persists (tiny JSON, dedup, CDN caching).

```jsonc
// inline — unchanged; existing systems and exports
{ "type": "Texture", "properties": { "texture": "<base64>" } }

// referenced — new; gallery storage
{ "type": "Texture", "properties": { "textureRef": { "hash": "sha256:a3f2c1…", "mime": "image/png" } } }
```

- **`hash`** — sha256 over the raw bytes, hex, algorithm-prefixed (the prefix is
  cheap and buys algorithm agility). The hash **is** the identity; immutable by
  construction.
- **Exactly one of `texture` / `textureRef`.** If both are somehow present,
  `textureRef` wins (or throw in a strict mode). In practice only one is set.
- **One ref shape for every asset type.** Audio (03) and any future asset use the
  same `{ hash, mime }`, so the resolver is asset-type-agnostic. Adopt a `*Ref`
  naming convention (`textureRef`, later `audioRef`) deliberately now.

**Why two fields rather than a tagged value inside `texture`:** it leaves the
existing field byte-for-byte unchanged. No loader has to sniff "is this string
base64 or a URI?", and every existing document stays valid. Purely additive.

**No metadata beyond `hash` + `mime` for now.** Width/height and friends are easy
to add to the ref later if a use case appears (e.g. reserving gallery layout
before the image loads); don't add them speculatively.

---

## Stage 2 — Resolver

The runtime's **only** concern for refs. It never knows or cares where bytes live.

```ts
type AssetResolver = (ref: { hash: string; mime: string }) => Promise<string>; // a URL
```

- **Returns a URL.** Simplest, and lets the browser cache immutably by hash
  (`cache-control: immutable`, forever, no invalidation). The library then builds
  the `THREE.Texture` from it. (A Blob/`ArrayBuffer` variant is possible if a
  consumer wants to verify bytes against the hash; URL is the default.)
- **Only invoked on the `textureRef` path.** A fully-inline system needs no
  resolver — passing one is optional:

```js
Nebula.fromJSONAsync(exportedJson, THREE);                    // all inline → works, no resolver
Nebula.fromJSONAsync(galleryJson, THREE, { resolveAsset });   // has refs → resolver required
```

- **Loader branch (one choke point):**

```js
if (props.textureRef) texture = await load(await resolveAsset(props.textureRef));
else if (props.texture) texture = decodeBase64(props.texture);
```

- **Decoded-texture cache keyed by hash.** This is where dedup actually pays: a
  thousand systems referencing the same gradient decode it once.
- Resolver implementations live **in the consumer** — an HTTP/CDN resolver for the
  gallery, a `Map` for tests. The library ships none.

---

## Stage 3 — Producing refs is the consumer's job (not the library)

The library **reads** `texture` and `textureRef`. It never hashes for storage,
uploads, bakes, or bundles. There are two conversions, both owned by the consumer
(e.g. the gallery), and they are symmetric — each clears the other field, so the
"exactly one" invariant holds on both sides:

| Conversion | When | Needs | Lives in |
|---|---|---|---|
| **intern** — base64 → ref | saving into the gallery | hash + **upload** (dedup by hash) | gallery backend |
| **bake** — ref → base64 | **exporting** for distribution | **fetch** the bytes, then base64-encode | gallery |

- **intern:** decode `texture` → hash → upload if the hash is new → store
  `textureRef`, drop `texture`.
- **bake:** fetch each `textureRef` → base64-encode → store `texture`, drop
  `textureRef`. Produces a self-contained, portable JSON that loads anywhere with
  no resolver.

**Hard architectural constraint.** three-nebula core must never contain upload
logic, a storage backend, or a bundle/zip decoder. The runtime only ever accepts
an `AssetResolver`. This keeps the core small and storage-agnostic, and lets all
of the above evolve in the consumer without touching the runtime.

---

## Downstream — enabled later, not built here

Content-addressing makes several things tractable that are impossible while assets
are anonymous strings. This spec only needs to avoid ruling them out:

- **Shared asset libraries** — curated packs; "what uses this texture?" as a
  query; one asset becoming a dependency of many systems.
- **Asset-level metadata** — licensing, attribution, provenance attach to the hash
  once, not to every copy.
- **A portable bundle/interchange format** (`.nebula`) for handing a system plus
  its assets around as one artifact, and the bundler-plugin story that goes with
  it. Split into its own spec — **see [09 — Bundle Packaging](./09-bundle-packaging.md)**.
  It builds *on* this spec's refs + resolver, lives in a separate consumer package,
  and is unpacked to refs before it ever reaches the runtime — never a zip decoder
  in core.

---

## Explicitly out of scope

- **Baking, interning, uploading, and any storage backend** — the consumer's job
  (the gallery owns both conversions and the CDN).
- **Bundle / container formats** (`.nebula` zip, GLB-style) — their own spec
  ([09 — Bundle Packaging](./09-bundle-packaging.md)); consumer tooling, never in
  the runtime.
- **Ref metadata beyond `hash` + `mime`** (width/height, etc.) — add on a real use
  case.
- **Texture tagging / search, licensing schema, transcoding** (KTX2/basis) —
  separate concerns.
- **A migration from base64 → refs** — unnecessary: the change is additive, so
  legacy base64 systems keep loading untouched with no migration and no forced
  version bump.
