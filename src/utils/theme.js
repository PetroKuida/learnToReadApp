/**
 * App-wide design tokens — all colour, spacing, and radius values live here.
 * Import from this file everywhere; never write inline colour/spacing literals.
 */

export const COLORS = {
  /** Deep violet — used as the main app background */
  background: '#2D1B69',

  /** Bright golden yellow — primary actions, buttons, highlights */
  primary: '#FFD700',

  /** Vivid coral/orange — accent for secondary actions and badges */
  accent: '#FF6B35',

  /** Near-white off-white — all body text on dark backgrounds */
  text: '#F5F0FF',

  /** Semi-transparent sky blue — the letter bubble fill */
  bubbleBlue: 'rgba(100, 200, 255, 0.6)',

  /** Pure white — sheen highlight, borders, icon fills */
  white: '#FFFFFF',

  /** Semi-transparent black — modal/dialog overlays */
  overlay: 'rgba(0, 0, 0, 0.55)',
};

export const SPACING = {
  /** 8 dp — tight internal padding */
  sm: 8,

  /** 16 dp — standard component padding */
  md: 16,

  /** 24 dp — section gaps */
  lg: 24,

  /** 40 dp — large structural gaps */
  xl: 40,
};

/** Shared border-radius used on cards, buttons, and the bubble */
export const BORDER_RADIUS = 16;
