Exact SVG assets from tapad/gamebuddy-rtc-fe, commit `0a05f6c58ed6ea1af3eef5f931309d61f0f6006d`, `design/icons/assets`.

GBIcon renders the same paths with currentColor for monochrome glyphs. Brand and game artwork are separate.

Run `node demo/scripts/generate-gb-icons.mjs` after updating the SVGs to regenerate the React path registry. Monochrome black fills inherit the control's color; fixed colors remain unchanged.

Library gaps: Like/Dislike, More, theme switching, and the Squad interest action use localized text. Settings rows without a matching canonical icon keep their text labels. Keyboard Shift and device status indicators remain platform chrome. Game artwork, avatars, and brand logos are not interface icons.
