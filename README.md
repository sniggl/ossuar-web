# ossuar-web

The public site and development journal for **Ossuar**, a top-down action RPG in
development — a dead monster walking the tourist trail of his own defeat to take back the
bones that heroes kept as souvenirs.

**Live: [ossuar.braend.io](https://ossuar.braend.io)** · [RSS](https://ossuar.braend.io/rss.xml)

Astro, static output, **zero client JavaScript**. The hero is a procedurally generated
stained-glass window: three gothic lancets, each an equilateral arch struck from the
opposite springer, glazed with a seeded diamond lattice so the output is identical on
every build.

## Running it

```bash
bun install
bun run dev      # dev server on :4321
bun run check    # types and template diagnostics
bun run build    # static build to dist/
bun run preview  # serve dist/
```

`bun`, never npm. There is no test suite — verification is `check` + `build` + looking at it.

## Layout

Two modules are the source of truth, and nothing else may restate what they hold:

- **`src/tokens.ts`** — every colour. No stylesheet declares a literal; `Base.astro` emits
  the palette as `:root` custom properties and `LeadedWindow.astro` imports the same object
  for its SVG fills.
- **`src/data/journal.ts`** — every post. One array feeds the index cards, the entry pages,
  `rss.xml` and `sitemap.xml`. It owns the ordering and validates dates and slugs at build
  time. **Zero entries is a supported, shipped state** — the site is built to look
  deliberate while it is empty, which is the state it launches in.

`src/paths.ts` puts the base path on every internal URL, so moving between a domain root
and a `/<repo>` subpath is one line of config.

## Journal posts

Posts go up when there is something worth showing — a feature, a fight, a thing that now
moves. Never generated from the git log: nobody wants a commit log, they want to see the
game move.
