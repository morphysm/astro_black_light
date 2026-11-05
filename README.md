# SATURN — an astrological tribute

SATURN is a browser application for a symbolic reading focused on Saturn. It calculates a birth or event chart and combines the supported Saturn factors with authored interpretations. The app is a working prototype; its readings and calculations still need independent review before public release.

## Run locally

No installation or build step is required. From the repository root, run:

```sh
python3 -m http.server 8765
```

Open <http://localhost:8765/saturn/>. The app includes its calculation library and assets. Built-in places and manual location entry work locally; optional online place search sends the place query to Open-Meteo / GeoNames.

## Features

- Birth and event/project charts with exact, approximate or unknown time, including daylight-saving time handling.
- Saturn’s tropical position, motion, supported aspects, a chart wheel and an authored reading.
- On-demand Saturn returns, including retrograde repeat contacts; these calculations remain provisional.
- Optional chart saving in browser storage and a print-ready view for saving as PDF.
- A collapsed historical section, optional ambient sound and method notes.

Charts saved in the browser stay on that device and can be removed by clearing browser data. The app has no account, server chart database, analytics or language model. Houses and angles are not calculated.

## Review and tests

Interpretations are editorial drafts awaiting astrologer and source review. Time-uncertain calculations sample 97 points, so stability is not continuous proof. Some representative positions and return dates have been compared with published ephemerides; broader independent verification and browser testing remain necessary.

Run the Saturn regression tests with:

```sh
node --test tests/saturn.test.cjs
```

See [Saturn’s README](saturn/README.md) for implementation details, [the editorial record](saturn/EDITORIAL_REVIEW.md) for sources and review boundaries, and [the project handoff](SATURN_HANDOFF.md) for status and next steps.
