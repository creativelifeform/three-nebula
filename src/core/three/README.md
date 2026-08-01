# Three compatibility shim

## Why?

The core simulation math needs a few `three` classes internally — `Vector3`
(the base for `Vector3D`), `Euler`, and the material blending-mode constants.

This module re-exports them from `three`. It does **not** bundle three: the
build externalises `three` (`rollupOptions.external` in `vite.config.js`), and
`three` is a peer dependency the consumer already has installed. Re-exporting the
real classes means one source of truth, correct TypeScript types, and math that
stays in step with the three version the consumer runs.

## History

This module previously vendored a snapshot of these classes from three `r106`,
to avoid bundling three before the build externalised it. That snapshot has been
removed in favour of importing from `three` directly.
