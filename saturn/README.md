# SATURN — first browser prototype

This is a separate local browser app for the Saturn GDD. It does not change the Astro Disgrace prototype in `../dist/`.

## Open it

From the workspace root, run:

```sh
python3 -m http.server 8765
```

Then open `http://localhost:8765/saturn/`. The built-in place list, chart calculation and reading work locally. The optional **Find** action sends only the place query to Open-Meteo / GeoNames.

## In this prototype

- Black-and-gray entrance, responsive chart view, keyboard focus states and reduced-motion support.
- Natal or event/project input; exact, approximate or unknown local time; place/time-zone confirmation and DST gap/overlap handling.
- Saturn position, sign stability, motion direction and stable aspects, calculated in the browser with Astronomy Engine.
- Saturn-centered zodiac wheel and a text equivalent. Houses, angles and unrelated planetary positions are omitted.
- Original sign and aspect prose with visible factor IDs and editorial status.
- On-demand first, second and third Saturn-return cycles, including retrograde re-crossings and sampled natal-time sensitivity.
- Save as PDF opens a print-ready chart and reading; choose Save as PDF in the browser print dialog. Calculate return dates first to include them.
- Optional saved charts store inputs in this browser on this device; reopen or delete them from the entrance screen. Opening a saved chart recalculates it. Clearing browser data can remove saved charts.
- Ambient audio begins only after activation, has an always-visible volume control, and starts muted.

## Review boundary

The placement-specific sign and aspect prose is original editorial draft copy, **not yet reviewed against a source corpus or by an astrologer**. The reading also includes one historical context note based on Deborah Houlding’s adaptation of William Lilly’s Saturn section; the app does not apply that source’s dignity conditions to charts. No medical or physical claims from the historical text are used. Liz Greene’s book is listed as a candidate for later review, not as support already checked for the placement-specific prose. The chart adapter, historical time-zone results and browser interaction still need independent validation before release.

Time-uncertain charts use 97 samples across the interval. Stable signs, motion and Saturn aspects are included; factors that vary are withheld or called out. Return dates are provisional until independently compared against trusted reference dates. Return sensitivity uses the minimum and maximum sampled natal Saturn longitudes; it is not continuous proof. The interval midpoint is shown on the wheel. There is no Tarot feature, language model, account, server chart database or analytics.

The vendored Astronomy Engine bundle retains its MIT notice. The audio and sigil are copies of the assets in the workspace root.

See [EDITORIAL_REVIEW.md](EDITORIAL_REVIEW.md) for the interpretation entry records and review boundary.
