/**
 * The palette, lifted from the game's own ArtGen/palette/ossuar.json.
 *
 * Single source of truth. Base.astro emits these as the :root custom
 * properties the stylesheet reads, and LeadedWindow.astro imports them
 * directly for SVG fills — so the window can never drift from the type.
 */
export const palette = {
  ink: '#04060f',
  'ink-deep': '#00051a',
  lead: '#02030a',
  'lead-soft': '#0a0c16',

  /* the wash in the bay behind the window — ground, never type, so no contrast
     target. Here because the stylesheet and the social card both draw it. */
  'bay-glow': '#14103a',
  'bay-fade': '#06070f',

  /* the only pale things in the window */
  bone: '#faedce',
  'bone-body': '#ded1b4', // body copy — 13.4:1 on the ground
  'bone-dim': '#c3ac79', // dates and secondary labels — 7.2:1 on a lit pane
  'bone-faint': '#a2977c', // small caps on the flat ground — 7:1

  /* glass */
  'glass-indigo': '#321776',
  'glass-violet': '#5a2fb0', // the rays behind him — glazing, never type
  'glass-green': '#136e33',
  'glass-green-lit': '#3ba700',
  'glass-rust': '#72372e',
  'glass-vermilion': '#a72a00',
  'glass-amber': '#cd5d00',
  'glass-amber-lit': '#e87d22', // a tint of the above, for type at text sizes
  'glass-gold': '#ca9950',
  'glass-cyan': '#0fafc5',
  'glass-cyan-lit': '#05caf3',
} as const;

/** The :root declaration block, generated so the CSS cannot fall out of step. */
export const paletteCss = Object.entries(palette)
  .map(([name, value]) => `--${name}:${value}`)
  .join(';');

/**
 * Quarry shades — glazing only, never type. Also from ossuar.json: each light
 * mixes its base glass with neighbours so no two panes read identical.
 */
export const glazing = {
  green: ['#136e33', '#2d5e3f', '#3ba700', '#136e33', '#258f20', '#2d5e3f', '#136e33', '#32ba3c'],
  indigo: ['#321776', '#2a1360', '#3a1c88', '#321776', '#241056', '#3a1c88'],
  rust: ['#72372e', '#a72a00', '#72372e', '#8a3a1a', '#cd5d00', '#72372e', '#a2340d', '#8a3a1a'],
} as const;
