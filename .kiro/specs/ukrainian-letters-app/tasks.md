# Implementation Plan: Chytaychik (Читайчик)

## Overview

Build an offline-first React Native + Expo app for children aged 4–7 to learn Ukrainian letters.
JavaScript (no TypeScript), Expo managed workflow, React Navigation v6, expo-audio for audio, expo-haptics for vibration, AsyncStorage for settings persistence.
Tasks are grouped into phases that build on each other: foundation first, then context + utilities, then navigation, then screens, then tests, then release prep.

---

## Tasks

- [x] 1. Project setup — Expo project, folder structure, dependencies
  - [x] 1.1 Initialise Expo managed-workflow project
    - Run `npx create-expo-app chytaychik --template blank` (bare JS, no TypeScript)
    - Verify `App.js`, `app.json`, and `package.json` are generated
    - _Requirements: 9.1–9.6_
  - [x] 1.2 Create the full folder structure under `/src`
    - Create empty `.gitkeep` files so directories are tracked: `/src/components`, `/src/screens`, `/src/data/locales`, `/src/navigation`, `/src/context`, `/src/utils`, `/src/assets/audio/letters`, `/src/assets/images`
    - Create `/tests/unit` and `/tests/property` directories
    - _Requirements: 13.1, 13.2_
  - [x] 1.3 Install all required dependencies
    - Navigation: `@react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context`
    - Audio: `expo-audio`
    - Haptics: `expo-haptics`
    - Storage: `@react-native-async-storage/async-storage`
    - Icons: `@expo/vector-icons` (already bundled with Expo — verify it is available)
    - Testing: `jest`, `@testing-library/react-native`, `fast-check`
    - Add Jest config to `package.json` (preset: `jest-expo`, `transformIgnorePatterns` for RN modules)
    - _Requirements: 4.8, 4.10, 5.3_

- [ ] 2. Foundation — theme, responsive, locale data, game mode registry, stub audio, settings storage
  - [ ] 2.1 Create `/src/utils/theme.js`
    - Export named constants: `COLORS` (background, primary, accent, text, bubbleBlue, white, overlay), `SPACING` (sm, md, lg, xl), `BORDER_RADIUS`
    - No inline values elsewhere — all colours reference this file
    - _Requirements: 6.2, 7.7_
  - [ ] 2.2 Create `/src/utils/responsive.js`
    - Import `Dimensions` from React Native; compute `width` once at module load (portrait lock — width is stable)
    - Export: `IS_TABLET` (width >= 600), `BUBBLE_SIZE` (tablet: `width * 0.55`, phone: `width * 0.72`), `LETTER_FONT_SIZE` (tablet: 144, phone: 96), `scale(size)` helper using base width 375
    - Export `MIN_TAP_TARGET = 48`
    - _Requirements: 12.1–12.5, 6.1_
  - [ ] 2.3 Create `/src/data/locales/uk.js` — Ukrainian locale with all 33 letters
    - Export default object with shape: `{ id, languageName, strings, letters }`
    - `strings`: `appName`, `settingsTitle`, `aboutTitle`, `soundLabel`, `musicLabel`, `vibrationLabel`, `confirmStay`, `confirmMenu`, `aboutDescription`, `versionLabel`
    - `letters`: array of 33 objects `{ id, upper, lower, audioFile }` in correct Ukrainian alphabetical order:
      А Б В Г Ґ Д Е Є Ж З И І Ї Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ь Ю Я
    - `audioFile` for each letter references the matching file in `/src/assets/audio/letters/` (e.g. `uk_a.mp3`); letters without a real recording reference `stub.mp3`
    - Export a named `STUB_AUDIO_FILE = 'stub.mp3'` constant from this file
    - _Requirements: 1.3, 2.5, 13.1–13.5_
  - [ ] 2.4 Create `/src/data/gameModes.js` — Game Mode Registry
    - Export default array with one entry for MVP: `{ id: 'letters', displayName: 'Літери', enabled: true, isPremium: false, freeLetterCount: null, screen: 'Letters' }`
    - `freeLetterCount: null` means all letters are available (fully free mode)
    - Future premium modes will set `freeLetterCount: N` to limit preview to first N letters
    - _Requirements: 8.1–8.9, 16.1–16.7_
  - [ ] 2.5 Add stub audio placeholder at `/src/assets/audio/stub.mp3`
    - Copy or generate a short silent `.mp3` file (≤1 second) and place it at this path
    - This is the only audio asset required to unblock development; real letter recordings are added later
    - _Requirements: 2.5, 5.3_
  - [ ] 2.6 Create `/src/utils/settingsStorage.js`
    - Import `AsyncStorage` from `@react-native-async-storage/async-storage`
    - Define `KEYS` constant object: `SOUND: '@settings/sound'`, `MUSIC: '@settings/music'`, `VIBRATION: '@settings/vibration'`
    - Export `readSetting(key)` — async, returns `boolean` (default `true` on missing key or parse error, logs error)
    - Export `writeSetting(key, value)` — async, writes boolean as JSON string, logs write errors
    - No direct AsyncStorage calls anywhere else in the codebase
    - _Requirements: 4.8, 4.10_

