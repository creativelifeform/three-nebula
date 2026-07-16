# Spec 03 — Sound Renderer

Treat particles as sound sources. A renderer that emits voices instead of pixels.

**Depends on:** 02 (seeded jitter, scrub muting), 05 (audio blob storage)
**Priority:** lowest of the six. Most additive, least entangled, easiest to defer.

---

## The model

**This is not a sound-type particle.** It is an ordinary particle that a sound
renderer happens to be reading.

The particle stays dumb — position, life, age, alpha, size. It has no idea it's
audible. The *renderer* decides to interpret the stream as voices. Nothing new
enters the particle struct. The simulation does not branch.

Sound sits alongside billboard, mesh, ribbon and light as a peer renderer.

*Prior art:* this is PopcornFX's model — its renderer list is billboard, mesh,
ribbon, light, **sound**, decal, triangle, where the sound renderer simply treats
particles as sound sources in the world. It's the right shape and worth copying
closely.

**Corollary:** a layer can carry both renderers. An ember that glows *and* crackles
is one emitter with a `SpriteRenderer` and a `SoundRenderer` reading the same
particles. No duplicate emitter.

**Corollary 2:** triggering is already built. "Play a sound 0.5s in" is an emitter
with `delay: 0.5`, `burst: 1`, `life: <sound duration>`, and a sound renderer. It
draws nothing. It exists to be heard. The existing rate/burst/delay controls *are*
the sound sequencer.

---

## Stage 0 — Audit

1. Exact renderer interface — confirm the lifecycle hooks. Assumed:
   `onParticleCreated`, `onParticleUpdate`, `onParticleDead`, `onSystemUpdate`.
2. Is there any existing audio anywhere in the codebase? (Assume no.)
3. How does the system expose the camera? The audio listener must track it.

---

## Stage 1 — One-shot voices

**v1 is one-shot only.** Fire and forget. Persistent/attached sounds are Stage 5
and may never happen.

```
onParticleCreated(particle):
  if (!canPlay()) return          // voice cap, cooldown, probability
  const src = ctx.createBufferSource()
  src.buffer = resolvedBuffer
  src.detune.value = jitter(particle.prng, detuneRange)
  src.connect(panner).connect(gain).connect(ctx.destination)
  src.start(ctx.currentTime, startOffsetJitter(particle.prng))
```

That's it. No handle retained. The voice finishes and GCs itself.

**Config on the renderer (not the particle):**

```jsonc
{
  "type": "sound",
  "src": { "$ref": "sha256:..." },
  "volume": 0.8,
  "detuneCents": [-200, 200],
  "startOffsetMs": [0, 30],
  "maxVoices": 8,
  "cooldownMs": 40,
  "probability": 0.2,
  "attenuation": { "refDistance": 1, "maxDistance": 50, "rolloff": 1 },
  "gainFrom": "alpha",        // optional particle attribute → gain
  "pitchFrom": null
}
```

---

## Stage 2 — Voice limiting

**This is the feature.** 500 sparks × a sound renderer = 500 voices = catastrophe.

Three independent throttles, all needed:

1. **`maxVoices`** — hard cap per renderer. When exceeded, steal the
   lowest-priority live voice or drop the new one (drop is usually better for FX).
2. **`cooldownMs`** — minimum gap between triggers on this renderer. Kills the
   machine-gun case where 50 particles spawn in one frame.
3. **`probability`** — play on only N% of particles. The cheapest and most
   effective control. 500 sparks, 5% probability → 25 crackles. Sounds right,
   costs nothing.

**Priority heuristic warning.** The obvious voice-stealing heuristic — rank by
`volume × attenuation` — is naive, and it's worth understanding why before
shipping it. It reads the *configured* volume, not perceived loudness: a quiet
sample at volume 1.0 outranks a hot sample at 0.1, which is backwards.

The pragmatic answer is to use the heuristic anyway and require **normalised
source audio** (all samples at roughly equal perceptual loudness), then **say so
in the docs**. Do not attempt loudness analysis in v1.

*Prior art:* PopcornFX prioritises exactly this way, and its docs are refreshingly
candid that the heuristic misjudges for precisely this reason — their guidance is
to normalise source audio so it behaves. Their sound renderer page is worth reading
before implementing this stage.

---

## Stage 3 — Jitter (required, not polish)

Many copies of the same sample within a few milliseconds phase-cancel into
flanging mush. Two mitigations, both mandatory:

- **Detune jitter** — per-voice `detune` in cents, drawn from the *particle's*
  seeded PRNG (02). Suggest ±200 cents default.
- **Start-offset jitter** — a few ms of random offset into the buffer. Decorrelates
  transients even at identical pitch.

Both must be deterministic — the same system must produce the same pitches on
every run. (Audio is not captured by offline rendering anyway — see below — but
the property should hold regardless.)

---

## Stage 4 — Context lifecycle and scrub

**Autoplay policy.** `AudioContext` starts `suspended` until a user gesture. This
is not a bug to work around; design for it:

- The system must function fully with audio unavailable. Sound is decoration on
  a working sim, never a dependency.
- Expose `system.audio.resume()` for the host to call from a click handler.
- Default to silence; opt in on an explicit user action. Any consumer displaying
  many systems at once must not auto-play audio.

**Mute conditions** — the renderer must not fire when:

- Seeking / scrubbing (02, Stage 4)
- `timeScale !== 1` (pitch would be wrong and it's not worth correcting)
- The system is being stepped headlessly (02, Stage 6)
- `ctx.state !== "running"`

**Clock note.** Web Audio's `currentTime` and rAF are different clocks. Spawning
voices off rAF gives up to ~16ms jitter. That is tolerable for FX and not worth
fixing in v1. If anything rhythmic ever matters, schedule against `ctx.currentTime`
with lookahead — do not do this now.

---

## Stage 5 — Persistent voices (deferred, possibly never)

A sound that travels with a particle and stops on its death. Requires holding a
handle per voice, updating the panner in `onParticleUpdate`, and stopping in
`onParticleDead`.

*Prior art:* Niagara splits exactly here. `Play Audio` is the one-shot — cheapest,
fires and forgets, and once triggered it cannot be changed or stopped and keeps
playing even if the simulation does not. `Play Persistent Audio` retains a
reference per voice so it can be updated over time, requires a paired update
module, and is notably trickier to set up.

That two-feature split is a good signal: the persistent path is meaningfully
harder and most effects don't need it. **Do not build this until something
concrete demands it.**

---

## Known limitations to document, not solve

- **Offline rendering loses audio.** A sprite sheet has no audio track. A system
  with a sound renderer renders silently, so sound and any sheet/video export path
  do not compose. Not fatal; be explicit about it in the docs.
- **No external mixer.** A native engine has audio middleware (Wwise, FMOD)
  downstream to arbitrate voice budgets, ducking and concurrency — engine
  integrations of FX tools typically defer to it, and PopcornFX's UE integration
  has you configure max concurrency per sound asset for exactly this reason. On the
  web there is nothing downstream. The library owns its own voice budget, which is
  why the limiting in Stage 2 is the substance of this spec rather than an
  optimisation.
