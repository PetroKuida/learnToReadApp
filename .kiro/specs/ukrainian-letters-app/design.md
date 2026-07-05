# Design Document — Chytaychik (Читайчик)

## Overview

Chytaychik is an offline-first mobile app for children aged 4–7 to learn Ukrainian letters.
The MVP delivers a single learning mode: one letter at a time, tap to hear pronunciation, long-press to "pop" the bubble and advance.
The app is built with React Native + Expo (managed workflow), targets Android first via the Google Play "Designed for Families" program, and is structured to support iOS and future game modes without architectural changes.

**Key constraints driving the design:**
- No network dependency — all data and audio bundled at build time
- No ads, no analytics, no personal data collection
- UI must be operable by a child who cannot read — icons over text, large tap targets
- Settings must persist across app restarts
- Single-file locale model enables adding new languages without touching components

---

## Architecture

The app is a flat stack of four screens driven by a single Stack Navigator.
State is minimal: only three global settings booleans (sound, music, vibration) live in a React Context.
All other state is local to the screen that owns it (e.g., `currentIndex` in LettersScreen).

```
App.js
  └── SettingsProvider (React Context)
        └── NavigationContainer
              └── AppNavigator (Stack Navigator)
                    ├── HomeScreen
                    ├── LettersScreen
                    ├── SettingsScreen
                    └── AboutScreen
```

**Data flow:**
- Static letter and locale data is imported directly from `/src/data/` — no runtime fetching.
- Audio is played via `soundManager.js` which reads from SettingsContext before every play call.
- Settings are read from AsyncStorage once on app start (inside SettingsContext) and written immediately on every toggle.
- No Redux, no Zustand, no complex state management — `useState` + `useContext` only.

**Side-effect boundary:**
All side effects (audio, haptics, navigation, storage reads/writes) live at the screen level or in dedicated utils.
Components are pure renderers: they receive props and call callbacks.

---

## Screen Map

```
[Splash Screen]  ←-- Expo managed, no code needed
       ↓
[HomeScreen]
  ├──→ [LettersScreen]     ←-- launched by Start button / game mode card
  ├──→ [SettingsScreen]    ←-- launched by Settings button
  └──→ [AboutScreen]       ←-- launched by About button

[LettersScreen]
  └── back/home icon → [ConfirmDialog]
        ├── Stay → dismiss dialog, resume
        └── Menu → navigate back to HomeScreen
```

Hardware/gesture back button is intercepted on LettersScreen via `BackHandler` and routes through the same ConfirmDialog flow.

---

## Components and Interfaces

### LetterBubble

The core interactive element. Renders one letter as an animated bubble.

```
Props:
  letter          { id, upper, lower, audioFile }   — current letter object
  onShortTap      () => void                         — called on short tap
  onLongPress     () => void                         — called on confirmed long press
  isAnimating     boolean                            — locks input during burst animation
  animatedScale   Animated.Value                     — passed from parent (LettersScreen)
  animatedOpacity Animated.Value                     — passed from parent (LettersScreen)
```

**Why animation values are passed as props:** LettersScreen owns the animation lifecycle so it can sequence audio + haptics + index advance after animation completes. LetterBubble is a pure renderer.

**Input lock:** When `isAnimating` is true, `onShortTap` and `onLongPress` are no-ops.
**Bubble size:** Driven by `responsive.js` constants (`BUBBLE_SIZE`, `LETTER_FONT_SIZE`).

**Visual style — 3D bubble appearance (StyleSheet only, no library):**
```
[Animated.View — scale + opacity]
  [Bubble container — circle, semi-transparent blue/teal, elevation shadow]
    [Sheen highlight — small white semi-transparent circle, absolute top-left]
    [Letter text — upper and lower stacked, centered]
```

Key style properties:
- `borderRadius: BUBBLE_SIZE / 2` — perfect circle
- `backgroundColor: 'rgba(100, 200, 255, 0.6)'` — semi-transparent, bubble-like
- `borderWidth: 2`, `borderColor: 'rgba(255, 255, 255, 0.8)'` — glass edge highlight
- `elevation: 8` (Android) / `shadowColor + shadowOffset + shadowOpacity + shadowRadius` (iOS) — depth
- Sheen: small white circle (~25% of bubble size), `opacity: 0.4`, `position: absolute`, top-left offset — simulates light reflection for 3D feel

