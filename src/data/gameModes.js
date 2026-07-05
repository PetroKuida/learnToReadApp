/**
 * Game Mode Registry
 *
 * HomeScreen maps over this array and renders one GameModeCard per entry.
 * To add a new mode: add an object here — no component changes required.
 *
 * Fields:
 *   id              — unique string identifier
 *   displayName     — user-facing name (Ukrainian, matches locale)
 *   enabled         — false → card shown as unavailable (greyed out)
 *   isPremium       — true → card shown with lock icon (post-MVP purchase flow)
 *   freeLetterCount — null = all letters available; N = preview limited to first N letters
 *   screen          — matches the Stack.Screen name in AppNavigator
 */

export default [
  {
    id: 'letters',
    displayName: 'Літери',
    enabled: true,
    isPremium: false,
    freeLetterCount: null,
    screen: 'Letters',
  },
];
