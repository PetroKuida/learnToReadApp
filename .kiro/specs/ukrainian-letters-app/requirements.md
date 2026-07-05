# Requirements Document

## Introduction

A mobile application for children aged 4–7 to learn Ukrainian letters and their pronunciation.
The development name of the app is "Chytaychik" (Читайчик), used as a placeholder until a final name is chosen.
The app displays one letter at a time, plays its sound on tap, and lets the child navigate between letters.
A simple Settings screen allows toggling sound on or off.
The app works fully offline and requires no adult assistance to operate.
It is built with React Native targeting Android first, with the codebase structured to support iOS later.
The final release target is the Google Play Store (Android), with the architecture supporting a future iOS App Store release.
The app targets the Google Play "Designed for Families" program: it displays no advertisements, collects no personal data, and includes no third-party advertising SDKs.

## Glossary

- **App**: The Ukrainian Letters mobile application.
- **Letter_Card**: The UI component that displays a single Ukrainian letter.
- **Letter**: A single character from the Ukrainian alphabet, stored in the data layer.
- **Sound**: The audio file associated with a letter, representing its pronunciation.
- **Navigator**: The component responsible for moving between letters (next/previous).
- **Settings**: The screen where the user can configure app-wide preferences.
- **Sound_Manager**: The utility responsible for managing two audio channels: SFX (sound effects) and Background_Music.
- **SFX**: Sound effects — all non-music audio including letter pronunciation, bubble pop sound, navigation sounds, and UI feedback sounds. Controlled by the Sound toggle in Settings.
- **Bubble_Burst**: The animation and interaction sequence triggered by a long press on the Letter_Card — includes letter sound, pop sound, burst animation, optional haptic vibration, and auto-advance to the next Letter.
- **Haptics**: Short vibration pulses triggered on specific interactions (e.g., Bubble_Burst). Controlled by the Vibration toggle in Settings. Implemented using expo-haptics.
- **Background_Music**: Looping ambient audio that plays during gameplay. Controlled by the Music toggle in Settings.
- **Letter_Store**: The data module that holds the list of Ukrainian letters and their associated metadata.
- **Home_Screen**: The starting screen of the App, from which the user launches a game mode or navigates to Settings.
- **Game_Mode**: A self-contained learning activity (e.g., Letters, Words, Matching) accessible from the Home_Screen.
- **Game_Mode_Registry**: The data structure that holds the list of available Game_Modes and their enabled/disabled state, premium flag, and free letter count.
- **Free_Letter_Count**: The number of letters from the locale available in a premium Game_Mode for free preview. `null` means all letters are available (fully free mode). A numeric value limits the mode to the first N letters, which loop infinitely.
- **Letters_Mode**: The MVP Game_Mode that displays Ukrainian letters one at a time with sound on tap.
- **About_Screen**: The screen that displays information about the App, including version details, purpose description, and developer credit.
- **Locale**: A language and regional data set containing all user-facing strings and letter data for a specific language.
- **Stub_Audio**: A placeholder audio file used in development when a final pronunciation recording is not yet available.
- **Parental_Gate**: A challenge (e.g., a simple math question) that prevents children from accidentally accessing adult-oriented content or external links.
- **Premium_Mode**: A Game_Mode with `isPremium` set to true that requires a one-time purchase to unlock. Not active in MVP.

---

## Requirements

### Requirement 1: Display Ukrainian Letters

**User Story:** As a child, I want to see one Ukrainian letter at a time displayed clearly on screen, so that I can focus on learning one letter without distraction.

#### Acceptance Criteria

1. THE App SHALL display exactly one Letter at a time, presented visually as a bubble (a circular or rounded container styled to look like a bubble).
2. THE Letter_Card SHALL render the letter in a large, child-readable font (minimum 96sp).
3. THE Letter_Store SHALL contain all 33 letters of the modern Ukrainian alphabet in correct alphabetical order.
4. THE Letter_Card SHALL display both the uppercase and lowercase form of the Letter.

---

### Requirement 2: Play Letter Sound on Tap

**User Story:** As a child, I want to hear the sound of a letter when I tap it, so that I can learn how it is pronounced.

#### Acceptance Criteria

