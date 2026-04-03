

## Fix tap water journey map: readability and performance

### Problems identified

1. **Overlapping markers**: 15 routes × 3-4 steps = ~55 markers all shown at once. Steps within a route are geographically close (e.g., Paris captage, treatment, reservoir, commune are all within a few km), causing visual clutter.
2. **Slow animation**: `setPaintProperty` called on every `requestAnimationFrame` tick for ~40 line layers simultaneously — this is very expensive for Mapbox GL.
3. **No interaction hierarchy**: All routes rendered at once with no way to focus on one city's journey.

### Solution: click-to-reveal pattern + throttled animation

**Interaction model change**: At default zoom, show only **commune markers** (one per city, 15 total). When a user clicks a commune marker, zoom in and reveal that city's full route (captage → traitement → reservoir → commune) with animated arcs. A "back to overview" button resets the view.

**Performance fixes**:
- Reduce arc animation to ~15fps using `setTimeout` instead of `requestAnimationFrame`
- Only animate arcs for the currently selected route (max 3-4 segments vs 40+)
- Remove all intermediate markers/arcs when in overview mode

### Technical changes

**`src/components/TapWaterJourneyMap.tsx`** — Major refactor:
- Add `selectedRoute` state (`string | null`)
- **Overview mode** (`selectedRoute === null`): render only commune markers with city name labels. On click → set selectedRoute, fly to route bounds.
- **Detail mode** (`selectedRoute !== null`): render all steps for that route + animated arcs. Show a "← Back" button to return to overview.
- Throttle `setPaintProperty` to every 66ms (~15fps) instead of every frame
- Smaller marker sizes (w-5 h-5 for steps, w-6 h-6 for commune)

**`src/data/tapWaterSources.ts`** — No changes needed.

### Files modified

| File | Change |
|------|--------|
| `src/components/TapWaterJourneyMap.tsx` | Refactor to click-to-reveal + throttled animation |