- [ ] 3. SettingsContext — global settings state with AsyncStorage persistence
  - [ ] 3.1 Create `/src/context/SettingsContext.js`
    - Create context with default shape: `{ isSoundEnabled, isMusicEnabled, isVibrationEnabled, toggleSound, toggleMusic, toggleVibration }`
    - `SettingsProvider` component: on mount, read all three keys from `settingsStorage` in parallel (`Promise.all`), set state; fall back to `true` for each on error
    - Each toggle function: flip the boolean in state → immediately call `writeSetting` (fire-and-forget, log errors)
    - Export `SettingsProvider` and `useSettings` convenience hook (`useContext(SettingsContext)`)
    - _Requirements: 4.1–4.10_
  - [ ] 3.2 Wire `SettingsProvider` into `App.js`
    - Wrap the entire app: `<SettingsProvider> ... </SettingsProvider>` as the outermost component
    - _Requirements: 4.8, 4.10_

- [ ] 4. Utilities — sound manager and haptics manager
  - [ ] 4.1 Create `/src/utils/soundManager.js`
    - Import `createAudioPlayer` from `expo-audio`
    - Manage two module-level player objects: `_sfxPlayer` and `_musicPlayer`
    - `playSfx(filename, isSoundEnabled)` — if `!isSoundEnabled` return immediately; resolve source from `/src/assets/audio/letters/<filename>` (fall back to `stub.mp3` require if filename is falsy); if `_sfxPlayer` already exists, call `_sfxPlayer.remove()` first; create a new player with `createAudioPlayer(source)`, call `.play()`, catch errors, log them, do not throw
    - `playMusic(filename, isMusicEnabled)` — if `!isMusicEnabled` return; create `_musicPlayer` from `/src/assets/audio/<filename>`, set `_musicPlayer.loop = true`, call `.play()`
    - `stopMusic()` — if `_musicPlayer` exists, call `.pause()` then `.remove()`, set to null
    - `pauseMusic()` — if `_musicPlayer` exists, call `.pause()`
    - `resumeMusic(isMusicEnabled)` — if `!isMusicEnabled` return; if `_musicPlayer` exists, call `.play()`
    - Pure utility — no `useContext` inside this file; settings values are passed as arguments by the caller
    - Note: `createAudioPlayer` returns a player that auto-loads; no explicit async load step needed
    - _Requirements: 2.1–2.4, 4.4–4.7, 5.3_
  - [ ]* 4.2 Write unit tests for `soundManager.js` — `/tests/unit/soundManager.test.js`
    - Mock `expo-audio` (`createAudioPlayer` returns a mock with `.play()`, `.remove()`, `.loop` setter); test: does not throw when file missing; does not call play API when `isSoundEnabled` is false; calls play when enabled; calls remove + creates new player when called while a player already exists
    - _Requirements: 2.1–2.4_
  - [ ] 4.3 Create `/src/utils/hapticsManager.js`
    - Import `Haptics` from `expo-haptics`
    - Export `pop(isVibrationEnabled)` — if `!isVibrationEnabled` return; call `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`
    - _Requirements: 3.3d, 3.6, 4.9_

