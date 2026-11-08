# SATURN v2

Second version of the Saturn reading. The original stays untouched in `../saturn/` as a fallback.

## Open it

From the workspace root (`Astro_BLack_Light`), in your own terminal:

```sh
python3 -m http.server 8765
```

Then open `http://localhost:8765/saturn-v2/`.

Tests: `node --test tests/saturn-v2.test.cjs` (from the workspace root).

## What changed from v1 (5 Nov 2026)

| Area | Change | Why |
| --- | --- | --- |
| Narrative | New sign, event, aspect, motion and return texts (draft v0.2). Each sign gets an opening image; each aspect adds a planet-specific line; each return cycle has its own line. | v1 read like advice ("Leave room to pause"); aspects differed by one word; the return prompt repeated three times. |
| Religious symbolism | Removed Lilly's *Christian Astrology* note from the reading, the Liz Greene *…Old Devil* listing, the Biblical Archaeology link and "devoted" wording. A test blocks Christian and advice vocabulary in `core.js`. | Creator request. |
| House of Death | New room after the reading. Hidden until the reader reaches the end; opens behind a content notice. Four rooms = transiting Saturn at 90° (The Cell / lockdown), 180° (The Ward / isolation), 270° (The Demolition), 360° (The Re-forming). Each lists dates for three cycles. "Leave the house" is always visible. | Creator request: lockdown, destruction, rebirth, psychiatric isolation, curiosity. Uses the existing return solver, so it works with unknown birth times and needs no houses. |
| Look | Brutalist restyle: Oswald condensed headings (bundled, OFL licence in `assets/fonts/`), monospace labels, hard rules, concrete-slab panels. Still black and grey only. | Project goal: brutalist / East Berlin, not gallery serif. |
| Bug fixes | Zodiac glyphs no longer render as coloured emoji; sound controls moved from a floating box into the sticky header; selected options are inverted blocks; time fields hidden when not relevant (`[hidden]` was overridden by CSS); empty outlined boxes removed; mobile menu is a 2-column block instead of a sideways scroller; the Method button stays reachable; minimum label size 11px. | Found in the browser walkthrough. |
| Pacing | Sections fade in as they are reached; the menu highlights the current section. Disabled under reduced-motion settings. | More deliberate reading rhythm. |

Calculation code (chart, aspects, returns) is unchanged apart from a configurable search window used by the House of Death.

## Changelog

- 8 Nov 2026: **View saved charts** on the chart page now opens a dialog over the chart. It used to return to the entrance screen, which cleared the current chart. Deleting a saved chart now updates the list in place.
- 8 Nov 2026: **Open chart** in that dialog now warns first if the chart on screen is not saved, because opening another chart replaces it.
- 8 Nov 2026: **Start another chart** now gives the same warning when the chart on screen is not saved.

## Limits

- All texts are original editorial drafts; no astrologer or source review yet.
- House of Death dates use the same provisional method as the returns; they have not been compared with an independent ephemeris. They are symbols, not predictions.
- `saturn-site/dist/` and `saturn-public.zip` hold v2, including the 8 Nov 2026 chart-warning fixes. Nothing was deployed.
- Save chart and Save as PDF were not re-tested in v2 (code unchanged except the PDF copy now leaves out the door).

## Revision — House of Death texts (5 Nov 2026)

Rewritten shorter at the creator's request: one paragraph per room, each opened by a public-domain epigraph (Lovecraft "The Outsider" and "The Call of Cthulhu", Poe "The Masque of the Red Death" and "The Conqueror Worm", Baudelaire "L'Horloge" and "Une Charogne" in French with original translations). Removed disclaimers, "symbolic" hedging and "this is not X, it is Y" phrasing; the content gate keeps one line plus "You can leave at any moment." Tests now block "symbolic", "This is not" and "does not kill" in `core.js`.

## Revision — epigraphs per visitor (6 Nov 2026)

The door, entrance, four rooms and exit each draw one epigraph from a pool (38 public-domain lines: Poe, Baudelaire, Lovecraft, Nerval, Lautréamont, Rimbaud, Trakl, Leopardi, Radiguet; translations are editorial). The choice is seeded from the chart's own input, so the same chart always opens the same house and different charts open different ones. No author appears twice in one house. Pools live in `epigraphPools` in `core.js`; add a line there to widen them.

## Revision — narrative v0.3, decans (6 Nov 2026)

All reading texts moved to `narrative.js` and rewritten heavier (body, rot, cold, concrete; no balanced aphorisms). Each sign is split into three decans (0–10°, 10–20°, 20–30°, Chaldean rulers shaping the imagery; not shown on screen). Birth charts: 36 decans × 4 texts × 2 versions, the version picked from the chart's own details (same chart, same reading). Event charts: 36 decans × 4 texts, one version. Aspect, motion and return lines rewritten in the same voice. Uncertain birth times use the midpoint longitude for the decan.
