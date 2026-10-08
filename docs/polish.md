# Phase 8: performance, accessibility, demo mode

## Performance (measured 2026-10-08, production build via `vite preview`, Chrome on AMD Radeon/Vulkan)
- **Flow playback:** 60 fps over 6 s after a 1 s warm-up, measured twice.
  - Earlier 30–55 fps readings came from the dev server (React development mode) and are not representative.
  - Headless Chrome must be launched with `--use-angle=vulkan`, otherwise it renders on SwiftShader.
- **Cold load to main content** (`npm run perf`, local server, basemap tiles excluded):

  | CPU | Typical | Worst page |
  |---|---|---|
  | 1× | about 0.5 s | — |
  | 4× throttled | about 0.9–1.2 s | Flow map, 1.2 s |

  The target is under 3 s.
- **Bundle:** the shell is 128 KB of JS (gzip). Map pages load on demand; MapLibre and deck.gl live in a shared lazy chunk.
- **Compression:** `npm run build` writes `.gz` and `.br` next to every text asset (7.8 MB → 1.5 MB brotli). The largest file a page needs up front is about 36 KB brotli. Feeder routes (87 KB brotli) load only when toggled.
- **Animation fixes:**
  - static deck.gl layers (city context, labels) are built once per data/theme instead of per frame;
  - text-layer settings are stable constants, so the font atlas is not rebuilt.

## Accessibility
- **axe-core** (WCAG 2.1 A/AA) on all four pages in both themes plus the About drawer: **0 violations**.
  - Observable Plot's unlabelled `<g aria-label>` marks are tidied: each chart is one `role="img"` with its description, and unlabelled legend ramps are hidden.
- **Keyboard:**
  - every control is reachable in a sensible order: skip link, nav, filters, Demo, About, theme, then page controls;
  - deck.gl's overlay canvas is removed from the tab order (MapLibre's canvas keeps keyboard panning), and MapLibre controls get a visible focus ring;
  - the calendar has a "Go to date" field, so any day can be picked without a mouse.
  - Remaining: Chrome's native date-picker button draws its own focus highlight, which the automated check can't see inside the shadow DOM.
- **Contrast:** all text pairs meet AA. Green fills use near-black text (white on Metro green is only 2.4:1).
- **Colour vision** (`scripts/metro/colorcheck.py`, Machado 2009 simulation, ΔE76 < 15 flagged):
  - **Calendar scale:** changed from red–green to red–blue (Metro blue #215CA0). Red–green failed for protanopia (ΔE 11.9); red–blue passes for all three types.
  - **Walking-time greens:** pass for all three.
  - **Official line colours:** several pairs are confusable (e.g. A/M under deuteranopia, ΔE 3.5). They are brand colours, so they are kept, but colour is never the only cue: every line carries its letter on the map (letter badges along each line), in the legend, in tooltips and in panels (WCAG 1.4.1).
- `prefers-reduced-motion` is respected:
  - no particles or interpolation, and playback steps hour by hour;
  - instant map flights and contour growth.

## Demo mode
- The **Demo** button in the top bar starts a 10-step tour across the four pages.
- Narration sits in a strip docked under the top bar, so it never hides what it describes. Controls: Back/Next buttons, ← → keys, and Esc to leave.
- Steps are URLs (page + view state such as `?metric=share&hour=4&play=1`, `?station=poblado`, `?mode=coverage&overlap=1`). Every view in the tour can also be shared as a link.
- **Every number in the narration is computed at runtime** from `kpis.json`, `spikes.json`, `access.json` and `isochrone_stats.json` (`src/demo/facts.ts`). Captions cannot drift from the dashboard after the data is regenerated. Drivers are always worded as hypotheses.
- `node scripts/ui/demo-check.mjs` walks the whole tour and prints each step's URL and caption.
