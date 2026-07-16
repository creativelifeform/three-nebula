# Spec 05 — Content-Addressed Assets

Replace inlined base64 textures with content-addressed references, plus a
pluggable resolver and a bundle container.

**Depends on:** 04 (schema versioning) — this breaks the schema.
**Blocks:** 03 (audio blob storage)

---

## Context: the current design was correct

Textures are currently base64-encoded directly into the system JSON. **This was
the right call.** Nebula was an NW.js desktop app with no server: one portable
file, no asset resolution, no CORS, atomically versioned, works offline.

The constraint has changed, not the reasoning. Any consumer holding more than a
handful of systems needs dedup, CDN caching, and stable asset identity — none of
which are possible when assets are anonymous strings inside documents.

**Do not frame this as fixing a mistake. It's an inherited constraint being lifted.**

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

glTF ships exactly these three forms of the same problem:

- `.gltf` + external files → references
- `.gltf` with `data:` URIs → **the current design**
- `.glb` → binary container, JSON chunk + binary chunk, no base64

The industry converged on GLB, for precisely the 33% tax plus parse cost. Steal
the resolution, not just the problem statement — and lean on it in docs, because
three.js users already know this shape.

---

## Stage 0 — Audit

1. How are textures currently represented in the JSON? Exact field paths.
2. Is base64 the only form, or are URLs also accepted?
3. Where does texture loading happen — is there a single choke point or is it
   scattered across renderers/initializers?
4. Is `Body` / sprite texture handling shared with anything else?
5. Is there any caching of decoded textures today?

---

## Stage 1 — Reference format

```jsonc
{
  "renderer": {
    "type": "sprite",
    "texture": { "$ref": "sha256:a3f2c1..." }
  }
}
```

- **sha256 over the raw bytes**, hex-encoded, prefixed with the algorithm.
  The prefix is cheap and buys algorithm agility.
- The hash **is** the identity. Immutable by construction.
- Same format for audio blobs (03) and any future asset type. One store.

---

## Stage 2 — Resolver interface

The runtime must not know or care where bytes come from.

```ts
interface AssetResolver {
  resolve(ref: string): Promise<ArrayBuffer>;
  has(ref: string): boolean;
}
```

Implementations:

- `MemoryResolver` — a `Map`, for tests and for the embed case
- `BundleResolver` — reads from an unpacked container (Stage 4)
- `HttpResolver` — `GET {baseUrl}/{hash}`, immutable cache semantics
- `IndexedDBResolver` — browser-local persistence
- `ChainResolver` — tries several in order

**Decoded-texture cache keyed by hash.** This is where dedup actually pays: a
thousand systems referencing the same gradient decode it once.

---

## Stage 3 — Migration from base64

04 requires migrations to be pure functions. Blob extraction needs a storage
target. The resolution:

- The **pure** migration rewrites `"data:image/png;base64,..."` →
  `{ "$ref": "sha256:..." }` and emits the decoded bytes into a side-channel on
  the returned object (`__pendingAssets: Map<ref, ArrayBuffer>`).
- `System.fromJSON` (which is already async) drains `__pendingAssets` into
  whatever resolver it was given, then discards the side-channel.
- Migrations stay pure. The async lives at the call site where it belongs.

**Back-compat is permanent.** Keep accepting `data:` URIs and plain URLs forever;
normalise to refs on read. Legacy systems must keep loading with no ceremony.

---

## Stage 4 — Bundle container

A system plus every asset it references, as one portable file. This is what makes
a system genuinely self-contained: a JSON whose textures live on somebody else's
server is not portable, it's a dangling dependency.

*Prior art:* Effekseer's `.efkpkg` does exactly this — an effect bundled with every
resource it references, travelling as one artifact. glTF's `.glb` is the same idea
in a container three.js users already know.

Two viable shapes:

- **Zip** — trivially inspectable, universal tooling, streams poorly.
- **GLB-style binary container** — JSON chunk + blob chunk, fast to parse,
  requires custom tooling.

**Recommend zip for v1.** Deflate on already-compressed PNGs is near-free; store
them uncompressed. Universal tooling matters more than parse speed at this stage,
and the format is versioned separately from the schema (04) so it can change.

```
system.nebula (zip)
├── manifest.json     { bundleVersion, systemRef, assets: [{ ref, mime, bytes }] }
├── system.json       (version-stamped, refs only)
└── assets/
    ├── a3f2c1...     (raw bytes, filename = hash)
    └── 9b7e04...
```

**Verify hashes on read.** A ref that doesn't match its bytes is a corrupt or
tampered bundle and should fail loudly.

---

## Stage 5 — Export modes

There are **three** export modes and they are not interchangeable. The bundle
(Stage 4) is the default. Base64 is a narrow third path, not the export format.

| Mode | Output | Use | Assets |
|---|---|---|---|
| `bundle` **(default)** | `.nebula` zip | Distributing a system to anyone else | Packed, hash-verified |
| `refs` | `system.json` + loose asset files | A build pipeline where the bundler/CDN handles assets | External |
| `embed` | one `system.json` | Copy-paste into a CodePen/gist, single-file demo, no build step | `data:` URIs |

