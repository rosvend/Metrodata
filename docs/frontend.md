# Frontend (Phase 3: app shell and design system)

## Commands
- `npm run dev`: Vite dev server on :5173. It serves the generated `public/data/`.
- `npm test`: Vitest (jsdom).
- `npm run lint`: ESLint (strict, no `any`) plus a Prettier check.
- `npm run typecheck`: `tsc`, strict.
- `npm run build`: typecheck, then the Vite production build into `dist/`.
- `npm run ui:shots`: Playwright with system Chrome. It screenshots every page in light/dark at 1440 px and 390 px, the About drawer and a keyboard-focus state into `.cache/shots/`, and reports console errors and horizontal overflow. The dev server must be running.

## Structure (`src/`)
| Folder | Contents |
|---|---|
| `app/` | Shell: `AppShell`, `TopBar`, `LineNav` (page nav drawn as a metro line), `FilterControls`, `AboutDrawer`/`AboutContent`, `ThemeToggle`, hooks `useFilters` and `useTheme`, and the page list in `pages.ts` |
| `pages/` | One component per route. These are placeholders until phases 4–7 |
| `ui/` | Shared pieces: `Segmented` (native radio group), `PageHeader`, and `Status` (`Loading`, `ErrorState` with retry, `Empty`) |
| `lib/` | Pure, unit-tested helpers: `filters` (URL ⇄ filters), `theme`, `format` |
| `data/` | `loadJson` (cached fetch of `/data/*.json`), `useJson` (loading / ready / error-with-retry) and the JSON types |

## Global filters
Filters live in the URL query: `?year=2024|2025|2026&day=weekday|saturday|sunday_holiday`. Defaults are 2026 and weekday. Navigation keeps the query, so links and the calendar's deep links carry the selection. Invalid values fall back to the defaults.

## Design system
- **Palette (brief):** deep teal #0E3B43 dominant (top bar, headings), teal #15756B interactive, mint #2FA38F, amber #F2A900 for the current selection and the station dot, coral #E4572E for alerts.
- **Themes:** light page #F4F7F6, dark #061A1E. The top bar stays deep teal in both. Tokens are CSS variables in `src/index.css`, exposed to Tailwind via `@theme inline`.
- **Mode colors:** Metro #0E3B43 (lifted to #7FBFC9 in dark mode so it stays visible), Tranvía #2FA38F, Metrocable #F2A900, Metroplús #E4572E.
- **Type:** Caladea (metric-compatible with Cambria, self-hosted) for headings; Overpass (derived from Highway Gothic, a signage face) for the interface. Numerals are tabular.
- **Focus:** amber on the teal bar (6:1) and in dark mode; deep teal on light page content, because amber on the light background is only 1.9:1.
- **Contrast:** all text pairs are at or above 4.7:1 (WCAG AA).
- **Motion:** used only in response to an action. The station dot glides between pages, the segmented selection slides, and the drawer slides in. `MotionConfig reducedMotion="user"` and a CSS media query respect `prefers-reduced-motion`.
- **About drawer:** a native `<dialog>`, which provides the focus trap, Escape to close and an inert background.

## Chart choices for later phases (from the datavizproject.com catalogue)
| Page | Use case | Chart |
|---|---|---|
| Flow | network volume by hour | Flow map / transit map, plus an area chart in the line side panel |
| Peaks | line × hour | Heat map |
| | system profile by day type | Layered line / area |
| | per-line peaks | Table with sparklines |
| | load per km | Lollipop |
| | saturation | Beeswarm / strip plot of daily peaks |
| Calendar | daily deviation | Calendar heat map |
| | top spikes and dips | Diverging horizontal bars |
| | monthly YoY | Dumbbell / slope |
| | one day vs expected | Range area + line |
| Access | walking time | Isoline map + choropleth coverage |