1. WHEN the child taps the Letter_Card, THE Sound_Manager SHALL play the audio file associated with the currently displayed Letter.
2. WHEN a sound is already playing and the child taps the Letter_Card again, THE Sound_Manager SHALL stop the current sound and restart it from the beginning.
3. IF the audio file for a Letter is missing, THEN THE Sound_Manager SHALL log an error and take no audible action.
4. WHILE Sound is disabled in Settings, THE Sound_Manager SHALL not play any SFX audio when the Letter_Card is tapped.
5. THE Letter_Store SHALL define a Stub_Audio file (e.g., a short silent or beep .mp3) that is used as a placeholder for any Letter that does not yet have a real pronunciation recording.

---

### Requirement 3: Letter Bubble Interaction

**User Story:** As a child, I want to interact with the letter bubble by tapping or pressing it, so that I can hear the letter and pop the bubble to move to the next one.

#### Acceptance Criteria

1. THE Letter_Card SHALL be displayed as a bubble — a circular or rounded container with a bubble-like visual style.
2. WHEN the child performs a short tap on the Letter_Card, THE Sound_Manager SHALL play the SFX audio file associated with the currently displayed Letter.
3. WHEN the child performs a long press on the Letter_Card, THE App SHALL:
   a. Play the letter's SFX audio file
   b. Play a bubble pop SFX sound
   c. Trigger a bubble burst animation (scale + fade out) on the Letter_Card
   d. Trigger a haptic vibration pulse (if Vibration is enabled in Settings)
   e. After the animation completes, display the next Letter in the sequence
4. WHEN the child long presses the Letter_Card on the last Letter in the Letter_Store, THE App SHALL advance to the first Letter (infinite loop — no end state).
5. WHEN the bubble burst animation is in progress, THE App SHALL ignore additional tap or long press inputs on the Letter_Card.
6. WHILE Vibration is disabled in Settings, THE App SHALL skip the haptic pulse on long press.
7. THE App SHALL use React Native's built-in Animated API for the bubble burst animation (no third-party animation library).
8. WHEN the App launches the Letters_Mode, THE Letter_Card SHALL display the first Letter in the Letter_Store.

---

### Requirement 4: Settings Screen — Sound, Music, and Vibration Toggles

**User Story:** As a parent or child, I want to separately control sound effects, background music, and vibration from a Settings screen, so that the app can be used in quiet environments or with music and haptics turned off independently.

#### Acceptance Criteria

1. THE App SHALL provide a Settings screen accessible from the Home_Screen.
2. THE Settings screen SHALL display a toggle for enabling or disabling Sound (all non-music audio).
3. THE Settings screen SHALL display a toggle for enabling or disabling Music (background music).
4. WHEN the Sound toggle is switched off, THE Sound_Manager SHALL not play any non-music audio for the remainder of the session.
5. WHEN the Sound toggle is switched on, THE Sound_Manager SHALL resume playing non-music audio when triggered.
6. WHEN the Music toggle is switched off, THE Sound_Manager SHALL stop background music immediately and not resume it until re-enabled.
7. WHEN the Music toggle is switched on, THE Sound_Manager SHALL resume background music playback.
8. THE App SHALL persist both the Sound and Music preferences across app restarts.
9. THE Settings screen SHALL display a toggle for enabling or disabling Vibration (haptic feedback on bubble pop).
10. THE App SHALL persist the Vibration preference across app restarts.

---

### Requirement 5: Offline Operation

**User Story:** As a parent, I want the app to work without an internet connection, so that my child can use it anywhere.

#### Acceptance Criteria

1. THE App SHALL function fully without a network connection.
2. THE Letter_Store SHALL be bundled with the app at build time and require no network access.
3. THE Sound_Manager SHALL load audio files from the local app bundle and require no network access.
4. IF a network connection is unavailable, THEN THE App SHALL continue to operate without displaying any error related to connectivity.

---

### Requirement 6: Child-Appropriate UI

**User Story:** As a child aged 4–7, I want the interface to be simple and easy to use without adult help, so that I can learn independently.

#### Acceptance Criteria

1. THE App SHALL use large tap targets for all interactive elements (minimum 48×48dp per platform guidelines).
2. THE App SHALL use bright, high-contrast colors to distinguish interactive elements from the background.
3. THE App SHALL not display any text-based menus or instructions that require reading ability to navigate.
4. THE Navigator buttons SHALL be represented by recognizable directional icons (arrows), not text labels.
5. THE App SHALL not require account creation, login, or any form input to begin use.

---

### Requirement 7: Home Screen

**User Story:** As a child or parent, I want a welcoming starting screen when the app opens, so that I can choose what to do before entering a learning activity.

#### Acceptance Criteria

