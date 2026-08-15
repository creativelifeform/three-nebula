# Spec 09 — Bundle Packaging (`.nebula`)

A portable interchange format that packs a system plus every asset it references
into one file, and the **separate package** that reads and writes it. **Never in
the runtime core** — the core only ever accepts a resolver (05).

**Depends on:** 05 (content-addressed assets) — a bundle is `textureRef`s plus
hashed asset files; a resolver is how the runtime consumes an *unpacked* bundle.
**Relationship to 05:** 05 defines the two *in-document* forms the **runtime**
reads (`texture` base64, `textureRef`). 09 defines a *distribution artifact* — a
file you hand around — produced and consumed by **tooling**, and unpacked to refs
+ a resolver **before** it reaches the runtime.
**Status:** deferred. This is the "revisit portability" phase — build it only when
a real distribution use case demands it, not before.

---

## Why a bundle at all

A `system.json` whose textures live on someone else's server isn't portable —
it's a dangling dependency. A bundle makes a system genuinely self-contained: one
artifact you can email, commit, or download that carries the system **and** its
assets.

Base64-inlined JSON (the gallery's `embed` export, 05) is *also* one
self-contained file — but it pays the ~33% base64 tax and a multi-MB `JSON.parse`
cost, and it re-embeds assets a bundle would dedup by hash. For flipbook-heavy or
multi-asset systems that's the difference between "loads" and "stalls the main
thread." **A bundle is the efficient portable form; base64 is the pasteable one.**
Both are legitimate; they serve different moments.

## Prior art

Effekseer's `.efkpkg` and glTF's `.glb` are exactly this — an effect/model bundled
with every resource it references, travelling as one artifact. Steal the
resolution; three.js users already know the `.glb` shape.

---

## The format

Two viable shapes:

- **Zip** — trivially inspectable, universal tooling, streams poorly.
- **GLB-style binary container** — JSON chunk + blob chunk, fast to parse, needs
  custom tooling.

**Recommend zip for v1.** Deflate on already-compressed PNGs is near-free — store
them uncompressed. Universal tooling matters more than parse speed at this stage,
and the bundle format is **versioned separately from the schema (04)** so it can
change without touching either the document schema or the runtime.

```
system.nebula (zip)
├── manifest.json   { bundleVersion, systemRef, assets: [{ hash, mime }] }
├── system.json     (version-stamped; textureRef only, no base64)
└── assets/
    ├── a3f2c1…     (raw bytes, filename = hash)
    └── 9b7e04…
```

**Verify hashes on read.** A ref whose bytes don't match its hash is a corrupt or
tampered bundle and must fail loudly.

---

## The load-bearing principle: interchange, not runtime

**Nothing ships a `.nebula` to production.** A bundle is unpacked **once, at build
time**, into loose hashed assets + a `system.json` of refs; a resolver (05) then
serves those at runtime — the same way nobody ships a zip of `node_modules`.

Why runtime-unzip is *actively wrong* on the web:

- **HTTP caching dies** — a zip is one opaque blob; change one texture and the
  whole thing redownloads. Loose hashed assets cache individually, forever.
- **No parallel fetch** — the browser pulls N textures concurrently; a zip is one
  serial request, then a decompress.
- **Main-thread cost** — the unzip runs on every load.
- **No transcoding** — you can't run webp/avif or KTX2 over bytes sealed in a zip.
- **No code-splitting** — a system welded into a blob can't be lazily loaded
  per-route.

---

## Consumer paths

**With a build pipeline (Vite/webpack/Next — the common case).** The bundler
*already* does content-addressing (it emits `fire.a3f2c1.png` with immutable
headers). A **bundler plugin** unpacks the `.nebula` at build, emits its assets
through the bundler's pipeline, and resolves refs to the hashed URLs:

```js
import fireSystem from './effects/fire.nebula'
// → unpacked at build; assets emitted through Vite; refs → hashed URLs; tree-shaken, lazy-loadable
```

Architecturally near-free: the plugin constructs an `AssetResolver` (05) backed by
the emitted URLs. Small package, high DX leverage.

**Without a build step (Webflow, a CMS, a `<script>` tag).** Don't use a bundle —
use the gallery's base64 `embed` export (05): one JSON, no asset pipeline, no CORS.
That's not this format's job.

**CDN-hosted refs.** Viable for a *live web page* (an HTTP resolver, immutable
cache keys). **Never for a shipped game** — offline breaks, latency, CORS, a GDPR
surface from player IPs, and a hard dependency on our uptime. Document it as a
demo/web-embed convenience with no SLA.

---

## Hard architectural constraint

**three-nebula core must never contain a zip decoder.**

Bundle handling lives in a **separate package — `@nebula/bundle`** — consumed by
the editing/packaging tools and the bundler plugin. The runtime only ever accepts
an `AssetResolver` (05). This:

- keeps the core small and keeps fflate (or equivalent) out of every consumer's
  bundle;
- lets the zip-vs-GLB decision be revisited later without touching the runtime;
- validates 05's resolver design — an HTTP resolver covers CDN, a memory resolver
  covers embed, the bundler plugin covers the build case, and **none of them
  require the runtime to know a bundle format exists.**

---

## Stage 0 — Audit (when this phase begins)

1. What exactly does the gallery hand out today, and to whom (web embed, other
   engines, downloads)? The real distribution use cases decide zip vs GLB and what
   the manifest must carry.
2. Does `@nebula/bundle` want to be a standalone npm package or part of the
   monorepo's tooling? (It's a consumer package either way — not this repo's core.)
3. What's the smallest bundler-plugin surface that covers the common Vite/Next
   case?

---

## Explicitly out of scope

- **The runtime reading `.nebula` directly** — it never does; unpack to refs first.
- **base64 inline export** — that's the gallery's bake + 05's `texture` field, not
  this format.
- **The gallery / editor and any storage backend** — consumers.
- **A GLB-style binary container for v1** — zip first; revisit if parse speed ever
  matters more than universal tooling.