Colors and exact values are starting points — visual tweaking expected once rendered on device.

**Animation states:**

1. **Idle pulse** — starts on mount, loops indefinitely until long press
   ```js
   Animated.loop(
     Animated.sequence([
       Animated.timing(idleScale, { toValue: 1.05, duration: 1000 }),
       Animated.timing(idleScale, { toValue: 1.00, duration: 1000 }),
     ])
   )
   ```

2. **Press feedback** — slight scale down on `onPressIn`, back on `onPressOut`
   ```js
   // onPressIn:  Animated.spring(pressScale, { toValue: 0.93 })
   // onPressOut: Animated.spring(pressScale, { toValue: 1.0  })
   ```

3. **Burst (long press)** — stops idle loop, then:
   ```js
   Animated.parallel([
     Animated.timing(burstScale,   { toValue: 1.4, duration: 250 }),
     Animated.timing(burstOpacity, { toValue: 0,   duration: 250 }),
   ])
   ```

4. **Appear (new letter)** — resets scale to 0, opacity to 0, then:
   ```js
   Animated.parallel([
     Animated.spring(burstScale,   { toValue: 1, friction: 4, tension: 60 }),
     Animated.timing(burstOpacity, { toValue: 1, duration: 150 }),
   ])
   ```
   Spring gives a natural bouncy "bubble floats in" feel. After appear completes, idle pulse loop restarts.

**Animation value ownership:** LettersScreen owns `burstScale` and `burstOpacity` (lifecycle tied to letter advance). LetterBubble owns `idleScale` and `pressScale` (purely visual, no lifecycle coupling).

---

### HomeButton

Small home icon button displayed in the top-left corner of LettersScreen.

```
Props:
  onPress   () => void
```

Absolute-positioned, minimum 48×48dp tap target.
Uses a house icon from `@expo/vector-icons` (bundled with Expo — no extra dependency).

---

### ConfirmDialog

Modal overlay shown when the child attempts to exit LettersScreen.

```
Props:
  visible    boolean
  onStay     () => void
  onMenu     () => void
```

Two large icon buttons: ✋ (Stay) and 🏠 (Menu). No text required — icon-only, consistent with child-appropriate UI requirement.
Uses React Native `Modal` component.

---

### GameModeCard

Renders a single game mode entry from the Game_Mode_Registry on HomeScreen.

```
Props:
  mode     { id, displayName, enabled, isPremium, screen }
  onPress  () => void
```

For MVP only one card is rendered (Letters_Mode). Disabled or premium modes render a locked state.
HomeScreen maps over the registry — it does not hardcode any mode.

---

### SettingsToggle

Reusable row used three times on SettingsScreen (Sound, Music, Vibration).

```
Props:
  label      string
  value      boolean
  onToggle   () => void
  icon       string   (icon name from @expo/vector-icons)
```

Renders an icon, label text (from locale), and a React Native `Switch`.

---

### AppNavigator

```js
// /src/navigation/AppNavigator.js
<Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Home"     component={HomeScreen} />
  <Stack.Screen name="Letters"  component={LettersScreen} />
  <Stack.Screen name="Settings" component={SettingsScreen} />
  <Stack.Screen name="About"    component={AboutScreen} />
</Stack.Navigator>
```

`headerShown: false` everywhere — all screens draw their own navigation chrome (or none).

---

## Data Models

### Locale file — `/src/data/locales/uk.js`

