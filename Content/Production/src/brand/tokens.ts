/**
 * Formanova design tokens.
 *
 * Colours are taken from the live storefront theme (formanovavintage.com,
 * Shopify "Horizon" theme) and from the gold script wordmark. Keep this file
 * as the single source of truth for every creative.
 */

export const COLORS = {
  /** Theme foreground / near-black espresso, rgb(23 11 2). */
  ink: "#170B02",
  /** Deep background used behind imagery. */
  espresso: "#1A110B",
  espressoLift: "#2A1C13",
  /** Storefront primary button colour, rgb(93 43 9). */
  walnut: "#5D2B09",
  /** Storefront accent, rgb(215 134 80). */
  copper: "#D78650",
  /** Average colour of the gold wordmark (#EFCE6C) and a deeper print tone. */
  gold: "#EFCE6C",
  goldSoft: "#E3C27A",
  goldDeep: "#B8913F",
  /** Storefront light surfaces. */
  cream: "#F7F1ED",
  parchment: "#E7D6CA",
  peach: "#F2D3B5",
  ivoryText: "#F6EEE3",
} as const;

export const FONTS = {
  /** Storefront heading font. */
  display: "'Playfair Display', 'Times New Roman', serif",
  /** Storefront body font. */
  body: "'EB Garamond', Garamond, 'Times New Roman', serif",
  /** Storefront accent font (used here for typewritten price tags). */
  mono: "'Anonymous Pro', 'Courier New', monospace",
  /** Arabic display/body face (SIL OFL, designed by Mohamed Gaber). */
  arabic: "'El Messiri', 'Playfair Display', serif",
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 450,
} as const;

/**
 * Reels / Stories safe areas for 1080x1920 (Meta guidance: keep ~14% top,
 * ~35% bottom and ~6% sides free of text, logos and key product details).
 * Key copy in both creatives stays inside these bounds.
 */
export const SAFE = {
  top: 270,
  bottom: 1250,
  side: 80,
} as const;

/** Logo glyph bounding box inside the 1080x1080 transparent wordmark PNG. */
export const LOGO_BOX = {
  canvas: 1080,
  x: 14,
  y: 374,
  width: 1048,
  height: 330,
} as const;