- [ ] 5. Navigation — AppNavigator wiring all four screens
  - [ ] 5.1 Create `/src/navigation/AppNavigator.js`
    - Import `createStackNavigator` from `@react-navigation/stack`
    - Register four screens: `Home → HomeScreen`, `Letters → LettersScreen`, `Settings → SettingsScreen`, `About → AboutScreen`
    - `screenOptions={{ headerShown: false }}` on the navigator — all screens own their own chrome
    - `initialRouteName="Home"`
    - _Requirements: 7.1, 14.1_
  - [ ] 5.2 Update `App.js` to mount the navigation tree
    - Wrap with `NavigationContainer` inside `SettingsProvider`
    - Import and render `AppNavigator`
    - Tree: `<SettingsProvider> <NavigationContainer> <AppNavigator /> </NavigationContainer> </SettingsProvider>`
    - _Requirements: 7.1_

- [ ] 6. HomeScreen
  - [ ] 6.1 Create stub screen files for `LettersScreen`, `SettingsScreen`, and `AboutScreen`
    - Each returns a minimal `<View><Text>...</Text></View>` so navigation can be tested before full implementation
    - _Requirements: 7.1_
  - [ ] 6.2 Implement `/src/screens/HomeScreen.js`
    - Display mascot/logo image from `/src/assets/images/mascot.png` (use a placeholder colour block if image not yet available)
    - Display app name from `locale.strings.appName` — never hardcoded
    - Render one `GameModeCard` per entry in `gameModes` registry (import registry, map over it)
    - "Settings" button navigates to `Settings` screen; "About" button navigates to `About` screen
    - All tap targets ≥ 48×48dp; bright high-contrast colours from `theme.js`
    - No hardcoded strings — all text from `uk.js` locale
    - _Requirements: 7.1–7.8, 8.2–8.4_
  - [ ] 6.3 Implement `/src/components/GameModeCard.js`
    - Props: `{ mode, onPress }`
    - Renders card for `mode.displayName`; if `mode.enabled === false` render greyed-out state; if `mode.isPremium === true` render lock icon overlay (using `@expo/vector-icons`)
    - Tap target ≥ 48×48dp
    - _Requirements: 8.2, 8.3, 16.2, 16.3_

- [ ] 7. SettingsScreen
  - [ ] 7.1 Implement `/src/components/SettingsToggle.js`
    - Props: `{ label, value, onToggle, icon }`
    - Renders a row: icon (from `@expo/vector-icons`) + label text + React Native `Switch`
    - Tap target row ≥ 48×48dp; label and icon from locale, not hardcoded
    - _Requirements: 4.1–4.3, 4.9, 6.1_
  - [ ] 7.2 Implement `/src/screens/SettingsScreen.js`
    - Read `{ isSoundEnabled, isMusicEnabled, isVibrationEnabled, toggleSound, toggleMusic, toggleVibration }` from `useSettings()`
    - Render three `SettingsToggle` rows: Sound, Music, Vibration — labels from locale strings
    - Back button (arrow icon, ≥ 48×48dp) navigates back to Home
    - No state owned here — all state lives in SettingsContext
    - _Requirements: 4.1–4.10_

- [ ] 8. AboutScreen
  - [ ] 8.1 Implement `/src/screens/AboutScreen.js`
    - Display app version name and version code (read from `expo-constants` `Constants.expoConfig.version` and `Constants.expoConfig.android.versionCode`)
    - Display purpose description from `locale.strings.aboutDescription`
    - Display developer/author credit
    - Back button (arrow icon, ≥ 48×48dp) navigates back to Home
    - _Requirements: 10.1–10.5_

