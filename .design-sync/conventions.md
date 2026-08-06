# Ossuar — leaded glass

A dark, high-contrast system for a top-down action RPG's site. The metaphor is a
cathedral window: a near-black ground, heavy near-black leading, flat unblended
jewel fills, cream reserved for bone and primary text.

## This system has no components

There is no component library and no provider to wrap — `_ds_bundle.js` is
empty by design. The source is a static Astro site whose components compile away
to HTML, so there is nothing to render at runtime. What ships is the **look**:
one stylesheet, the palette on `:root`, and three webfonts loaded from a remote
`@import`.

Build your own markup and style it with the tokens below. Link `styles.css`
(it `@import`s everything else) and put content on a `--ink` ground.

## Style with `var(--*)` — never a literal

**No stylesheet in this system declares a colour literal.** Where a colour needs
alpha it is `color-mix(in srgb, var(--token) N%, transparent)`, not an `rgba()`
restating the token's channels. The only exceptions are pure white and pure
black at low alpha, which are light and shadow rather than palette.

| Family | Tokens |
|---|---|
| Ground | `--ink` `--ink-deep` `--lead` `--lead-soft` |
| Bay (the glow behind the window) | `--bay-glow` `--bay-fade` |
| Bone (all type) | `--bone` `--bone-body` `--bone-dim` `--bone-faint` |
| Glass | `--glass-indigo` `--glass-violet` `--glass-green` `--glass-green-lit` `--glass-rust` `--glass-vermilion` `--glass-amber` `--glass-amber-lit` `--glass-gold` `--glass-cyan` `--glass-cyan-lit` |
| Type | `--font-display` `--font-body` `--font-mono` |
| Layout | `--page` `--gutter` `--slack` |
| Leading | `--lead-w` `--came-lit` `--came-dark` `--came-rule` `--came-top` `--came-bottom` |

Bone tokens are the type ramp, brightest first: `--bone` for headings and
primary text, `--bone-body` for body copy, `--bone-dim` for dates and secondary
labels, `--bone-faint` for small caps on the flat ground. Glass tokens are
glazing — the `-lit` variants are the tints that survive at text sizes.

**Cames** are the lead strips between panes. `--lead` on `--ink` is 1.02:1, so
3px of it is a declaration and not a line — what makes a came read is the pair
around it, a cream highlight on the lit side and black on the other. Use the
`box-shadow` recipes rather than composing the pair by hand: `--came-rule` for a
came standing free, `--came-top` / `--came-bottom` when the came is the
element's own border. They light horizontal edges only.

## Type rules that are load-bearing

- **All-caps tracking never exceeds `0.1em`.** The site shipped at 0.14–0.22em
  and it was the single biggest thing making it hard to read.
- **Uppercase is for labels, never for sentences.** Body-level copy is sentence case.
- **`0.85rem` (13.6px) is the floor** for any text.
- Grenze is condensed — ~19% narrower than Georgia at the same px and x-height —
  so it reads a size smaller than the number says. Body runs 19–23px.
- **`ch` is the width of a `0`, not a character.** Grenze's is ~24% wider than
  its average lowercase letter, so `max-width: 62ch` measures 76–88 real
  characters. Cap body at **50ch** to land ~62 real ones. In mono the unit is honest.
- The page caps at `--page` (90rem); `--slack` is the leftover margin, so a band
  that spans the viewport pads with `calc(var(--gutter) + var(--slack))` to stay
  on the same axis as everything above it.

## Where the truth lives

`_ds/<folder>/styles.css` and the `_ds_bundle.css` it imports — the site's whole
stylesheet, including the `:root` block. Read it before styling; it carries the
reasoning for each number in comments.

It also ships the site's own page furniture as plain classes — `.masthead`,
`.chancel`, `.window-bay`, `.band`, `.band-head`, `.panes`, `.pitch`,
`.standfirst`, `.reading`, `.channels`, `.crypt`, `.eyebrow`, `.mono-note`,
`.plaque`, `.came`, `.wordmark`. These are that site's structure, not a utility
vocabulary: reuse one where it fits, but the tokens are the API.

## Idiomatic snippet

```html
<section class="panel">
  <p class="panel-eyebrow">Development journal</p>
  <h2>The window grows</h2>
  <p>Three lancets, glazed with a seeded diamond lattice.</p>
</section>
```

```css
.panel {
  padding: clamp(1.75rem, 3.4vw, 3.25rem) calc(var(--gutter) + var(--slack));
  background: color-mix(in srgb, var(--glass-indigo) 12%, transparent);
  border-top: var(--lead-w) solid var(--lead);
  box-shadow: var(--came-top);
  color: var(--bone-body);
}
.panel h2 {
  font-family: var(--font-display);
  color: var(--bone);
}
.panel-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em; /* never past 0.1em */
  color: var(--bone-faint);
}
```