```js
export default {
  id: 'uk',
  languageName: 'Українська',
  strings: {
    appName: 'Читайчик',
    startButton: '▶',
    settingsTitle: 'Налаштування',
    aboutTitle: 'Про застосунок',
    soundLabel: 'Звук',
    musicLabel: 'Музика',
    vibrationLabel: 'Вібрація',
    confirmStay: '✋',
    confirmMenu: '🏠',
    aboutDescription: '...',
  },
  letters: [
    { id: 'uk_a', upper: 'А', lower: 'а', audioFile: 'uk_a.mp3' },
    { id: 'uk_b', upper: 'Б', lower: 'б', audioFile: 'uk_b.mp3' },
    // ... all 33 letters of the modern Ukrainian alphabet
  ],
}
```

**33 letters in correct alphabetical order:**
А Б В Г Ґ Д Е Є Ж З И І Ї Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ь Ю Я

Adding a new language = adding a new file here + updating the active locale reference. No component changes needed.

---

### Game Mode Registry — `/src/data/gameModes.js`

```js
export default [
  {
    id: 'letters',
    displayName: 'Літери',
    enabled: true,
    isPremium: false,
    freeLetterCount: null,  // null = all letters available (fully free mode)
    screen: 'Letters',      // matches Stack.Screen name in AppNavigator
  },
]
```

HomeScreen reads this array and renders one GameModeCard per entry.
`enabled: false` → card shown as unavailable (greyed out).
`isPremium: true` → card shown with lock icon (post-MVP purchase flow).
`freeLetterCount: null` → all locale letters are available in this mode.
`freeLetterCount: N` → only the first N letters from the locale are used; the mode loops infinitely over this shorter set. Used for premium mode previews — the child plays normally but only experiences the first N letters of the alphabet until the full version is unlocked.

**Letter slicing logic (applied in every game mode screen):**
```js
const availableLetters = mode.freeLetterCount
  ? locale.letters.slice(0, mode.freeLetterCount)
  : locale.letters;
```

This single line is the entire implementation of the preview mechanic. No prompts, no interruptions — the child simply plays with a shorter alphabet that loops infinitely.

---

### Settings Context shape — `/src/context/SettingsContext.js`

```js
{
  isSoundEnabled:     boolean,   // default: true
  isMusicEnabled:     boolean,   // default: true
  isVibrationEnabled: boolean,   // default: true
  toggleSound:        () => void,
  toggleMusic:        () => void,
  toggleVibration:    () => void,
}
```

AsyncStorage keys: `@settings/sound`, `@settings/music`, `@settings/vibration`.
On mount: read all three keys, fall back to `true` if not found.
On toggle: flip state in memory → immediately write to AsyncStorage.

---

## Navigation

Stack Navigator with no visible header.
All back-navigation from LettersScreen is intercepted — the OS back gesture / hardware button is blocked via `BackHandler` and re-routed through ConfirmDialog.

```
LettersScreen mount:
  useFocusEffect → add BackHandler listener
    → listener returns true (blocks default back behavior)
    → sets showConfirmDialog = true

LettersScreen unmount / blur:
  useFocusEffect cleanup → remove BackHandler listener
```

HomeButton on LettersScreen calls the same handler function — single source of truth for the exit flow.

**Why no tab navigator:** The app's UX is a single-purpose learning activity launched from a home screen. Tabs would imply always-visible peer navigation, which contradicts the child-focused, distraction-free UI goal.

---

## State Management

All global state is three booleans in SettingsContext. Nothing else is global.

| State | Owner | How |
|-------|-------|-----|
| `isSoundEnabled` | SettingsContext | `useState` + AsyncStorage |
| `isMusicEnabled` | SettingsContext | `useState` + AsyncStorage |
| `isVibrationEnabled` | SettingsContext | `useState` + AsyncStorage |
| `currentIndex` | LettersScreen | local `useState` |
| `isAnimating` | LettersScreen | local `useState` |
| `showConfirmDialog` | LettersScreen | local `useState` |

SettingsScreen reads context values and calls the toggle functions — it does not own state.

---

## Audio Architecture

Two independent channels managed in `/src/utils/soundManager.js` via `expo-audio`.

```
soundManager
  sfxChannel    — one-shot sounds: letter pronunciation, pop SFX, UI sounds
  musicChannel  — looping background music track
```

### API

