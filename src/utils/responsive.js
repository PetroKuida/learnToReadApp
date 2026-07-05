/**
 * Responsive sizing constants and helpers.
 *
 * Dimensions are read once at module load. This is safe because the app is
 * locked to portrait orientation — the usable width never changes at runtime.
 */
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/** True when the device is tablet-class (width ≥ 600 dp) */
export const IS_TABLET = width >= 600;

/** Diameter of the letter bubble */
export const BUBBLE_SIZE = IS_TABLET ? width * 0.55 : width * 0.72;

/** Font size used for the letter glyphs inside the bubble */
export const LETTER_FONT_SIZE = IS_TABLET ? 144 : 96;

/**
 * Scales a size value proportionally from the 375 dp base width.
 * Use for margins, paddings, and font sizes that should grow on wider screens.
 *
 * @param {number} size - The size at the 375 dp reference width
 * @returns {number}
 */
export const scale = (size) => (width / 375) * size;

/** Minimum dimension for any interactive element (accessibility / child usability) */
export const MIN_TAP_TARGET = 48;