**Why `bundle` beats `embed` almost everywhere:** a zip is *also* one
self-contained portable file. It just doesn't pay the ~33% base64 tax or the
`JSON.parse` cost on a multi-MB string. Anywhere the goal is "one file I can hand
someone," `bundle` is strictly better.

**`embed`'s only real advantage is pasteability.** A zip cannot be pasted into a
text editor. That is a genuine use case — plausibly how a lot of three.js
developers first try the library — so the mode stays and should be a first-class,
documented affordance. It is not the default and it is not the storage format.

**Guard rail:** `embed` should warn (not fail) above a size threshold — suggest
2MB of decoded assets. The moment flipbooks are involved, `embed` stops being
viable and users should be told why rather than discovering it as a mystery stall.

Keep base64 as an **explicit opt-in export flag**, not the canonical form.

```js
system.toBundle()                      // .nebula zip (default for sharing)
system.toJSON()                        // refs (default for build pipelines)
system.toJSON({ embedAssets: true })   // data: URIs, one self-contained file
```

---

## Stage 6 — Runtime & distribution

**The bundle is an interchange format, not a runtime format.** Nothing should
ship a zip to production. This is the single most important thing in this spec to
get right, and it is currently only implied by the resolver interface.

| Phase | Format | Who handles it |
|---|---|---|
| **Interchange** | `.nebula` zip | Publishing, downloading, handing a file to a colleague |
| **Build** | unpacked → `system.json` + loose assets | The bundler |
| **Runtime** | refs resolved to URLs | The app |

The zip exists to move a system from A to B intact. It is unpacked **once, at
build time**, and never appears in production — the same way nobody ships a zip
of `node_modules`.

### Why runtime-unzip is actively wrong on the web

- **HTTP caching dies.** A zip is one opaque blob. Change one texture and the
  whole thing redownloads. Loose hashed assets cache individually, forever.
- **No parallel fetch.** The browser will pull six textures concurrently. A zip
  is one serial request, then a decompress.
- **Main-thread cost** for the unzip, on every load.
- **No transcoding.** Consumers may want webp/avif, or KTX2 for GPU textures.
  You cannot run an image pipeline over bytes sealed in a zip.
- **No code splitting.** The system can't be lazily loaded per-route if it's
  welded into a blob.

### Consumer paths

**With a build pipeline (Vite/Next/webpack — the common case).**

Their bundler *already does content-addressing*: it emits `fire-tex.a3f2c1.png`
with immutable cache headers. Our hash refs map onto that almost exactly.

Ship a **bundler plugin** (`@nebula/vite-plugin`, others later):

```js
import fireSystem from './effects/fire.nebula'
// → unpacked at build, assets emitted through Vite's pipeline,
//   refs resolved to hashed URLs, tree-shaken, lazy-loadable
```

Architecturally this is nearly free: the plugin constructs an `AssetResolver`
(Stage 2) backed by the bundler's emitted URLs. Small package, high DX leverage.

**Without a build step** — Webflow, a CMS, a marketing site, a `<script>` tag.

This is where `embed` (Stage 5) earns its keep. One JSON, base64 assets, no asset
pipeline to configure, no CORS. For an agency dropping one hero effect onto a
landing page with no tooling, this is the correct answer.

**CDN-hosted refs** — viable for a live web page (`HttpResolver`, immutable cache
keys). **Never for a shipped game**: offline breaks, latency, CORS, a GDPR
surface from player IPs, and a hard dependency on our uptime. Document it as
demo/web-embed convenience only, with no SLA.

### Hard architectural constraint

**three-nebula core must never contain a zip decoder.**

Bundle handling lives in a separate package — `@nebula/bundle` — consumed by the
editing tools, packaging tools, and the bundler plugin. The runtime only ever
accepts an `AssetResolver`.

This keeps the core small, keeps fflate (or equivalent) out of every consumer's
bundle, and means the zip-vs-GLB decision in Stage 4 can be revisited later
without touching the runtime at all.

It also validates the Stage 2 resolver design: `HttpResolver` covers
agency-with-CDN, `MemoryResolver` covers embed, the bundler plugin covers the
build case — and none of them require the runtime to know that a bundle format
exists.

---

## Downstream (not this spec — just don't foreclose it)

Content-addressing makes several things tractable that are impossible while assets
are anonymous strings inside documents:

- **Shared asset libraries** — curated packs; "what uses this texture?" as a
  query; one asset becoming a dependency of many systems.
- **Programmatic system generation** — with a tagged, hashed asset store, asset
  selection becomes *retrieval* rather than *generation*.
- **Asset-level metadata** — licensing, attribution and provenance attach to the
  hash once, rather than to every copy.

Nothing in this spec builds any of that. It only needs to avoid ruling it out.

---

## Explicitly out of scope

- Any specific storage backend — that's infrastructure, not runtime
- Texture tagging / search
- Licensing metadata schema — flag that it will attach to the hash, then leave it
- Compression / transcoding (KTX2, basis) — real future win, separate spec