```js
playSfx(filename, isSoundEnabled)   // plays from /src/assets/audio/letters/<filename>
                                    // if player already exists: remove it, create new one, play
                                    // if isSoundEnabled === false: no-op
                                    // if file missing: log error, no-op (no crash)

playMusic(filename, isMusicEnabled) // creates player for /src/assets/audio/<filename>,
                                    // sets loop = true, plays
                                    // if isMusicEnabled === false: no-op

stopMusic()                         // pauses and removes _musicPlayer
pauseMusic()                        // pauses _musicPlayer (keeps it alive)
resumeMusic(isMusicEnabled)         // plays _musicPlayer if isMusicEnabled === true
```

### expo-audio player lifecycle

`createAudioPlayer(source)` from `expo-audio` auto-loads the source immediately — no async `loadAsync` step needed. The returned player object exposes:
- `.play()` — start/resume playback
- `.pause()` — pause playback
- `.seekTo(seconds)` — seek to position
- `.loop` — boolean property, set to `true` for looping
- `.remove()` — release the player and free memory (equivalent to `unloadAsync` in the old expo-av API)

**sfx restart pattern:** calling `playSfx` while a sound is already playing calls `.remove()` on the existing `_sfxPlayer`, then creates a fresh player with `createAudioPlayer` — this restarts from the beginning without any async await chain.

### Stub audio

`STUB_AUDIO_FILE = 'stub.mp3'` — a short silent placeholder at `/src/assets/audio/stub.mp3`.
Letter data can reference this for letters that do not yet have real recordings.
The sound manager resolves audio file paths at play time — stub substitution is handled in the data layer, not in soundManager.

### Settings integration

soundManager receives `isSoundEnabled` / `isMusicEnabled` as arguments from the caller. This keeps soundManager a pure utility — not a React hook — making it testable without a React context.

```js
// Caller pattern
const { isSoundEnabled } = useContext(SettingsContext);
soundManager.playSfx(letter.audioFile, isSoundEnabled);
```

---

## Responsive Design

All sizing logic lives in `/src/utils/responsive.js`.

```js
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 600;

export const BUBBLE_SIZE      = IS_TABLET ? width * 0.55 : width * 0.72;
export const LETTER_FONT_SIZE = IS_TABLET ? 144 : 96;
export const scale = (size) => (width / 375) * size;  // base width: 375dp
```

**Why Dimensions at module load (not a hook):** These values are layout constants computed once at startup. Portrait lock means width never changes at runtime — no need for a resize listener.

### Supported sizes

| Device class | Width range | Bubble size | Font size |
|---|---|---|---|
| Phone | 360–480dp | ~72% of width | 96sp |
| Tablet | 600dp+ | ~55% of width | 144sp |

All interactive elements: minimum `minWidth: 48, minHeight: 48` in StyleSheet.

---

## Settings Persistence

`/src/utils/settingsStorage.js` wraps AsyncStorage with typed read/write functions.

```js
// Keys
const KEYS = {
  SOUND:     '@settings/sound',
  MUSIC:     '@settings/music',
  VIBRATION: '@settings/vibration',
};

// Returns boolean (default: true if key not found or parse error)
export async function readSetting(key) { ... }

// Writes boolean as JSON string
export async function writeSetting(key, value) { ... }
```

SettingsContext calls these on mount (read all) and on each toggle (write one).
Components never call AsyncStorage directly — they call the toggle functions from context.

**Error handling:** If AsyncStorage read fails (corrupt data, first install), the default value `true` is used. The failure is logged but not surfaced to the user.

---

## Bubble Burst Animation Sequence

The full long-press interaction is orchestrated in LettersScreen.

