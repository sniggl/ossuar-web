/**
 * The size of the social card, in one place.
 *
 * `og-card.astro` is built to exactly this box and `Base.astro` advertises it,
 * so the capture surface and the declared `og:image` dimensions cannot disagree
 * — which they had, by 10×5px, when the two were typed separately.
 */
export const ogCard = { width: 1200, height: 630 } as const;
