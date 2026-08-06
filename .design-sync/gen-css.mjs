/**
 * Builds the single stylesheet design-sync ships as the Ossuar design system.
 *
 * Run with bun (it imports src/tokens.ts directly):
 *   bun run .design-sync/gen-css.mjs
 *
 * Every part is DERIVED, never transcribed — the palette from src/tokens.ts,
 * the webfont URL from the <link> in Base.astro, the rules from global.css.
 * A hand-copied palette here would be the second copy of the palette that
 * CLAUDE.md says a retune silently leaves behind.
 *
 * Output is .design-sync/.cache/ossuar.css (gitignored, regenerated per sync)
 * and is what cfg.cssEntry points at.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const { paletteCss } = await import(join(ROOT, 'src/tokens.ts'));

// The webfont <link> Base.astro prints, reused as an @import so the DS pane
// and every design built with it load the same three families.
const fontHref = read('src/layouts/Base.astro').match(
  /href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/,
)?.[1];
if (!fontHref) throw new Error('no Google Fonts <link> found in Base.astro — has the head changed?');

const css = [
  `@import url("${fontHref}");`,
  '',
  '/* Palette — generated from src/tokens.ts, the single source of truth.',
  '   Base.astro emits this same block at runtime from `paletteCss`. */',
  `:root{${paletteCss}}`,
  '',
  '/* ── src/styles/global.css ─────────────────────────────────────────── */',
  read('src/styles/global.css'),
].join('\n');

const out = join(ROOT, '.design-sync/.cache/ossuar.css');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);
console.log(`wrote ${out} (${(css.length / 1024).toFixed(1)} KB)`);

/*
 * The converter's --entry. This site has no runtime components to export —
 * .astro files compile away to HTML — so the entry is deliberately empty and
 * _ds_bundle.js comes out with an empty body. It lives inside the repo so the
 * converter walks up to ossuar-web's own package.json for the package root.
 */
const entry = join(ROOT, '.design-sync/.cache/entry.mjs');
writeFileSync(entry, 'export {};\n');
console.log(`wrote ${entry}`);