```
1. onLongPress fires on LetterBubble
   → setIsAnimating(true)                    // lock further input
   → idlePulse.stop()                        // stop idle loop (owned by LetterBubble via ref)

2. playSfx(letter.audioFile, isSoundEnabled)  // play letter pronunciation immediately
   playSfx('pop.mp3', isSoundEnabled)         // play pop sound immediately

3. Animated.parallel([
     Animated.timing(burstScale,   { toValue: 1.4, duration: 250 }),
     Animated.timing(burstOpacity, { toValue: 0,   duration: 250 }),
   ]).start(onBurstComplete)

4. onBurstComplete callback:
   → hapticsManager.pop(isVibrationEnabled)         // haptic pulse if enabled
   → setCurrentIndex((i) => (i + 1) % letters.length)  // wrap-around advance
   → burstScale.setValue(0)                          // reset for appear animation
   → burstOpacity.setValue(0)
   → [React re-renders LetterBubble with new letter]

5. Appear animation (triggered after index update, new letter rendered):
   Animated.parallel([
     Animated.spring(burstScale,   { toValue: 1, friction: 4, tension: 60 }),
     Animated.timing(burstOpacity, { toValue: 1, duration: 150 }),
   ]).start(onAppearComplete)

6. onAppearComplete:
   → setIsAnimating(false)   // unlock input
   → idle pulse loop restarts inside LetterBubble (via useEffect on isAnimating)
```

**Why audio fires before animation completes:** Letter pronunciation and pop sound play immediately on press — not after the visual finishes. This feels more responsive and natural to the child.

**Why haptics fire after burst completes:** The haptic "pop" lands at the moment the bubble visually disappears, reinforcing the burst. Playing it at press start would feel disconnected from the visual.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property-based testing is appropriate here for the pure logic layers: letter index arithmetic, locale data structure validation, settings persistence round-trip, and the rendering contract between letter data and component output. It is not appropriate for the audio/haptics side effects (which are tested via mocks) or the Expo infrastructure (which is tested via integration).

---

### Property 1: Letter index stays within bounds

*For any* sequence of long-press interactions of any length, starting from any valid letter index, the resulting `currentIndex` SHALL always be in the range `[0, letters.length - 1]`.

**Validates: Requirements 3.3, 3.4**

---

### Property 2: Last letter wraps to first

*For any* locale with `letters.length > 0`, advancing from index `letters.length - 1` SHALL produce index `0`.

**Validates: Requirements 3.4**

---

### Property 3: LetterBubble renders both upper and lower

*For any* letter object `{ upper, lower }` from the locale data, rendering LetterBubble SHALL include both `upper` and `lower` in the output.

**Validates: Requirements 1.4, 3.1**

---

### Property 4: Short tap calls sound manager with correct audioFile

*For any* letter in the letter store, a short tap on LetterBubble SHALL invoke the sound manager with that letter's `audioFile` value.

**Validates: Requirements 2.1, 3.2**

---

### Property 5: Sound disabled prevents SFX playback

*For any* letter and any interaction (tap or long press), when `isSoundEnabled` is `false`, the audio playback API SHALL NOT be called.

**Validates: Requirements 2.4, 4.4**

---

### Property 6: Vibration disabled skips haptics

*For any* letter, when `isVibrationEnabled` is `false`, a long press SHALL NOT call the haptics API.

**Validates: Requirements 3.6, 4.9**

---

### Property 7: Settings persistence round-trip

*For any* combination of boolean values `(isSoundEnabled, isMusicEnabled, isVibrationEnabled)`, writing all three to AsyncStorage and reading them back SHALL produce identical boolean values.

**Validates: Requirements 4.8, 4.10**

---

### Property 8: Settings values are always boolean after initialization

*For any* SettingsContext state after initialization (regardless of what is stored in AsyncStorage, including missing or corrupt data), all three settings values SHALL be `true` or `false` — never `null`, `undefined`, or any other type.

**Validates: Requirements 4.1–4.10**

---

### Property 9: Game mode registry entries have required fields

*For any* entry in the Game_Mode_Registry, the entry SHALL have defined, non-null values for `id` (string), `displayName` (string), `enabled` (boolean), `isPremium` (boolean), and `screen` (string).

**Validates: Requirements 8.1, 16.1**

---

### Property 10: Locale data has required shape per letter

*For any* locale object and *for any* letter in `locale.letters`, the letter SHALL have defined, non-empty values for `id`, `upper`, `lower`, and `audioFile`.

**Validates: Requirements 13.1, 13.2, 13.5**

---

