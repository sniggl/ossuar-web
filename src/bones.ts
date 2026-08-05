/**
 * The eight skulls the window cycles through, and the clock it cycles on.
 *
 * Every entry is a real sprite layer from the game repo, on the shared 100×100
 * lattice the whole paper doll registers against — `public/art/hero/skull-*.png`
 * are byte-identical to `ArtGen/native/layer_skull_*.png`. Nothing here is drawn
 * for the site, and nothing here may be invented: a skull in this list without a
 * PNG beside it is a fabricated bone, which is the one thing the content rules
 * forbid outright.
 *
 * This file exists because three separate things read the same clock — the image
 * stack, the caption under the sill, and the light that flares when a bone lands.
 * They are phase-locked only because they all divide the same `ROUND`. Two copies
 * of `4.5` drift the moment one of them is tuned by watching, which is how this
 * cadence is expected to be tuned.
 */

export type Bone = {
  /**
   * The file at `public/art/hero/skull-<slug>.png` — the slug *is* the filename.
   * All eight are **placeholder art** and will be replaced; keeping the slug and
   * the 100×100 registration is what makes that a drop-in. DESIGN.md §9 has the
   * cases where it is not.
   */
  slug: string;
  /** sentence case; the caption uppercases it, because a label may be uppercase */
  label: string;
};

/**
 * Ordered for legibility, not by catalog: his own skull is 24px across and the
 * Dragon is 44, so starting on his own means the page first paints exactly as it
 * always has and then visibly changes. The rest alternates wide and narrow
 * silhouettes so no two neighbours read as the same shape — the same
 * silhouette-at-a-glance test the game applies to every bone sprite.
 */
export const bones: readonly Bone[] = [
  { slug: 'own', label: 'His own skull' },
  { slug: 'dragon', label: 'Dragon skull' },
  { slug: 'understudy', label: 'Understudy skull' },
  { slug: 'giant', label: 'Giant skull' },
  { slug: 'belleater', label: 'Bell-eater skull' },
  { slug: 'bird', label: 'Bird skull' },
  { slug: 'drowned', label: 'Drowned skull' },
  { slug: 'wolf', label: 'Wolf skull' },
] as const;

/** Seconds one bone is worn. Tuned by watching, which is why it is one number. */
export const DWELL = 4.5;

/** The full round. Derived — never type the product of these two by hand. */
export const ROUND = DWELL * bones.length;
