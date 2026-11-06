# SATURN — project handoff

**Status:** Working static browser prototype; not yet independently validated for public release.  
**Handoff date:** 5 November 2026.

## Purpose

SATURN is an austere, Saturn-centered astrology application. It calculates a birth or event chart, presents Saturn’s position and supported aspects, and assembles a symbolic reading from authored text. It is intended for reflection, not diagnosis, factual claims about a person, or prediction. The experience should remain focused: avoid adding features or long passages without a clear reason.

## What is in the app

- Birth and event/project charts, with an optional name; exact, approximate, or unknown time; place and time-zone confirmation; and daylight-saving gap and overlap handling.
- Tropical geocentric Saturn position, motion, stable aspects, a chart wheel, and a text equivalent. Houses, ascendant, and angles are not calculated.
- Sign, aspect, and general Saturn passages. Event charts have their own sign passages. A historical section is collapsed by default and includes a contemporary Morphysm interpretation.
- On-demand first, second, and third Saturn returns, including possible retrograde repeat contacts. Return calculations are provisional.
- Optional saving of chart inputs in browser storage on the device; saved charts can be reopened or deleted. Reopening recalculates the chart. Clearing browser data may remove saved charts.
- A **Save as PDF** action that opens a print-ready view and the browser’s print dialog. The user must select “Save as PDF”; calculate return dates first to include them.
- Optional ambient audio and optional online place search. Built-in places and manual location entry are available.

## How it works

The app is static HTML, CSS, and JavaScript. Astronomy Engine is bundled locally. There is no language model, account, server chart database, or application analytics. Optional online place search sends the place query to Open-Meteo / GeoNames. Browser time-zone data is used for local time conversion; its version is not pinned.

For approximate and unknown times, the app samples 97 points across the interval. Sign, motion, and aspect stability are based on those samples; this is not continuous proof that a factor is stable. The wheel displays the interval midpoint. Return sensitivity is estimated using the minimum and maximum sampled Saturn longitudes, and remains provisional.

## Files and running locally

- `saturn/` — local application source. Open `saturn/index.html` through a static server.
- `saturn-site/dist/` — prepared public-hosting copy. Keep application changes synchronized with `saturn/`, while preserving any intentional differences between copies.
- `saturn-public.zip` — packaged public copy. Update and verify it after changes intended for distribution.
- `tests/saturn.test.cjs` — Saturn-specific regression tests.
- `saturn/EDITORIAL_REVIEW.md` — editorial/source record; it predates some recent text changes and should be updated during review.
- `saturn-site/README.md` — hosting handoff. It records a prior source-sync failure and no confirmed public deployment URL; verify current hosting status before relying on it.

From the workspace root:

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765/saturn/`. Run Saturn-specific tests with `node --test tests/saturn.test.cjs`. The other existing tests target the separate Astro Disgrace app in `dist/` and do not establish Saturn coverage.

## Validation completed

A core-logic smoke test exercised exact natal charts, an approximate event chart, an unknown-time chart on a daylight-saving transition, and local clock gaps and overlaps. Two Saturn positions and retrograde motion were checked against published ephemerides and agreed to approximately a displayed minute. Saturn-specific regression tests cover those examples, time handling, sampled aspect behavior, an event reading, and a three-pass first return.

For the test chart of 1 January 2000 at 12:00 UTC, the app finds first returns on 21 July and 24 September 2028, and 1 April 2029. Published daily ephemerides place Saturn near the natal longitude around those dates. This supports the dates, not the calculated crossing times to the minute. The regression dates themselves are generated from the app and are not independent confirmation.

The interactive browser flow and PDF print dialog were not tested in the recent session. The app’s placement-specific text and revised event prose have not been reviewed by an astrologer. A passing regression suite does not validate all dates, places, time zones, or readings.

## Work before public beta

1. Have an astrologer review all sign and aspect text, orbs, historical framing, and event/project language. Check complete readings for repetition and coherence. The square passages have two variants but other aspects still use templates.
2. Independently compare more positions, aspects, and return crossings, including exact times, retrograde repeats, sign boundaries, uncertain-time sensitivity, and dates near the supported range limits. Check historic time zones against reliable references.
3. Test end to end in desktop and mobile browsers: enter and edit details, location selection and manual entry, DST errors, calculate, save/reopen/delete, return dates, PDF, audio, keyboard navigation, and reduced motion. Check blocked storage and pop-ups and the optional online search failure path.
4. Review privacy and presentation with the actual deployment: saved charts are local to a browser, place search is external, and a downloaded PDF may contain personal details. Confirm all assets and source links work.
5. Update editorial records to reflect current prose and the historical entries; preserve the distinction between sourced historical context, original interpretation, and Morphysm’s philosophical image.
6. Verify the public hosting state, deploy the intended synchronized copy, and test the live URL. Do not assume a ZIP update publishes the site.

A small public beta is reasonable once these checks pass and unresolved limitations are clearly stated. Broader launch readiness depends on the findings, not on a fixed testing period.

## Changelog

- 5 Nov 2026: Added `saturn/NARRATIVE_DRAFT.md` (proposed de-Christianised, unsoftened copy). Not yet applied to code; tests unaffected.
- 5 Nov 2026: Built `saturn-v2/` (v1 in `saturn/` untouched). Applied the narrative draft, removed Christian references, added the House of Death (Saturn at 90/180/270/360° from natal Saturn, three cycles), brutalist restyle with bundled Oswald font, and UI fixes (emoji glyphs, floating sound box, hidden fields, selected state, mobile menu). Tests: `node --test tests/saturn-v2.test.cjs` (9 pass). Browser walkthrough done in Chrome at desktop and phone width. Not deployed; `saturn-site/` and the ZIP still hold v1.
- 6 Nov 2026: saturn-v2: House of Death epigraphs now drawn per chart from pools (`epigraphPools`, `houseEpigraphs` in core.js); door shows its own epigraph; new test; Method note updated. Tests 10/10.
- 6 Nov 2026: saturn-v2 narrative v0.3 — texts moved to `saturn-v2/narrative.js` (loaded before core.js). Decans per sign, 2 seeded variants per natal text, 1 per event text; heavier aspects/motion/returns. Tests 11/11.
- 6 Nov 2026: saturn-site/dist and saturn-public.zip replaced with v2 runtime files (not deployed). Source committed on branch `saturn-v2` (3b02c22).
- 6 Nov 2026: 05 / Contact — duplicated "no aspect" line removed; unaspected Saturn now gets its own text (narrative.js `unaspected`). Tests 12/12. Zip rebuilt.
