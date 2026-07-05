# Project Overview: Chytaychik (Читайчик)

## What is this app?
A mobile application for children aged 4–7 to learn Ukrainian letters and their pronunciation.
The app must be simple, intuitive, and usable without adult assistance.

## Development name
**Chytaychik** (Читайчик) — placeholder until a final name is chosen.

## Primary goal
Teach Ukrainian letters and pronunciation as a foundation for reading.
Later versions will expand to words, simple exercises, and mini-games.

## Target audience
- Primary users: children aged 4–7
- Secondary users: parents (settings, about screen)
- UI must work for children who cannot read yet — icons over text, large tap targets

## Platform
- React Native with Expo (managed workflow)
- Android first, but code must be structured to support iOS later
- Target: Google Play Store (Designed for Families program)
- Future: Apple App Store
- Build & publish: EAS Build (Expo Application Services)

## Offline-first
No backend. No network required. All data and audio bundled with the app.

## MVP scope
- Home screen (Start, Settings, About buttons + mascot/logo)
- Letters mode: one letter at a time, tap to hear sound, next/previous navigation
- Settings screen: sound on/off toggle (persisted)
- About screen: version, description, developer credit
- Portrait orientation only
- Supports common phones (360–480dp) and tablets (600dp+)

## Out of scope for MVP
- Games / mini-games
- Progress tracking
- Authentication
- Backend / analytics
- Monetization / in-app purchases (architecture is ready, implementation is not)
- Multiple languages (architecture is ready, only Ukrainian in MVP)

## Long-term direction (awareness only)
- Additional game modes (words + images, matching, drag & drop)
- Multiple languages (each language = separate locale data file, no component changes)
- Premium game modes via one-time in-app purchase (isPremium flag already in architecture)
- Speech recognition features
- Analytics and monetization in future versions

## Release constraints
- Google Play "Designed for Families" program
- No ads, no personal data collection, no third-party ad SDKs
- Parental gate required for any external links or future IAP prompts
- Privacy policy URL required before publication
