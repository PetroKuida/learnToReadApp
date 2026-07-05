# Coding Standards: Chytaychik

## Core principles
- Do NOT overengineer
- Keep solutions simple and scalable
- Avoid unnecessary libraries — justify every dependency
- Prefer readability over cleverness
- Write code to learn, not just to copy

## Language & framework
- React Native with Expo (managed workflow)
- JavaScript (not TypeScript for MVP — keep it simple)
- No Redux or complex state management — use useState and useContext only when needed
- Navigation: React Navigation v6 with Stack navigator
- Audio: expo-av (official Expo library for sound playback)
- Build & publish: EAS Build for Play Store submission

## Folder structure
```
/src
  /components     # small, reusable UI components
  /screens        # one file per screen
  /data           # all static data (letters, locales, game mode registry)
  /assets         # images, audio files
  /navigation     # navigation configuration
  /utils          # helper functions (sound manager, responsive sizing, etc.)
```

## Component rules
- One component per file
- Keep components small and focused — if it's getting long, split it
- No business logic inside components — move it to utils or data
- Props should be clearly named and minimal

## Data separation
- All letter data lives in `/src/data/` — never hardcoded in components
- All user-facing strings live in `/src/data/locales/` — never hardcoded in components
- Game mode registry lives in `/src/data/gameModes.js`
- Audio file references are part of the letter data, not the component

## Naming conventions
- Files: camelCase for components (LetterCard.js), camelCase for utils (soundManager.js)
- Components: PascalCase (LetterCard, HomeScreen)
- Functions and variables: camelCase (playSound, currentIndex)
- Constants: UPPER_SNAKE_CASE (SCREEN_BREAKPOINTS, STUB_AUDIO_FILE)
- Data keys: camelCase (isPremium, audioFile, displayName)

## Styling
- Use StyleSheet.create() — no inline styles
- Use relative/percentage-based sizing — no fixed pixel values for layout
- Define a shared theme/colors file in /src/utils/theme.js
- Minimum tap target: 48×48dp for all interactive elements
- Font sizes scale based on screen width (use a responsive helper from utils)

## Audio
- Sound managed exclusively through /src/utils/soundManager.js
- Each letter entry in data includes an audioFile reference
- Stub audio file used as placeholder when real recordings are not available
- Stub convention: a single file at /src/assets/audio/stub.mp3

## Multi-language readiness
- All text strings come from the active locale file, never hardcoded
- Letter data is locale-specific (different alphabet, different audio per language)
- Active locale is Ukrainian for MVP
- Adding a new language = adding a new file in /src/data/locales/ only

## Game mode registry
- Each game mode entry: { id, displayName, enabled, isPremium, screen }
- Home screen renders modes from registry — never hardcoded
- isPremium defaults to false for all MVP modes
- Locked/premium UI is handled by the Home screen reading the registry flag

## Comments
- Add a brief comment when the WHY is not obvious
- No comments that just restate what the code does
- Example of good comment: // restart sound from beginning if already playing
- Example of bad comment: // set state to false

## Testing mindset (QA background)
- Write code that is easy to test — pure functions in utils, no side effects in data files
- Keep side effects (sound, navigation) at the edges (screen level), not buried in components
- Name things clearly enough that a test description writes itself

## What to avoid
- No anonymous arrow functions as component definitions
- No deeply nested ternaries
- No magic numbers — extract to named constants
- No direct AsyncStorage calls in components — wrap in a util
- No hardcoded strings in JSX