- [ ] 9. LettersScreen — core game loop
  - [ ] 9.1 Implement `/src/components/LetterBubble.js`
    - Props: `{ letter, onShortTap, onLongPress, isAnimating, animatedScale, animatedOpacity }`
    - Visual structure: `Animated.View` (scale + opacity) → bubble container circle → sheen highlight (absolute, top-left) → letter text (upper + lower stacked, centred)
    - Bubble style: `borderRadius: BUBBLE_SIZE / 2`, semi-transparent teal/blue `rgba(100, 200, 255, 0.6)`, white glass-edge border, `elevation: 8` (Android) + shadow props (iOS)
    - Sheen: ~25% of bubble size, `opacity: 0.4`, `position: 'absolute'`, top-left offset
    - Font size from `LETTER_FONT_SIZE` in `responsive.js`
    - When `isAnimating` is true, `onShortTap` and `onLongPress` are no-ops
    - Own `idleScale` and `pressScale` Animated.Values internally; start idle pulse loop on mount (`Animated.loop` sequence ±1.05 over 2 s); restart idle loop when `isAnimating` changes to false
    - Press feedback: `onPressIn` springs `pressScale` to 0.93; `onPressOut` springs back to 1.0
    - _Requirements: 1.1, 1.2, 1.4, 3.1, 3.5, 3.7, 6.1_
  - [ ] 9.2 Implement `/src/components/HomeButton.js`
    - Props: `{ onPress }`
    - Absolute-positioned house icon (`@expo/vector-icons`), top-left corner, minimum 48×48dp tap target
    - Visually subtle but clearly recognisable
    - _Requirements: 14.6, 14.7_
  - [ ] 9.3 Implement `/src/components/ConfirmDialog.js`
    - Props: `{ visible, onStay, onMenu }`
    - React Native `Modal` with semi-transparent overlay
    - Two large icon buttons: ✋ Stay and 🏠 Menu — icon-only, no required reading ability, ≥ 48×48dp each
    - Labels from locale strings (`confirmStay`, `confirmMenu`)
    - _Requirements: 14.1–14.9_
  - [ ] 9.4 Implement `/src/screens/LettersScreen.js` — full game loop
    - Import locale letters array and current game mode from registry
    - Compute `availableLetters`: `mode.freeLetterCount ? locale.letters.slice(0, mode.freeLetterCount) : locale.letters` — this is the only change needed to support premium preview modes
    - `currentIndex` state initialised to 0; `isAnimating` state; `showConfirmDialog` state
    - Own `burstScale` (Animated.Value, initial 1) and `burstOpacity` (Animated.Value, initial 1)
    - Render `LetterBubble` with current letter and animation values; render `HomeButton`; render `ConfirmDialog` when `showConfirmDialog` is true
    - Short tap handler: call `soundManager.playSfx(letter.audioFile, isSoundEnabled)`
    - Long press handler (full burst sequence):
      1. `setIsAnimating(true)`; stop idle pulse (via ref exposed from LetterBubble or via isAnimating prop)
      2. `soundManager.playSfx(letter.audioFile, isSoundEnabled)`; `soundManager.playSfx('pop.mp3', isSoundEnabled)`
      3. Run `Animated.parallel([burstScale → 1.4, burstOpacity → 0], duration 250ms)`.start(onBurstComplete)
      4. `onBurstComplete`: call `hapticsManager.pop(isVibrationEnabled)`; advance index `(i + 1) % letters.length`; reset `burstScale` to 0, `burstOpacity` to 0
      5. Run appear animation: `Animated.parallel([spring burstScale → 1, timing burstOpacity → 1])`.start(onAppearComplete)
      6. `onAppearComplete`: `setIsAnimating(false)`
    - `useFocusEffect` + `BackHandler`: on focus add listener that returns `true` (blocks default) and sets `showConfirmDialog(true)`; clean up on blur
    - HomeButton `onPress` calls same handler as BackHandler
    - ConfirmDialog: `onStay` dismisses dialog; `onMenu` navigates to Home
    - Read `{ isSoundEnabled, isVibrationEnabled }` from `useSettings()`
    - _Requirements: 1.1–1.4, 2.1–2.4, 3.1–3.8, 14.1–14.9_

