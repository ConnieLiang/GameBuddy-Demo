# Demo UI preferences

- Message bubbles must use the same radius on all four corners. Keep this consistent in future demo work; do not introduce asymmetric corners or bubble tails unless the user explicitly requests them.
- Search detail user bubbles use GB Odyssey/1 (dark #211E30, light #F4EDFF), Neutral/50 (#F8F8F8) text, and a uniform 4cqw radius.

- In light mode, search-detail answer and user text use Neutral/700; user bubbles use Odyssey/1 and navigation is transparent. The external GB wordmark uses Neutral/700. Preserve the dark-mode mappings.

- Sign-in uses the light Odyssey welcome design (Figma 1102:5588) in both themes, with the TapTap GameBuddy logo lockup. Its legal panels and loading state retain dark appearance.

- Do not add diagonal up-right arrow icons (↗ / ArrowUpRight) to generated UI, including cards and links, unless the user explicitly requests them.

- Keep English and Chinese demo versions in sync when changing UI copy or interactions; use natural localized wording in both.

- UI icons use the canonical GB SVG library in `public/assets/gb-icons` through `src/components/GBIcon.jsx`. Do not introduce Lucide or redraw library glyphs. Use Home/Buddy before/after assets for navigation states. Where the library lacks a matching glyph, use a localized text control; keep system status-bar indicators and brand/game artwork separate.

- Keep the demo show/hide tagline toggle’s original sidebar-panel outline icon. This is an explicit exception to the canonical GB icon migration; do not replace it with expand/hide chevrons.

- Keep the demo theme toggle’s original sun/moon outline icons, not text or GB library replacements. Like the tagline toggle, this external demo control is exempt from the GB icon migration.
