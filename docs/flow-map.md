# Page 1: Flow map (Phase 4)

## What it shows
Line-level boardings by hour of operation for the selected year and day type. The values are the mean hourly boardings over that day type's operating days, from `profiles.json` (`periods[year][day_type][line]`). There is no station-level or origin–destination data, so nothing is distributed to stations or drawn as OD flows.

## Encodings
| Visual | Meaning |
|---|---|
| Line color | Official line color (identity) |
| Line width | √-scaled value of the selected metric, 2–26 px. The scale max is fixed over all lines and hours for the selection, so widths are comparable while playing |
| Line opacity | Also follows the value (minimum 35%) |
| Moving dots | Count is proportional to the value (up to 70 on the busiest line/hour). Evenly spaced, alternating direction, same speed on every line. They are not vehicles, and the page says so |
| Dashed line | Línea O: source geometry has estado 4/5 (planned Corredor de la 80), so its shape and length are indicative |
| Grey dashed | Cable Palmitas (La Aldea): geometry without ridership |
| White dots | Stations (larger for tipo 1). Location only |

Metric toggle:
- **Boardings:** raw boardings per hour.
- **Per km:** boardings per hour ÷ line km. Lengths for 1, 2 and O are indicative.
- **Share of day:** the hour's share of that line's own daily boardings. This keeps small lines visible next to Line A, which carries about 65% of weekday boardings.

## Playback
- `usePlayback` runs one `requestAnimationFrame` loop that advances the hour (1× = 2.5 s per hour, so 50 s for a full day) and a particle clock.
- Values interpolate linearly between hour bands. The scrubber is a native range input with `aria-valuetext` "17:00–17:59".
- It opens paused at 17:00, the system weekday peak.
- With `prefers-reduced-motion`, particles stop and playback steps hour by hour with no interpolation.

## Interaction
- Hovering a line, station or no-data line shows a tooltip with exact values and units, the hour band and the selection context.
- Clicking a line (or its badge in the legend, which is keyboard accessible) opens the side panel:
  - the hourly profile (Observable Plot area chart, with a current-hour marker);
  - average daily boardings for the selected day type;
  - the weekday KPIs from `kpis.json` (`by_year[year].lines[id]`), each with an info tip.
- On phones the panel appears below the map.
- The feeder-route toggle loads `feeders.geojson` on demand.

## Code (`src/flow/`)
| File | Role |
|---|---|
| `metrics.ts` | Interpolation, metric values, scale max, width/opacity/particle scales, hour-band labels (tested) |
| `playback.ts` | Hour advance and loop (tested) |
| `path.ts` | Polyline measuring and point-along (tested) |
| `particles.ts` | Particle placement (tested) |
| `model.ts` | Joins `lines.geojson` with profiles (tested) |
| `describe.ts` | Value wording with units (tested) |
| `layers.ts` | deck.gl layers: feeders, no-data, casing, lines, particles, stations |
| `FlowMap.tsx` | MapLibre + `@deck.gl/maplibre` overlay, CARTO basemap per theme |
| `PlaybackBar`, `LineLegend`, `LineBadge`, `Tooltip`, `LinePanel`, `ProfileChart` | UI pieces |

## Verified (2026-10-08)
- Panel numbers match the pipeline: Line A 2026 weekday 683,405 boardings, 64.9% share, peak 17:00 at 11.2%.
- Line H at 17:00 shows 70.9, which matches the source; its peak is 05:00–06:00.
- Playback runs at 51–56 fps in Chrome on the real GPU (AMD Radeon, Vulkan). No console errors and no horizontal overflow at 390 px.
- `FlowPage` is lazy-loaded: the shell's initial JS is 128 KB gzipped, and the map chunk is 578 KB gzipped, loaded on demand.