- [ ] 10. Checkpoint — smoke test navigation and core flow
  - Ensure all four screens are reachable from HomeScreen
  - Ensure LetterBubble renders the first Ukrainian letter on LettersScreen mount
  - Ensure ConfirmDialog appears on hardware back press in LettersScreen
  - Ensure Settings toggles update context state and persist on app restart (manual check with Expo Go)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Unit tests
  - [ ] 11.1 Write unit tests for `/src/data/locales/uk.js` — `/tests/unit/localeData.test.js`
    - Assert exactly 33 letters in the array
    - Assert alphabetical order matches the canonical Ukrainian alphabet sequence
    - Assert every letter has defined non-empty `id`, `upper`, `lower`, `audioFile`
    - Assert `locale.id === 'uk'` and required `strings` keys are present
    - _Requirements: 1.3, 2.5, 13.1–13.5_
  - [ ] 11.2 Write unit tests for `/src/data/gameModes.js` — `/tests/unit/gameModes.test.js`
    - Assert array has at least one entry
    - Assert MVP has exactly one enabled mode
    - Assert all MVP modes have `isPremium === false`
    - Assert all entries have required fields with correct types
    - _Requirements: 8.1–8.8, 16.1–16.4_
  - [ ] 11.3 Write unit tests for `/src/utils/settingsStorage.js` — `/tests/unit/settingsStorage.test.js`
    - Mock `@react-native-async-storage/async-storage`
    - Assert `readSetting` returns `true` when key is missing
    - Assert `readSetting` returns `true` when stored value is corrupt/unparseable
    - Assert `readSetting` returns stored boolean when key is present
    - Assert `writeSetting` stores the correct serialised value
    - _Requirements: 4.8, 4.10_
  - [ ] 11.4 Write unit tests for `/src/utils/soundManager.js` — `/tests/unit/soundManager.test.js`
    - Mock `expo-audio` (`createAudioPlayer` returns mock with `.play()`, `.remove()`, `.loop` setter)
    - Assert `playSfx` does not call the Audio API when `isSoundEnabled` is false
    - Assert `playSfx` calls `createAudioPlayer` + `.play()` when enabled
    - Assert `playSfx` calls `.remove()` on the previous player and creates a new one when called while a player already exists
    - Assert no throw when file is missing (error is logged)
    - _Requirements: 2.1–2.4_
  - [ ] 11.5 Write unit tests for `/src/utils/responsive.js` — `/tests/unit/responsive.test.js`
    - Mock `Dimensions.get` to return phone width (375), assert `IS_TABLET` false, `LETTER_FONT_SIZE` 96, `BUBBLE_SIZE` ~0.72 * 375
    - Mock to return tablet width (768), assert `IS_TABLET` true, `LETTER_FONT_SIZE` 144
    - Assert `scale(375)` returns 375 for base width; `scale(0)` returns 0
    - _Requirements: 12.1–12.5_
  - [ ] 11.6 Write unit tests for `LettersScreen` — `/tests/unit/LettersScreen.test.js`
    - Mock `soundManager`, `hapticsManager`, navigation; wrap with `SettingsProvider`
    - Assert first letter from locale is rendered on mount
    - Assert `ConfirmDialog` appears when hardware back button is pressed
    - Assert "Stay" dismisses dialog without navigating
    - Assert "Menu" navigates to Home screen
    - _Requirements: 3.8, 14.1–14.9_
  - [ ] 11.7 Write unit tests for `ConfirmDialog` — `/tests/unit/ConfirmDialog.test.js`
    - Assert Stay button is rendered and calls `onStay`
    - Assert Menu button is rendered and calls `onMenu`
    - Assert dialog is not visible when `visible` is false
    - _Requirements: 14.2, 14.3_

