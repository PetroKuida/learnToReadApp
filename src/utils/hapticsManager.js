/**
 * hapticsManager — the only place in the codebase that calls expo-haptics.
 *
 * Settings value (isVibrationEnabled) is passed as an argument by the caller
 * so this file stays a pure utility with no React context dependency.
 */
import * as Haptics from 'expo-haptics';

/**
 * Trigger a medium impact haptic — used when the letter bubble "pops".
 *
 * No-op if vibration is disabled or if the device doesn't support haptics.
 *
 * @param {boolean} isVibrationEnabled
 */
export function pop(isVibrationEnabled) {
  if (!isVibrationEnabled) return;

  // Fire-and-forget — haptic failure must never crash the app
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((error) => {
    console.error('[hapticsManager] pop failed:', error);
  });
}