1. WHEN the App launches, THE Home_Screen SHALL be the first screen displayed.
2. THE Home_Screen SHALL display the app name in Ukrainian.
3. THE Home_Screen SHALL display a prominent "Start" button that launches the Letters_Mode.
4. THE Home_Screen SHALL display a "Settings" button that navigates to the Settings screen.
5. THE Home_Screen SHALL display a child-friendly visual element (logo or mascot) that occupies a meaningful portion of the screen.
6. THE Home_Screen SHALL use large tap targets for all interactive elements (minimum 48×48dp per platform guidelines).
7. THE Home_Screen SHALL use bright, high-contrast colors consistent with the child-appropriate UI defined in Requirement 6.
8. THE Home_Screen SHALL display an "About" button that navigates to the About_Screen.

---

### Requirement 8: Extensible Game Mode Architecture

**User Story:** As a developer, I want the app architecture to support adding new game modes without restructuring the app, so that the app can grow with new learning activities over time.

#### Acceptance Criteria

1. THE Game_Mode_Registry SHALL define each Game_Mode as a discrete, independently navigable unit with a unique identifier, display name, and enabled flag.
2. THE Home_Screen SHALL render its list of available Game_Modes from the Game_Mode_Registry, not from a hardcoded layout.
3. WHEN a Game_Mode has its enabled flag set to false, THE Home_Screen SHALL either hide that Game_Mode or display it as unavailable, without requiring code changes to the Home_Screen component.
4. WHEN a new Game_Mode entry is added to the Game_Mode_Registry, THE Home_Screen SHALL display it without requiring structural changes to the Home_Screen component.
5. THE App SHALL ship with exactly one enabled Game_Mode in the Game_Mode_Registry: Letters_Mode.
6. THE Letters_Mode SHALL implement the behaviour defined in Requirements 1, 2, and 3.
7. THE Game_Mode_Registry SHALL include an `isPremium` flag for each Game_Mode, indicating whether the mode requires a paid unlock.
8. THE Game_Mode_Registry SHALL include a `freeLetterCount` field for each Game_Mode: `null` for fully free modes (all letters available), or a positive integer for premium preview modes (only first N letters available until purchased).
9. FOR MVP, ALL Game_Modes in the Game_Mode_Registry SHALL have `isPremium` set to false and `freeLetterCount` set to null (all content is free).

---

### Requirement 9: Play Store Release Readiness

**User Story:** As a developer, I want the app to meet Google Play Store submission requirements, so that it can be published and downloaded by users.

#### Acceptance Criteria

1. THE App SHALL include a launcher icon that meets Google Play Store icon specifications (512×512px PNG for store listing; adaptive icon assets for device display).
2. THE App SHALL display a splash screen during launch before the Home_Screen is shown.
3. THE App SHALL declare a version name and version code in the Android build configuration, following semantic versioning for the version name.
4. THE App SHALL declare a unique application ID in the Android build configuration.
5. THE App SHALL declare the minimum required Android SDK version and the target SDK version in the build configuration.
6. WHERE the App is built for iOS, THE App SHALL include the equivalent required assets and metadata to meet Apple App Store submission requirements.

---

### Requirement 10: About Screen

**User Story:** As a parent or curious user, I want to view information about the app, so that I can see the version, purpose, and who made it.

#### Acceptance Criteria

1. WHEN the user taps the "About" button on the Home_Screen, THE App SHALL navigate to the About_Screen.
2. THE About_Screen SHALL display the app version name and version code as declared in the Android build configuration.
3. THE About_Screen SHALL display a brief description of the App's purpose.
4. THE About_Screen SHALL display developer or author credit.
5. THE About_Screen SHALL display a back button that returns the user to the Home_Screen.

---

### Requirement 11: Screen Orientation

**User Story:** As a developer, I want the app locked to portrait orientation so that the layout is consistent across all devices.

#### Acceptance Criteria

1. THE App SHALL be locked to portrait orientation on both Android and iOS.
2. THE App SHALL not respond to device rotation events.

---

### Requirement 12: Responsive Layout for Phones and Tablets

**User Story:** As a child using either a phone or a tablet, I want the app to look good on my device, so that letters and buttons are always readable and tappable.

#### Acceptance Criteria

1. THE App SHALL support common phone screen sizes (360dp–480dp width).
2. THE App SHALL support common tablet screen sizes (600dp+ width).
3. THE Letter_Card font size SHALL scale proportionally based on screen width, with a minimum of 96sp on phones and a minimum of 144sp on tablets.
4. THE App SHALL use relative/percentage-based sizing rather than fixed pixel values for layout dimensions.
5. THE App SHALL not display horizontal scroll bars or overflow content on any supported screen size.