- [ ] 12. Property-based tests — all 11 properties using fast-check
  - [ ] 12.1 Write property tests for letter index arithmetic — `/tests/property/letterIndex.property.test.js`
    - **Property 1:** For any start index and any sequence of N advances (N in [1, 200]), `currentIndex` stays in `[0, letters.length - 1]`
    - **Property 2:** Advancing from `letters.length - 1` produces index `0`
    - **Validates: Requirements 3.3, 3.4**
  - [ ]* 12.2 Write property tests for LetterBubble rendering — `/tests/property/letterBubble.property.test.js`
    - **Property 3:** For any `{ upper, lower, audioFile }` letter object, rendered LetterBubble output contains both `upper` and `lower`
    - **Property 4:** For any letter index, short tap calls mock soundManager with `letters[i].audioFile`
    - **Property 5:** For any letter and any interaction, with `isSoundEnabled = false` the mock audio API is never called
    - **Property 6:** For any letter, with `isVibrationEnabled = false` a long press never calls the mock haptics API
    - **Validates: Requirements 1.4, 2.1, 2.4, 3.1, 3.2, 3.6, 4.4, 4.9**
  - [ ]* 12.3 Write property tests for settings persistence — `/tests/property/settings.property.test.js`
    - **Property 7:** For any triple `(boolean, boolean, boolean)`, writing all three to mock storage and reading back produces identical values
    - **Property 8:** For any AsyncStorage state (missing, corrupt, or valid), all three settings values after init are `true` or `false` — never `null`, `undefined`, or other type
    - **Validates: Requirements 4.8, 4.10**
  - [ ]* 12.4 Write property tests for game mode registry — `/tests/property/registry.property.test.js`
    - **Property 9:** For every entry in the registry, `id` (string), `displayName` (string), `enabled` (boolean), `isPremium` (boolean), and `screen` (string) are all defined and non-null
    - **Validates: Requirements 8.1, 16.1**
  - [ ]* 12.5 Write property tests for locale data shape — `/tests/property/locale.property.test.js`
    - **Property 10:** For every letter in `locale.letters`, `id`, `upper`, `lower`, and `audioFile` are all defined and non-empty strings
    - **Validates: Requirements 13.1, 13.2, 13.5**
  - [ ]* 12.6 Write property tests for responsive sizing — `/tests/property/responsive.property.test.js`
    - **Property 11:** For any screen width in `[360, 480]`, `LETTER_FONT_SIZE` ≥ 96; for any width ≥ 600, `LETTER_FONT_SIZE` ≥ 144
    - **Validates: Requirements 12.3**

- [ ] 13. Release preparation
  - [ ] 13.1 Configure `app.json` for Play Store submission
    - Set `orientation: "portrait"` (locks to portrait on both platforms)
    - Set unique `android.package` bundle ID (e.g. `com.yourname.chytaychik`)
    - Set `version` (semantic, e.g. `"1.0.0"`) and `android.versionCode: 1`
    - Set `android.minSdkVersion` and `android.targetSdkVersion`
    - Add `privacy policy` placeholder URL in description field
    - _Requirements: 9.3, 9.4, 9.5, 11.1, 11.2, 15.5_
  - [ ] 13.2 Add launcher icon and adaptive icon assets
    - Place 1024×1024 source PNG at `/src/assets/images/icon.png`
    - Configure `app.json` `icon`, `android.adaptiveIcon.foregroundImage`, and `android.adaptiveIcon.backgroundColor`
    - _Requirements: 9.1_
  - [ ] 13.3 Configure splash screen
    - Place splash image at `/src/assets/images/splash.png`
    - Configure `app.json` `splash.image`, `splash.backgroundColor`, and `splash.resizeMode`
    - _Requirements: 9.2_
  - [ ]* 13.4 Create `eas.json` with EAS Build configuration
    - Define `build.production` profile with `android.buildType: "apk"` (or `aab` for Play Store)
    - _Requirements: 9.4_

- [ ] 14. Final checkpoint — all tests pass, release assets in place
  - Run `npx jest --runInBand` and confirm all unit and property tests pass
  - Confirm `app.json` has portrait lock, bundle ID, version, and icon/splash paths set
  - Confirm `stub.mp3` exists and all locale `audioFile` references resolve to a file (or `stub.mp3`)
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional — they can be skipped for a faster MVP build but are recommended for long-term quality
- Property 3–6 tests (task 12.2) require React Native Testing Library and mocking expo-audio; mark as optional since the rendering tests may need additional setup
- Background music (`playMusic` / `stopMusic`) stubs are implemented in task 4.1 but no real music file exists yet — the Music toggle in Settings will work but playback is silent until a real file is added
- All locale strings must come from `uk.js` — never hardcode Ukrainian text in JSX
- The `STUB_AUDIO_FILE` constant in `uk.js` is used by the data layer, not by `soundManager` directly — the sound manager receives whatever `audioFile` string the data provides
- Real letter pronunciation recordings (`uk_a.mp3` … `uk_ya.mp3`) can be added to `/src/assets/audio/letters/` at any point — the data layer wires them automatically
- Each property test must include the tag comment: `// Feature: ukrainian-letters-app, Property N: <property_text>`
- Minimum 100 iterations per fast-check property (configure via `fc.assert(fc.property(...), { numRuns: 100 })`)
