# Handover — hosting & domain

State of the deployed site, and the things that are not visible from the code.

## Where it lives

`https://ossuar.braend.io` — GitHub Pages, deployed by `.github/workflows/deploy.yml`
on every push to `main`.

**`braend.io` is a temporary host.** It is an unrelated project's domain, lent to
this one until a real domain is bought. Nothing about the site depends on it
beyond the two places listed under *Moving to the real domain*.

## Three places the domain is configured

Only the first is in this repo. The other two are external and cannot be changed
by committing.

1. **`astro.config.mjs` → `site`** — the origin every canonical, `og:url`,
   sitemap `<loc>` and RSS link derives from. `base` is deliberately **unset**:
   the site serves from a domain root, not the `/<repo>` subpath a GitHub Pages
   project site would normally use.

2. **The repo's Pages settings → custom domain.** This is what maps the incoming
   hostname to this repo. It is *not* a `CNAME` file: because publishing is
   workflow-based (`build_type: workflow`), GitHub creates no `CNAME` file and
   **ignores one if present** — adding a `public/CNAME` would do nothing. Read or
   change it with:

   ```bash
   gh api repos/sniggl/ossuar-web/pages --jq '{cname,https_enforced}'
   gh api -X PUT repos/sniggl/ossuar-web/pages -f 'cname=<domain>'
   ```

3. **DNS**, currently a `CNAME` record in the `braend.io` Hetzner Cloud zone
   (`hcloud zone rrset list braend.io`): `ossuar → sniggl.github.io.`, TTL 300.
   The short TTL is intentional so the eventual cutover is near-instant.

## Moving to the real domain

1. Point the new domain's DNS at Pages: `CNAME → sniggl.github.io.` for a
   subdomain, or the four `185.199.108-111.153` A records for an apex.
2. **Check the new zone's CAA record allows `letsencrypt.org`.** GitHub Pages
   issues certs from Let's Encrypt. A CAA record that omits it does not produce
   an error anywhere — HTTPS simply never provisions and the site is stuck on
   HTTP. This is the single most likely thing to go wrong.
3. Set the Pages custom domain (command above). HTTPS enforcement resets to
   `false` while the new cert is issued; re-enable it once
   `.https_certificate.state` reads `approved` (~1 min), then the edge takes
   another ~2 min to actually start redirecting.
4. Change `site` in `astro.config.mjs`, and the displayed text in
   `src/pages/og-card.astro` — see below.
5. Re-capture `public/og.png` from `/og-card` — **headlessly**, per the next section.

## Re-capturing the social card

```bash
bun run build && bun run preview &
chrome --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --virtual-time-budget=20000 --user-data-dir="$(mktemp -d)" \
  --screenshot=public/og.png http://localhost:4321/og-card
```

On Windows, `chrome` is `/c/Program\ Files/Google/Chrome/Application/chrome.exe`.
The `--user-data-dir` is what lets this run while a normal Chrome is open, and
`--virtual-time-budget` is what lets the three web fonts resolve before the shot.
Match `--window-size` to `src/og.ts`. Verify before committing:

```bash
python -c "import struct;print(struct.unpack('>II',open('public/og.png','rb').read()[16:24]))"
```

## Traps

- **Do not capture the card with a browser's viewport screenshot.** It is
  downscaled to the capture pipeline's own width and returned as **JPEG** — so it
  misses 1200×630 *and* resamples flat colour and a pixel-art sprite. The
  1210×635 file that shipped until `b0eab43` came from exactly that, and put a
  strip of bare page background down two edges of every social preview. Headless
  Chrome writes a lossless PNG at the exact requested size in one shot.

- **The domain is duplicated in `src/pages/og-card.astro`.** That card renders
  the domain as *displayed text*, so it cannot derive from `site`. It is the one
  place a domain change will not propagate automatically — and the failure is
  silent, because the card only appears in social previews. `public/og.png` is a
  committed screenshot of that page, so changing the markup is not enough: the
  PNG has to be re-captured at the size `src/og.ts` declares. Markup and PNG move
  together, always.

- **`url()` in `src/paths.ts` is currently an identity function.** With `base`
  unset, `BASE_URL` is `/`, so it returns its argument unchanged. It is kept, not
  inlined, on purpose: Astro rewrites `base` into the assets it bundles but *not*
  into hand-written markup, so this indirection is what makes a move back under a
  subpath a one-line change in `astro.config.mjs` instead of a hand-edit of every
  internal link. Do not "clean it up".

- **`custom_404: false` in the Pages API is a false negative.** `src/pages/404.astro`
  builds to `dist/404.html` and is served correctly on missing paths (verified).
  The API field is simply not populated for workflow-based builds.

## Verifying a deploy

```bash
gh run list --repo sniggl/ossuar-web --branch main --limit 1
for p in / /rss.xml /sitemap.xml /robots.txt /og.png; do \
  printf '%-14s ' "$p"; curl -sS -o /dev/null -w '%{http_code}\n' "https://ossuar.braend.io$p"; done
```

If the CSS is missing but the HTML loads, `base` and the served path disagree —
that is the failure mode this setup is arranged to avoid.
