# design-sync notes — ossuar-web

Synced to the **Ossuar** project (`e20c2583-cbef-4675-9ded-c0b8400dee48`).

## This is a tokens-only sync, on purpose

ossuar-web is **not a component library**. It is Astro, static, zero client
JavaScript: the seven `.astro` components compile away to HTML, there is no
React anywhere in the dep tree, and `dist/` is a built website rather than a
distributable package. There is nothing to put in `_ds_bundle.js`, so the
converter runs in its documented tokens-only mode (`[ZERO_MATCH] … treating as
tokens-only DS`) and ships an empty-bodied bundle plus the whole stylesheet.

**Do not "fix" this by hand-porting the components to React.** It was considered
and rejected on 2026-08-06: the skill's core principle is to ship what the repo
already built, never a reimplementation, and a React copy of every component is
the second-source-of-truth duplication this codebase has been burned by twice.
If the site ever grows a real React island, revisit — the shape changes then.

## Running a re-sync

`gen-css.mjs` must run **before every build** — it regenerates both converter
inputs into the gitignored `.cache/`:

```bash
bun run .design-sync/gen-css.mjs
node .ds-sync/resync.mjs --config .design-sync/config.json \
  --node-modules ./.ds-sync/node_modules \
  --entry ./.design-sync/.cache/entry.mjs --out ./ds-bundle --no-render-check
```

Three flags that are not optional here, each learned the hard way:

- **`--entry` must point at a file inside the repo.** Without it `PKG_DIR`
  resolves to `node_modules/ossuar-web`, which does not exist (npm won't
  self-install), and `cssEntry` bounding breaks. With it, the converter walks up
  from the entry to the repo's own `package.json`. `.cache/entry.mjs` is an empty
  `export {}` for exactly this reason.
- **`--node-modules` points at `.ds-sync/node_modules`, not the repo's.** The
  build vendors React unconditionally for preview cards (before it discovers
  there are none), and ossuar-web has no react. `.ds-sync/` carries esbuild,
  ts-morph, @types/react, react and react-dom, installed with bun into its own
  `package.json` so the repo's lockfile is untouched.
- **`--no-render-check`.** The render check needs playwright + chromium (~200MB)
  and there are zero previews to render. Installing it would verify nothing.

## Known warns — all expected, none actionable

- `[FONT_REMOTE] "Grenze", "Grenze Gotisch", "JetBrains Mono"` — correct. The
  fonts come from a Google Fonts `@import` that `gen-css.mjs` lifts out of the
  `<link>` in `Base.astro`, so they load at runtime rather than shipping.
- `[ZERO_MATCH] no component exports — treating as tokens-only DS` — the design.
- `[DTS_REACT] @types/react not found` — harmless; there are 0 `.d.ts` files to
  parse. It reads the package's own `node_modules`, not `--node-modules`.
- `[RENDER_SKIPPED]` — see the flag note above.
- `[NO_DIST]` on a run without `--entry` — that run is misconfigured; add the flag.
- The driver's verdict JSON reports `"shape": "storybook"` while the build log
  correctly says `package (from cfg.shape)`. Cosmetic mislabel in `resync.mjs`;
  the build is right.

## Re-sync risks

- **The palette and the stylesheet are read live, never copied.** `gen-css.mjs`
  imports `paletteCss` from `src/tokens.ts` and inlines `src/styles/global.css`.
  A retune propagates on the next sync *provided the generator is run first*.
  Skipping it silently ships the previous sync's `.cache/ossuar.css`.
- **`gen-css.mjs` parses `Base.astro` for the font URL** with a regex against
  `href="https://fonts.googleapis.com/css2?…"`. It throws rather than shipping
  fontless CSS if the head changes shape — but a *different* font link that still
  matches would be picked up silently. Check the `[FONT_REMOTE]` line names the
  families you expect.
- **`conventions.md` enumerates 33 token names and 16 site class names.** Both
  were validated against the built `_ds_bundle.css` on 2026-08-06. A renamed
  token or a redesigned band leaves the header naming something that no longer
  resolves, and the design agent trusts it. Re-validate the names on every sync.
- **Nothing was visually verified**, here or in the DS pane — there is nothing to
  render. The gate this sync passed is `package-validate.mjs` exiting 0.
- `.cache/` is gitignored, so a fresh clone must re-run `gen-css.mjs` and
  re-install `.ds-sync/` deps before the driver will run.