### Property 11: Font size meets minimum for all supported screen widths

*For any* screen width in the range `[360, 480]` dp, `LETTER_FONT_SIZE` SHALL be at least `96`. *For any* screen width `>= 600` dp, `LETTER_FONT_SIZE` SHALL be at least `144`.

**Validates: Requirements 12.3**

---

## Error Handling

### Missing audio file
`playSfx` catches errors from `expo-audio` (e.g. file not found), logs the error with the filename, and returns without playing or throwing. The app continues normally. (Req 2.3)

### AsyncStorage failure
`settingsStorage.readSetting` catches read/parse errors and returns the default value `true`. Write errors are logged. The app uses in-memory state for the session. (Req 4.8)

### Missing locale fields
Components that consume letter data should never receive malformed entries (Property 10 guards this at test time). In production, if `letter.audioFile` is falsy, soundManager substitutes `STUB_AUDIO_FILE`. (Req 2.5)

### Animation interruption
`isAnimating` flag prevents new interactions during the burst animation. The flag is always reset in the `onAnimationComplete` callback — even if audio or haptics fail — so the app never gets stuck in a locked state. The reset is wrapped in a `try/finally`-style sequence: advance index + reset animation + clear flag happen together.

---

## Testing Strategy

### Unit tests (Jest + React Native Testing Library)

Focus on specific examples and edge cases:

- `uk.js` locale data: exactly 33 letters, correct alphabetical order, all required fields present
- `gameModes.js`: all entries have required fields, MVP has exactly one enabled mode with `isPremium: false`
- `settingsStorage.js`: read returns default `true` on missing key, read returns stored value on present key
- `soundManager.js`: does not throw when file is missing; does not call play API when sound disabled
- `LettersScreen`: renders first letter on mount; shows ConfirmDialog on back press; dismisses dialog on Stay; navigates home on Menu
- `ConfirmDialog`: renders Stay and Menu buttons; calls correct callbacks
- Back navigation: hardware back intercepted, routes through dialog

### Property-based tests (fast-check)

