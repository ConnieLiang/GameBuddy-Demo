# GameBuddy Demo

Live demo: https://connieliang.github.io/GameBuddy-Demo/

## Development and deployment

Requires Node.js 22. Run `npm ci`, then `npm run dev`. Build with `npm run build`.

Pushes to `main` automatically build and publish to GitHub Pages via `.github/workflows/deploy.yml`. The app uses `/GameBuddy-Demo/` as its base path.

This is an interactive prototype with local sample data, not a connected production service.

# GameBuddy Demo 1.0

React/Vite Home preview using the Filo Agent 3.0 showcase template (reference commit dd4a8911c4d99b4a4c63c4fbfbfc273f090f3379).

Run `npm ci`, then `npm run dev`. Build with `npm run build`.

Home source: https://www.figma.com/design/lKN3l5oG6tsXw11wQ104c3/Library?node-id=169-378

Home follows the updated Figma frame: pixel wordmark, notification bell, centered headline, multiline composer with attachment and voice controls, and four compact illustrated game questions. Figma-exported icons and artwork are stored locally. The game list contains Teamfight Tactics, Clash Royale, Marvel’s Midnight Suns, and XCOM 2. These are curated demo suggestions, not measured live trends.

Game questions are scoped to relevant mechanics. TFT keeps the roll/level question. Clash Royale fixes “Why is my deck missing?” to “What is my deck missing?”. Midnight Suns asks about generating Heroism; XCOM 2 asks about cover. Sample answer sources:
- TFT: https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-patch-16-4/ (roll/level terminology only; no current-patch recommendation)
- Clash Royale: https://supercell.com/en/games/clashroyale/blog/fun/archetype-deck-challenge/
- Midnight Suns: https://blog.playstation.com/2022/10/26/marvels-midnight-suns-super-heroic-turn-based-combat-and-card-tactics-explained/
- XCOM 2: https://www.feralinteractive.com/en/manuals/xcom2/latest/steam/

Question taps open labeled sample answers. Typed questions and screenshot submissions open demo results, not live analysis. Screenshots stay local. Both microphone controls use browser speech recognition where available, with a typing fallback when unavailable or denied. Browser speech services may process audio remotely. The bell opens a local empty notification state.

Buddy and Settings remain navigable placeholders. Both themes and languages are supported. The original dark Home status bar and bottom navigation use the supplied Figma assets.

The original Filo layout, background, phone chassis, animations, and language/appearance controls are reused. App assets are exact Figma exports stored in public/assets. The Android application is unaffected. There is no backend or live search integration.

## Animated demo behavior

The input border has a mint gradient glow (static when reduced motion is requested). Four complete game rows rotate together every 5 seconds across three rounds / 12 bilingual prompts. Every position changes its game artwork, title, and question together; answers and sources stay paired with their game. The timer pauses on hover, keyboard focus within the list, a result screen, or manual pause; it skips changes when the document is hidden. Selected results hold their own question and answer snapshot. Cleanup removes the timer on unmount.

IGN sourcing was requested, but the web reader failed and the browser site-safety policy blocked IGN access on 2026-09-08. No IGN text was collected; do not represent these suggestions as sourced from IGN or as live trend statistics. The expanded questions use the previously verified official sources above. IGN sourcing remains outstanding.

The search composer uses `border-beam` 1.3.0 by Jakub Antalik (MIT), with the monochrome `line` preset: https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/border-beam .


## Buddy demo

Adapted from `git@git.tapsvc.com:tapad/gamebuddy-rtc-fe.git` at `9de5f1e` (read-only reference checkout). Source contracts: `PersonaEditorScreen.kt`, `BuddyCenterViewModel.kt`, `BuddyCenterNavigation.kt`, `BuddyMemoryCenter.kt`, `VoiceTypeManager.kt`, and the two built-in workspace identity files. Original voice-preview MP3 assets are included under `public/assets/voice-previews/`.

The Compose flows are translated into a React overview with personality preferences, voice selection/preview, Buddy creation/switching, and sample memory confirmation/edit/forget/undo. Local demo state persists in `gamebuddy-buddy-demo-v1`. AI personality generation, real memory extraction, RTC, authentication, and remote persistence are not connected. The Figma UI page (`9:23`) contains the reference Home/navigation system, rather than a Buddy screen; the adaptation reuses its mint accent, neutral surfaces, typography, spacing, and rounded components.

Validation: Vite production build; browser checks for navigation, voice selection and playback state, memory dismissal/undo, personality preview/save, and Chinese/light-mode layout.

### Profile Memory page
The Profile Memory destination adapts the local Android implementation in `PersonaEditorScreen.kt` (`BuddyMemorySection`, `BuddyMemoryCard`, `BuddyMemoryCandidateCard`, `MemoryActionDialog`) and `BuddyMemoryCenter.kt` (scope, lifecycle and user actions). It includes category/space filters, confirmation, forming candidates, evidence, future-use explanations, editing, corrections, forgetting, suppression and undo. Sample records persist under `gb-memory-center-demo-v1`; they are separate from production memory and the earlier Buddy-tab sample state. Native correction conversations, authorized player profiles and actual memory-use receipts are not simulated as real data.

### Squad flow restoration
Squad now exposes My card, filters, public profiles, skin-sharing context, teammate/message history, invitations, handoff, feedback and service-order review alongside the swipe deck. These follow the GameLink prototype and docs_gamebuddy_player_discovery specifications. The existing dark/mint design system replaces the prototype's light/coral palette.

All Squad actions are local. `gb-squad-workspace-v1` stores intent drafts published through preview, demo invitations, interests, service drafts and order review. `gb-squad-discovery-demo-v1` stores deck decisions. Prototype scenarios explicitly load external example events or replay consumed cards. No remote messaging, AI extraction, game login, payment or refund occurs. Accessible reorder buttons are supported; full template-specific schemas and backend-driven lifecycle rules are not yet integrated.
