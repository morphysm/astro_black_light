# Astro Disgrace — first vertical slice

Browser application, deterministic interpretation library, no language model. Source lives in `dist/`; no build step or package installation is required. All script and style assets are local, including Astronomy Engine with its MIT notice. You can also open `dist/index.html` directly in a browser; built-in place selection needs no network lookup. Optional online place search needs internet access. Serve with `python3 -m http.server 8765 --directory dist` and open http://localhost:8765.

## Implemented

Adult/content entrance; natal and event inputs; explicit location/zone confirmation; exact, approximate and unknown time modes; DST gap/overlap handling; geocentric tropical planetary positions; major aspects for exact times; chart wheel and tabular alternative; seven sections; per-chart-session death consent; original deterministic editorial readings with factor/entry IDs; finish/return/new-chart flow; optional Markdown export. Optional saved charts persist chart inputs in browser localStorage on this device. There is no server chart database, application analytics or remote inference. Optional online location search is explicitly disclosed.

## Deliberate prototype limits

- Interpretation entries are **original editorial drafts, not a reviewed or sourced astrological corpus**. Greene and Tompkins are not cited as supporting these entries. Content review remains necessary.
- The conjunction/square/opposition templates and sign modifiers are documented editorial rules. The synthesis paragraph is generic editorial linkage across the selected factors, not a claim of a separately calculated configuration. Improve it through curated, combination-specific rules before a release.
- No houses, angles, transits, profections, returns, diagnoses, or death-date method. Future explicitly reports unavailable coverage. Death covers symbolic mortality/endings.
- Location entry accepts city/country, such as Tokyo/Japan. Eleven built-in cities work without lookup; other places can be searched through Open-Meteo after clicking the disclosed online search button. The query alone is sent; coordinates and time zone come from the selected result. Manual corrections are under Advanced settings. Coordinates remain provenance, not house calculations. Open-Meteo/GeoNames attribution is in the UI. Check service terms and commercial arrangements before a commercial release.
- 1900–2100 input range. Browser Intl provides historical zone conversion; its data version is not pinned. Independent historical verification is pending.
- Uncertain-time windows use 97 samples. Stable signs may be read, changing signs are excluded, and all aspects are suppressed. This is a sampled sensitivity check, not a proof over a continuous interval. Wheel/positions explicitly represent the interval midpoint. Midnight-transition unknown-time dates are rejected.
- No external reference-chart comparison has yet validated this adapter. The upstream library's tests do not replace our own acceptance testing.
- Planet glyphs can crowd in tight conjunctions; the table is the precise accessible record.
- Repertoire is in `dist/core.js`. Entry IDs are deterministic; expand into independently curated records with bibliography, rights, exceptions and review status in the next content phase.

## Verification

`node tests/core.test.cjs` — 8 tests: DST nonexistent/ambiguous times; invalid dates/zones; a 23-hour unknown-time day; factor referential integrity; project wording; Moon sign-change exclusion; wraparound angle arithmetic; seven sections and deterministic readings.

`node --check dist/app.js` verifies browser controller syntax. Browser QA was blocked by the session's tool approval policy. No claim is made that appearance, keyboard interactions, export download or hosting has been browser-tested.

## Calculation source

[Don Cross, Astronomy Engine](https://github.com/cosinekitty/astronomy). The vendored browser bundle retains the full MIT notice; `dist/vendor/SOURCE.json` records its exact Git blob SHA. Geocentric apparent vectors are converted via `Ecliptic(GeoVector(body, date, true))`; do not replace this with heliocentric EclipticLongitude.

## Product decisions retained

Seven sections. Traditional 1990s-style chart software architecture. Severe editorial voice, one entrance notice, separately chosen death section, light at the end. “Pseudoscience” does not appear in the app. No Ollama dependency. Separate project from Oneironaut; no dream records or corpus were copied.

## Hosting status

A private Site was registered and its identity is retained in `.openai/hosting.json`. Source synchronization failed because this environment could not resolve `git.chatgpt-team.site`; no version was published. Reuse the existing project ID and request a fresh source credential when network access is restored. Do not register another Site.

## Project documents

- [Design document](Astro_Disgrace_GDD.md)
- [Confirmed decisions](docs/decisions.md)
- [Technical review](docs/technical-review.md)
- [Session handoff](SESSION_NOTES.md)

Location resolver checks: `node tests/locations.test.cjs` (5 tests). Provider contract: https://open-meteo.com/en/docs/geocoding-api. Live lookup and browser interaction remain unverified in this restricted session.

Saved-chart persistence checks: `node tests/storage.test.cjs` (5 tests). Saving is explicit; saved inputs are recalculated on reopening. Delete uses inline confirmation. Adult/content and death consent are never persisted. Data is browser/origin-specific; changing the URL or local file path, clearing browser data, or using private mode may affect availability. Browser persistence is not a backup. Browser end-to-end verification remains pending.

## Editorial revision AD 0.2

Death now uses a dedicated, graphic literary repertoire: twelve sign images, Saturn/Pluto framing, aspect-specific relationship wording and a separate synthesis. Personal-planet contacts rank ahead of generational aspects, then orb breaks ties. These are original editorial rules, not a validated mortality prediction technique. Event charts describe project endings instead of human bodies. The Death gate names the graphic content. Shared planetary prose has also been sharpened. Source review and browser QA remain pending.

## Editorial revision AD 0.3

The other six sections were rewritten: Mind, Obstruction, Money, Accidents and Health have distinct planetary passages, aspect imagery, introductions and synthesis. Event readings have separate project-pressure wording. Future remains an editorial introduction with an explicit unavailable-timing message, not a forecast. Death retains its v2 entries. Section opening text is included in exports. Run `node tests/readings.test.cjs` for four editorial-regression checks. Original draft status and source-review limitations remain.

## Current handoff

See [SESSION_NOTES.md](SESSION_NOTES.md) for current feature state, limitations, manual QA steps and the recommended next steps.
# astro_black_light