Uses [fast-check](https://github.com/dubzzz/fast-check) — the standard PBT library for JavaScript.
Minimum **100 iterations** per property test.
Each test is tagged with the property it validates:

```js
// Tag format: Feature: ukrainian-letters-app, Property N: <property_text>
```

Property tests to implement:

| # | What to generate | What to assert |
|---|---|---|
| P1 | arbitrary sequence of N long-presses (N: 1–200), starting index | index always in [0, letters.length-1] |
| P2 | (no generation needed) start at last index, advance once | result === 0 |
| P3 | arbitrary letter `{ upper, lower, audioFile }` | rendered LetterBubble contains both upper and lower strings |
| P4 | arbitrary letter index | tap calls mock soundManager with `letters[i].audioFile` |
| P5 | arbitrary letter, arbitrary interaction type | with isSoundEnabled=false, mock audio API never called |
| P6 | arbitrary letter | with isVibrationEnabled=false, mock haptics API never called |
| P7 | arbitrary `(boolean, boolean, boolean)` triple | write to mock storage, read back, values match |
| P8 | arbitrary AsyncStorage state (missing, corrupt, valid) | all three settings values are `true` or `false` after init |
| P9 | iterate over gameModes registry | all required fields defined and correct type |
| P10 | iterate over locale letters | all required fields defined and non-empty |
| P11 | arbitrary width in [360, 480] and in [600, 1024] | font size meets minimums |

### Integration / smoke tests

- App launches without crash (Expo managed)
- Portrait orientation is locked (app.json / app.config.js check)
- All audio asset files referenced in locale data are present in `/src/assets/audio/`
- `stub.mp3` exists at expected path

### What is NOT tested by automated tests
- Visual styling / color contrast — manual review
- Bubble animation visual appearance — manual review
- Real device haptics behavior — manual review on device
- Play Store submission assets (icons, splash) — manual review

---

## File Structure

```
/                         ← workspace root (Expo project)
├── App.js                ← entry point: SettingsProvider + NavigationContainer + AppNavigator
├── app.json              ← Expo config: name, slug, orientation (portrait), icons
├── eas.json              ← EAS Build config
├── package.json

/src
  /components
    LetterBubble.js       ← bubble UI + receives Animated values as props
    HomeButton.js         ← small house icon, absolute top-left
    ConfirmDialog.js      ← modal overlay with Stay / Menu buttons
    GameModeCard.js       ← one card per game mode on HomeScreen
    SettingsToggle.js     ← reusable row: icon + label + Switch

  /screens
    HomeScreen.js         ← app name, mascot, game mode cards, settings/about buttons
    LettersScreen.js      ← current letter, animation orchestration, back handler
    SettingsScreen.js     ← reads/writes SettingsContext via toggles
    AboutScreen.js        ← version, description, developer credit

  /data
    /locales
      uk.js               ← Ukrainian locale: strings + 33 letters + audioFile refs
    gameModes.js          ← Game_Mode_Registry array

  /navigation
    AppNavigator.js       ← Stack.Navigator with 4 screens, headerShown: false

  /context
    SettingsContext.js    ← Provider + useContext hook; reads/writes settingsStorage

  /utils
    soundManager.js       ← playSfx, playMusic, stopMusic, pauseMusic, resumeMusic
    hapticsManager.js     ← pop(isEnabled) — wraps expo-haptics
    settingsStorage.js    ← readSetting(key), writeSetting(key, value) — wraps AsyncStorage
    responsive.js         ← BUBBLE_SIZE, LETTER_FONT_SIZE, scale(size)
    theme.js              ← colors, spacing constants

  /assets
    /audio
      stub.mp3            ← silent placeholder for missing letter recordings
      pop.mp3             ← bubble pop sound effect
      /letters
        uk_a.mp3          ← one file per Ukrainian letter (33 total)
        uk_b.mp3
        ... (uk_v, uk_h, uk_g, uk_d, uk_e, uk_ye, uk_zh, uk_z,
             uk_y, uk_i, uk_yi, uk_j, uk_k, uk_l, uk_m, uk_n,
             uk_o, uk_p, uk_r, uk_s, uk_t, uk_u, uk_f, uk_kh,
             uk_ts, uk_ch, uk_sh, uk_shch, uk_soft, uk_yu, uk_ya)
    /images
      mascot.png          ← child-friendly mascot shown on HomeScreen
      icon.png            ← launcher icon (1024×1024 source)
      splash.png          ← splash screen image

/tests
  /unit
    localeData.test.js
    gameModes.test.js
    settingsStorage.test.js
    soundManager.test.js
    responsive.test.js
    LettersScreen.test.js
    ConfirmDialog.test.js
  /property
    letterIndex.property.test.js    ← P1, P2
    letterBubble.property.test.js   ← P3, P4, P5, P6
    settings.property.test.js       ← P7, P8
    registry.property.test.js       ← P9
    locale.property.test.js         ← P10
    responsive.property.test.js     ← P11
```

---

## Key Design Decisions and Rationale

| Decision | Rationale |
|---|---|
| Animation values owned by LettersScreen, not LetterBubble | Animation lifecycle must be coordinated with audio + haptics + index advance — all of which live in LettersScreen |
| soundManager takes settings as arguments (not via context hook) | Keeps soundManager a pure utility, testable without React context setup |
| Uses `createAudioPlayer` from `expo-audio` (not `expo-av`) | `expo-av` was removed in SDK 55; `expo-audio` is the current API for SDK 57+ |
| settingsStorage is a separate util, not called from components | Enforces the coding-standards rule: no direct AsyncStorage in components |
| useFocusEffect + BackHandler for back interception | Correct Expo/RN pattern for per-screen hardware back override; useEffect alone doesn't handle re-focus |
| Dimensions read at module load in responsive.js | Portrait lock means width never changes; no runtime resize listener needed |
| No animation library beyond RN Animated | Single burst animation doesn't justify an additional dependency; keeps the bundle lean |
| Locale file is the single source of truth for letter order | Alphabetical order is enforced by the data file, not by any runtime sort — easy to verify in tests |