---

### Requirement 13: Multi-Language Architecture

**User Story:** As a developer, I want all user-facing text and audio to be stored in locale-specific data files, so that adding a new language requires only adding new data files without changing component code.

#### Acceptance Criteria

1. THE App SHALL store all user-facing text strings in a locale data module (e.g., /src/data/locales/).
2. THE App SHALL store all letter data (characters, audio file references) in locale-specific data files.
3. THE App SHALL support Ukrainian as the only Locale in MVP.
4. WHEN a new Locale is added to the locale data module, THE App SHALL display that Locale's content without requiring changes to any screen or component file.
5. THE App SHALL include a locale identifier in the Letter_Store data structure to associate letters and sounds with their language.

---

### Requirement 14: Back Navigation Confirmation

**User Story:** As a child using the app, I want a confirmation prompt before leaving a game screen — whether I tap the on-screen home icon button or press the hardware back button — so that I don't accidentally exit the activity.

#### Acceptance Criteria

1. WHEN the child presses the hardware or gesture back button while in a Game_Mode screen, THE App SHALL display a confirmation dialog.
2. THE confirmation dialog SHALL offer two options: "Stay" (remain in the current Game_Mode) and "Menu" (return to the Home_Screen).
3. THE confirmation dialog SHALL use icon-based or minimal-text options consistent with the child-appropriate UI in Requirement 6.
4. WHEN the child selects "Menu", THE App SHALL navigate to the Home_Screen.
5. WHEN the child selects "Stay", THE App SHALL dismiss the dialog and resume the current Game_Mode without any state change.
6. THE Letters_Mode screen SHALL display a small home icon button in the top corner of the screen.
7. THE home icon button SHALL be visually subtle but clearly recognizable (house icon, minimum 48×48dp tap target).
8. WHEN the child taps the home icon button, THE App SHALL display the same confirmation dialog as when the hardware back button is pressed.
9. THE confirmation dialog behavior (Stay/Menu options) SHALL be identical whether triggered by the home icon button or the hardware back button.

---

### Requirement 15: Designed for Families Compliance

**User Story:** As a developer, I want the app to comply with Google Play's Designed for Families program requirements, so that the app is eligible for better visibility in the kids' section of the Play Store.

#### Acceptance Criteria

1. THE App SHALL not include any advertising SDKs or display any advertisements.
2. THE App SHALL not collect, transmit, or store any personal data from users.
3. THE App SHALL not include any links that navigate outside the app (e.g., external URLs, social media links) without a Parental_Gate.
4. THE App SHALL not include any in-app purchase prompts visible to children without a Parental_Gate (relevant for future monetization).
5. THE App SHALL include a publicly accessible privacy policy URL in the Play Store listing before publication.

---

### Requirement 16: Premium Game Mode Architecture (future-ready)

**User Story:** As a developer, I want the Game_Mode_Registry to support marking game modes as premium with a limited free preview, so that future paid content can be experienced in a limited form without restructuring the app.

#### Acceptance Criteria

1. THE Game_Mode_Registry SHALL define an `isPremium` boolean flag for each Game_Mode entry.
2. THE Game_Mode_Registry SHALL define a `freeLetterCount` field for each Game_Mode entry: `null` means all letters are available; a positive integer means only the first N letters from the locale are used in that mode.
3. WHEN a Game_Mode has `isPremium` set to true AND the user has not purchased it, THE App SHALL use only the first `freeLetterCount` letters from the locale for that mode's gameplay — the child may play indefinitely but only experiences the preview alphabet.
4. WHEN a Game_Mode has `isPremium` set to true AND the user has not purchased it, THE Home_Screen SHALL display that Game_Mode as locked (e.g., with a lock icon), without requiring structural changes to the Home_Screen component.
5. WHEN a Game_Mode has `isPremium` set to true AND the user has purchased it, THE App SHALL use all letters from the locale and display the Game_Mode identically to a free mode.
6. WHEN a Game_Mode has `freeLetterCount` set to null, THE App SHALL use all letters from the locale regardless of purchase state.
7. FOR MVP, THE App SHALL ship with all Game_Modes having `isPremium` set to false and `freeLetterCount` set to null; no purchase flow SHALL be implemented in MVP.
8. THE purchase/unlock state SHALL be stored in a way that persists across app restarts (implementation deferred to post-MVP).
