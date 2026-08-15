# Spec 08 — AI-Native Authoring

A published **generation contract** (a versioned JSON Schema) and a **CLI** that
make three-nebula's declarative system format a first-class target for machine
**generation**, **editing**, and **evaluation** — and turn a community corpus of
authored systems into reproducible training data.

**Depends on:**
- **02 (determinism)** — *hard*, for the reproducible render that makes generated
  systems evaluable and the corpus trustworthy. The rest of the CLI works without
  it; the AI-native *value* does not.
- **04 (schema versioning)** — *enabling*: the published, versioned JSON Schema is
  the generation contract, and the `version` stamp keeps corpus records durable.
- **05 (content-addressed assets)** — *enabling*: keeps corpus records about system
  *structure* rather than re-encoded image bytes, and lets previews dedup.

**Consumes (out of scope here):** the gallery / editor is a *consumer* that
produces the corpus; model training and hosting are downstream.

---

## Why this

three-nebula's system format is already a near-ideal substrate for machine
authoring: a **bounded, named, declarative JSON document** — a flat list of
`{ type, properties }` drawn from a closed vocabulary of ~30 units. Language
models generate, edit, and are trained on flat, schema-bounded JSON far more
reliably than on graph topologies or open DSLs: the vocabulary is closed, the
output is constrainable to *always valid*, and every field has documented
semantics (the shipped API reference). This is an intrinsic property of the
declarative design, and it is worth exploiting deliberately.

Two things are missing:

1. **A deliberate layer** that makes the substrate usable by machines at scale —
   a machine-readable contract to constrain generation against, and tooling to
   validate, render, and describe systems without a human in the loop.
2. **The loop** that turns authored systems into a reproducible corpus.

**The corpus is the asset.** Every system authored in the gallery is a labelled
example: `intent → system → deterministic preview`. That corpus compounds — it is
the one thing here that gets more valuable purely with time and adoption, and it
is the natural training and retrieval substrate for machine authoring. The
library's job in this spec is the machinery that makes that corpus **reproducible**
(02), **addressable** (05), and **constrainable** (04 schema) — so it is trustworthy
data, not just a pile of JSON.

## Why a CLI (not a server or agent protocol)

The CLI is the **durable primitive**. It is scriptable, batchable, CI- and
pipeline-friendly, provider-agnostic, and runs headless at scale — which is
exactly the shape of the work that matters here: **batch-generating training
data, evaluating generations in CI, and composing `generate | validate | render`
pipelines**. A CLI composes into cron jobs, build steps and data pipelines; an
interactive agent/server protocol does not.

An agent/host integration (e.g. exposing these commands to an in-editor
assistant) is a **thin wrapper over the CLI**, added later if wanted. The CLI is
the substrate; do not invert that.

---

## Stage 0 — Audit

Before writing code, establish:

1. Is there a **machine-readable schema** today (JSON Schema), or only the
   TypeScript types + the generated API reference? What's the cleanest source to
   derive a JSON Schema from without hand-maintaining it?
2. Can the sim **render headlessly and deterministically** today? The VR harness
   (`vr/`) already does — is that machinery reusable as a `render` primitive, or
   is it coupled to the test setup? (See 02's headless contract.)
3. Is `System.toJSON()` **round-trip clean** — does `fromJSON(toJSON(s))` reproduce
   the same system, byte-stable?
4. Is there any existing CLI entry point (`package.json#bin`)?

**Write the answers into this spec before proceeding.**

---

## Stage 1 — The generation contract (published JSON Schema)

Publish a **versioned JSON Schema** of the system document, derived from the
taxonomy / TS types (not hand-maintained — generated from the source of truth).

- This is the keystone. A JSON Schema lets **any** model be constrained —
  structured output, tool schemas, or grammar-constrained decoding — to emit
  **always-valid** systems. Reliability comes from the closed vocabulary, not from
  prompt luck.
- Carries 04's `version`; the schema is itself versioned so generations target a
  known contract.
- Ships in the package and is emittable from the CLI (`schema`), so tooling,
  editors and model callers all constrain against one artifact.

---

## Stage 2 — The CLI

`npx three-nebula <cmd>`. Deterministic commands need **no model**; generation is
**provider-pluggable** (bring-your-own endpoint/key — the library ships neither).

| Command | Model? | Does |
|---|---|---|
| `schema` | no | Emit the versioned JSON Schema (constrain any model against it). |
| `validate <file>` | no | Validate against the schema + migrate to current (04). Non-zero exit on invalid. |
| `render <file> [--frames N --seed S --out dir]` | no | **Deterministic** headless render → PNG(s) / thumbnail (02 + the headless harness). Reproducible ground truth. |
| `describe <file>` | no | Deterministic structural summary (units used + params) — cheap labels/captions for the corpus. |
| `generate "<intent>"` | yes | Model call **constrained to the schema** → a valid system. Pipe through `validate` + `render`. |
| `edit <file> "<instruction>"` | yes | Constrained patch of an existing system. |

Composable by design:

```
three-nebula generate "wispy blue campfire" | three-nebula validate | three-nebula render --out ./corpus
```

**Provider-agnostic, like the asset resolver (05):** the library hardcodes no
provider and ships no keys; the caller configures an endpoint. The deterministic
commands — the ones that build and verify the corpus — run with no model at all.

---

## Stage 3 — Corpus interchange

Define a **corpus record** so the gallery and the CLI speak the same language:

```jsonc
{
  "id": "…",
  "intent": "wispy blue campfire",     // prompt / description — the label
  "system": { "version": 2, /* refs per 05 */ },
  "preview": { "hash": "sha256:…", "mime": "image/png" },  // content-addressed (05)
  "meta": { "author": "…", "votes": 0, "license": "…" }
}
```

- The gallery **emits** these; the CLI **ingests/emits** them for training and eval.
- **05** → assets and previews are content-addressed and dedup'd; the record is
  about *structure*, not re-encoded bytes.
- **02** → `render <system>` reproduces `preview` **exactly**. That reproducibility
  is the guarantee that makes the corpus trustworthy training data rather than a
  pile of unverifiable pairs.

---

## Stage 4 — Evaluation (downstream — don't foreclose)

With a deterministic `render`, a generation can be scored against its `intent`
(image-text similarity, or a judge) to yield a **stable** signal — the basis for
fine-tuning or RL loops. Building that model loop is **downstream and out of
scope**; the point here is that the CLI's deterministic render + the corpus format
**are** the eval substrate, so nothing in this spec should preclude it.

---

## Hard constraints

- **Deterministic commands never call a model.** `schema` / `validate` / `render` /
  `describe` are pure, offline, reproducible. They are what build and verify the
  corpus.
- **No provider or keys in the library.** Generation is bring-your-own-model,
  configured by the caller.
- **The schema is the single source of truth for validity.** Generation is
  constrained *to it*; it is generated from the taxonomy, not hand-maintained.

---

## Explicitly out of scope

- **The gallery / editor** — the consumer that produces the corpus; not this repo.
- **Model training / fine-tuning / hosting / prompt engineering / model selection**
  — downstream and caller-owned.
- **A server or agent-protocol integration** — a possible thin wrapper over the CLI
  later; the CLI is the primitive and stays the primitive.
- **Retrieval / embeddings over the corpus** — valuable (remix, "find similar"),
  but a consumer concern built *on* the corpus format, not part of the runtime.
