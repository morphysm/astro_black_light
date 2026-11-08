(function () {
  'use strict';

  const C = window.SaturnCore;
  const main = document.getElementById('main');
  const audio = document.getElementById('ambient-audio');
  audio.volume = 0;
  const soundButton = document.getElementById('sound-toggle');
  const volume = document.getElementById('sound-volume');
  const places = [
    { city: 'Umeå', region: 'Västerbotten', country: 'Sweden', zone: 'Europe/Stockholm', lat: 63.8284, lon: 20.2597 },
    { city: 'Stockholm', region: 'Stockholm', country: 'Sweden', zone: 'Europe/Stockholm', lat: 59.3293, lon: 18.0686 },
    { city: 'London', region: 'England', country: 'United Kingdom', zone: 'Europe/London', lat: 51.5074, lon: -0.1278 },
    { city: 'New York', region: 'New York', country: 'United States', zone: 'America/New_York', lat: 40.7128, lon: -74.006 },
    { city: 'San Francisco', region: 'California', country: 'United States', zone: 'America/Los_Angeles', lat: 37.7749, lon: -122.4194 },
    { city: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', zone: 'America/Sao_Paulo', lat: -22.9068, lon: -43.1729 },
    { city: 'São Paulo', region: 'São Paulo', country: 'Brazil', zone: 'America/Sao_Paulo', lat: -23.5505, lon: -46.6333 },
    { city: 'Lisbon', region: 'Lisbon', country: 'Portugal', zone: 'Europe/Lisbon', lat: 38.7223, lon: -9.1393 },
    { city: 'Berlin', region: 'Berlin', country: 'Germany', zone: 'Europe/Berlin', lat: 52.52, lon: 13.405 },
    { city: 'Tokyo', region: 'Tokyo', country: 'Japan', zone: 'Asia/Tokyo', lat: 35.6762, lon: 139.6503 },
    { city: 'Sydney', region: 'New South Wales', country: 'Australia', zone: 'Australia/Sydney', lat: -33.8688, lon: 151.2093 }
  ].map(place => ({ ...place, label: [place.city, place.region === place.city ? '' : place.region, place.country].filter(Boolean).join(', '), source: 'Built-in place list' }));

  let chosenPlace = null;
  let pendingInput = null;
  let chart = null;
  let soundOn = false;
  let fadeTimer = null;
  const savedChartsKey = 'saturn.savedCharts.v1';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const $ = selector => main.querySelector(selector);
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const cityMatches = query => {
    const part = normalize(query).split(/[,/]/)[0].trim();
    if (part.length < 2) return [];
    return places.filter(place => normalize(place.city).startsWith(part));
  };
  const exactPlaceMatch = query => {
    const normalized = normalize(query);
    const matches = places.filter(place => [place.city, place.label, `${place.city}, ${place.country}`, `${place.city}/${place.country}`].some(label => normalize(label) === normalized));
    return matches.length === 1 ? matches[0] : null;
  };

  function setScreen(html, focus = true) {
    document.body.classList.remove('house-mode');
    main.innerHTML = html;
    if (focus) {
      main.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  function readSavedCharts() {
    const raw = localStorage.getItem(savedChartsKey);
    if (!raw) return [];
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) throw new Error('Saved charts could not be read.');
    return records;
  }

  const isCurrentChartIn = records => records.some(record => JSON.stringify(record) === JSON.stringify(chart.input));

  function startAnotherChart() {
    let saved = false;
    try {
      saved = isCurrentChartIn(readSavedCharts());
    } catch (error) {
      // Storage is unreadable, so the chart cannot be confirmed as saved: warn.
    }
    if (saved) inputScreen();
    else document.getElementById('new-chart-dialog').showModal();
  }

  function saveChart() {
    const status = $('#save-status');
    try {
      const records = readSavedCharts();
      if (!isCurrentChartIn(records)) {
        records.push(chart.input);
        localStorage.setItem(savedChartsKey, JSON.stringify(records));
      }
      status.textContent = 'Chart saved in this browser on this device.';
    } catch (error) {
      status.textContent = 'Could not save the chart. Browser storage may be unavailable or full.';
    }
  }

  function printChart() {
    try {
      const copy = main.cloneNode(true);
      copy.querySelectorAll('button, .section-nav, .save-chart-actions, .sealed-door, .end-sentinel').forEach(element => element.remove());
      copy.querySelectorAll('details').forEach(element => { element.open = true; });
      const title = chart.input.name ? `Saturn chart — ${chart.input.name}` : 'Saturn chart';
      const documentHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>body{max-width:850px;margin:3rem auto;padding:0 1.5rem;color:#222;font:16px/1.6 Georgia,serif}h1,h2,h3{line-height:1.2}section,article,figure,details{margin:2rem 0}svg{max-width:360px;width:100%;height:auto}svg text{fill:#222}svg path,svg circle,svg ellipse,svg line{stroke:#555}.wheel-circle{fill:none}.saturn-marker{fill:#222}.zodiac-glyph{font-size:20px}.wheel-center-glyph{font-size:32px}.wheel-center-label{font-size:7px}dl div{display:flex;gap:1rem}dt{font-weight:bold}dd{margin:0}summary{font-weight:bold}a{color:#333} @media print{body{margin:0}a{color:inherit}.print-controls{display:none}}</style></head><body><div class="print-controls"><p>Choose “Save as PDF” in the print dialog to save this chart on your computer.</p><button type="button" id="print-again">Print or save as PDF</button></div><p>Saved Saturn chart · ${esc(chart.input.date)} · ${esc(chart.input.place)}</p><p>Time: ${esc(chart.input.time || "Unknown")} (${esc(chart.input.precision)}${chart.input.precision === "approximate" ? `, ±${esc(chart.input.uncertainty)} minutes` : ""}${chart.input.fold ? `, ${esc(chart.input.fold)} occurrence` : ""}) · Time zone: ${esc(chart.input.zone)}</p>${copy.innerHTML}</body></html>`;
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('The print window was blocked. Allow pop-ups for this page and try again.');
      printWindow.document.open();
      printWindow.document.write(documentHtml);
      printWindow.document.close();
      printWindow.document.getElementById('print-again').addEventListener('click', () => printWindow.print());
      printWindow.focus();
      printWindow.print();
      $('#save-status').textContent = 'Choose Save as PDF in the print dialog.';
    } catch (error) {
      $('#save-status').textContent = error.message || 'The print window could not be opened.';
    }
  }

  function renderSavedCharts(host, emptyHtml = '') {
    try {
      const records = readSavedCharts();
      if (!records.length) {
        host.innerHTML = emptyHtml;
        return;
      }
      host.innerHTML = `<h2>Saved charts</h2><p>Stored in this browser on this device. Opening a chart recalculates it.</p><div class="saved-chart-list">${records.map((record, index) => `<div class="saved-chart-row"><div><strong>${esc(record.name || (record.type === 'event' ? 'Event / project chart' : 'Birth chart'))}</strong><p>${esc(record.date)} · ${esc(record.place)}</p></div><div class="saved-chart-actions"><button type="button" class="outline-button" data-open-chart="${index}">Open chart</button><button type="button" class="quiet-button" data-delete-chart="${index}" aria-label="Delete ${esc(record.name || 'chart')} ${esc(record.date)}">Delete</button></div></div>`).join('')}</div><div id="saved-chart-warning" class="saved-chart-warning" role="alert"></div><p id="saved-chart-status" class="error-message" role="status"></p>`;
      host.onclick = event => {
        const open = event.target.closest('[data-open-chart]');
        const remove = event.target.closest('[data-delete-chart]');
        try {
          const current = readSavedCharts();
          if (open) {
            const input = current[Number(open.dataset.openChart)];
            if (!input || !window.Astronomy) throw new Error('This chart could not be opened.');
            if (chart && !open.hasAttribute('data-confirmed') && !isCurrentChartIn(current)) {
              const warning = host.querySelector('#saved-chart-warning');
              warning.innerHTML = `<p>The chart on screen is not saved. Opening ${esc(input.name || 'this chart')} will replace it, and its details will be lost.</p><div class="saved-chart-actions"><button type="button" class="outline-button" data-open-chart="${esc(open.dataset.openChart)}" data-confirmed>Open anyway</button><button type="button" class="quiet-button" data-keep-chart>Keep current chart</button></div>`;
              warning.querySelector('[data-keep-chart]').focus();
              return;
            }
            chart = C.calculate(input, window.Astronomy);
            host.closest('dialog')?.close();
            resultsScreen();
          } else if (remove) {
            current.splice(Number(remove.dataset.deleteChart), 1);
            localStorage.setItem(savedChartsKey, JSON.stringify(current));
            renderSavedCharts(host, emptyHtml);
          } else if (event.target.closest('[data-keep-chart]')) {
            host.querySelector('#saved-chart-warning').innerHTML = '';
          }
        } catch (error) {
          host.querySelector('#saved-chart-status').textContent = error.message || 'The saved chart could not be accessed.';
        }
      };
    } catch (error) {
      host.innerHTML = '<p class="error-message" role="status">Saved charts could not be accessed in this browser.</p>';
    }
  }

  function showSavedChartsDialog() {
    renderSavedCharts(document.getElementById('saved-charts-list'), '<h2>Saved charts</h2><p>No charts saved in this browser yet.</p>');
    document.getElementById('saved-charts-dialog').showModal();
  }

  function enter() {
    chosenPlace = null;
    pendingInput = null;
    chart = null;
    setScreen(`
      <section class="entrance" aria-labelledby="entrance-title">
        <div class="entrance-copy">
          <span class="overline">FILE ♄ · A READING UNDER ONE PLANET</span>
          <h1 id="entrance-title">SATURN</h1>
          <p class="entrance-line">Time gives form to what it takes away.</p>
          <p class="intro">A reading built around Saturn’s calculated place in a birth or event chart. Enter the details you know. Unknown time stays unknown.</p>
          <p class="intro-note">No forecast. No diagnosis. No claim about the facts of a life.</p>
          <button id="enter-reading" class="primary-button" type="button">Enter <span aria-hidden="true">→</span></button>
          <div class="entrance-meta"><span>CALCULATED POSITION</span><i></i><span>AUTHORED INTERPRETATION</span></div>
        </div>
        <figure class="entrance-object" aria-labelledby="object-caption">
          <div class="sigil-frame"><img src="assets/saturnian_sigil.png" alt="" class="sigil"></div>
          <svg class="opening-rings" viewBox="0 0 560 440" role="img" aria-labelledby="ring-title ring-description">
            <title id="ring-title">A Saturn-like ring form</title>
            <desc id="ring-description">A restrained line illustration used as entrance artwork. It is not a chart or a measurement.</desc>
            <ellipse cx="280" cy="220" rx="210" ry="70" transform="rotate(-21 280 220)" />
            <ellipse cx="280" cy="220" rx="171" ry="49" transform="rotate(-21 280 220)" />
            <circle cx="280" cy="220" r="82" />
            <path d="M201 238c24 31 62 53 108 59" />
            <text x="280" y="230" text-anchor="middle">♄</text>
          </svg>
          <figcaption id="object-caption"><span>AN IMAGE OF SATURN</span><span>NOT A CALCULATED CHART</span></figcaption>
        </figure>
      </section>
      <section id="saved-charts" class="saved-charts" aria-label="Saved charts"></section>
      <section class="entrance-lower" aria-label="About this prototype">
        <p>ONE SUBJECT<br><span>Saturn and its supported chart factors.</span></p>
        <p>ONE METHOD<br><span>Calculated positions, visible assumptions.</span></p>
        <p>ONE CONDITION<br><span>The reading is complete in silence.</span></p>
      </section>
    `);
    $('#enter-reading').addEventListener('click', inputScreen);
    renderSavedCharts($('#saved-charts'));
  }

  function inputScreen(resetPlace = true) {
    if (resetPlace) {
      chosenPlace = null;
      pendingInput = null;
      chart = null;
    }
    setScreen(`
      <section class="form-screen" aria-labelledby="input-title">
        <div class="page-heading">
          <span class="overline">01 / INPUT</span>
          <h1 id="input-title">Begin with what is known.</h1>
          <p>Choose a birth chart or an event chart. A name is optional. Time can be exact, approximate or unknown.</p>
        </div>
        <form id="chart-form" novalidate>
          <div class="form-columns">
            <div class="form-main">
              <fieldset class="field-group">
                <legend>Chart kind</legend>
                <div class="segmented">
                  <label><input type="radio" name="type" value="natal" checked><span>Birth chart</span></label>
                  <label><input type="radio" name="type" value="event"><span>Event / project</span></label>
                </div>
              </fieldset>
              <label class="field-label" for="record-name">Name <span>optional</span></label>
              <input class="text-input" id="record-name" name="name" maxlength="80" autocomplete="off" placeholder="A name or project title">
              <div class="date-place-grid">
                <label class="field-label" for="chart-date"><span id="date-label">Birth date</span>
                  <input class="text-input" type="date" id="chart-date" name="date" required min="1900-01-01" max="2100-12-31">
                </label>
                <div class="place-field">
                  <label class="field-label" for="place-query">Place</label>
                  <div class="place-search-row">
                    <input class="text-input" id="place-query" name="placeQuery" autocomplete="off" placeholder="City, country" aria-describedby="place-help">
                    <button id="find-place" class="outline-button" type="button">Find place</button>
                  </div>
                  <p id="place-help" class="field-help">Choose a result, or enter a built-in city name and continue. Use Find for other places.</p>
                  <div id="place-results" class="place-results" role="group" aria-label="Matching places" aria-live="polite"></div>
                  <div id="place-confirmation" class="place-confirmation" role="status" hidden></div>
                </div>
              </div>
              <fieldset class="field-group time-group">
                <legend>Time certainty</legend>
                <div class="time-choices">
                  <label><input type="radio" name="precision" value="unknown" checked><span>Unknown</span></label>
                  <label><input type="radio" name="precision" value="approximate"><span>Approximate</span></label>
                  <label><input type="radio" name="precision" value="exact"><span>Exact</span></label>
                </div>
              </fieldset>
              <div id="time-details" class="time-details" hidden>
                <label class="field-label" for="chart-time">Local time
                  <input class="text-input" type="time" id="chart-time" name="time">
                </label>
                <label id="uncertainty-field" class="field-label" for="uncertainty" hidden>Possible error on either side
                  <select class="text-input" id="uncertainty" name="uncertainty">
                    <option value="15">± 15 minutes</option><option value="30" selected>± 30 minutes</option><option value="60">± 1 hour</option><option value="120">± 2 hours</option><option value="360">± 6 hours</option>
                  </select>
                </label>
              </div>
              <div id="fold-field" class="fold-field" hidden>
                <label class="field-label" for="fold-choice">This local clock time occurs twice. Which occurrence is correct?
                  <select class="text-input" id="fold-choice" name="fold"><option value="">Choose an occurrence</option><option value="earlier">Earlier occurrence</option><option value="later">Later occurrence</option></select>
                </label>
              </div>
              <details class="custom-place">
                <summary>Advanced fallback: manual coordinates and time zone</summary>
                <p class="field-help">Only use this if place search fails. Normally, selecting a place fills its time zone automatically. For a manual entry, use an IANA name such as <code>Europe/Stockholm</code>. Coordinates are retained for the chart record; this prototype does not calculate houses.</p>
                <div class="custom-place-grid">
                  <label class="field-label" for="custom-place-name">Place name<input class="text-input" id="custom-place-name" autocomplete="off"></label>
                  <label class="field-label" for="custom-zone">Time zone<input class="text-input" id="custom-zone" placeholder="Europe/Stockholm" autocomplete="off"></label>
                  <label class="field-label" for="custom-lat">Latitude<input class="text-input" id="custom-lat" type="number" min="-90" max="90" step="any"></label>
                  <label class="field-label" for="custom-lon">Longitude<input class="text-input" id="custom-lon" type="number" min="-180" max="180" step="any"></label>
                </div>
                <button id="use-custom-place" class="outline-button" type="button">Use these details</button>
              </details>
              <p id="input-error" class="error-message" role="alert"></p>
              <div class="form-actions"><button class="primary-button" type="submit">Review chart details <span aria-hidden="true">→</span></button><button class="quiet-button" id="cancel-input" type="button">Return</button></div>
            </div>
            <aside class="form-aside">
              <span class="overline">A NOTE ON THE UNKNOWN</span>
              <h2>Do not fill silence with noon.</h2>
              <p>If the time is unknown, the whole local day is checked. A sign or aspect that changes during that interval is withheld from the reading.</p>
              <p>Place search is optional. When used, only the place query is sent to Open-Meteo / GeoNames. Your name, date and time are not sent.</p>
              <p class="aside-footnote">1900–2100 input range · optional browser storage</p>
            </aside>
          </div>
        </form>
      </section>
    `);

    const form = $('#chart-form');
    const timeDetails = $('#time-details');
    const timeInput = $('#chart-time');
    const uncertaintyField = $('#uncertainty-field');
    const results = $('#place-results');
    const confirmation = $('#place-confirmation');
    const query = $('#place-query');

    const updatePrecision = () => {
      const precision = form.querySelector('input[name="precision"]:checked').value;
      timeDetails.hidden = precision === 'unknown';
      uncertaintyField.hidden = precision !== 'approximate';
      timeInput.required = precision !== 'unknown';
    };
    form.querySelectorAll('input[name="precision"]').forEach(radio => radio.addEventListener('change', updatePrecision));
    form.querySelectorAll('input[name="type"]').forEach(radio => radio.addEventListener('change', event => {
      $('#date-label').textContent = event.target.value === 'event' ? 'Event / project date' : 'Birth date';
    }));
    [$('#chart-date'), $('#chart-time')].forEach(field => field.addEventListener('change', () => { $('#fold-choice').value = ''; }));
    query.addEventListener('input', () => {
      chosenPlace = null;
      confirmation.hidden = true;
      confirmation.innerHTML = '';
      const matches = cityMatches(query.value);
      renderPlaces(matches, results);
    });
    $('#find-place').addEventListener('click', () => findPlace(query.value, results));
    results.addEventListener('click', event => {
      const button = event.target.closest('[data-place-index]');
      if (button) choosePlace(JSON.parse(button.dataset.place), query, confirmation, results);
    });
    $('#use-custom-place').addEventListener('click', () => {
      const name = $('#custom-place-name').value.trim();
      const zone = $('#custom-zone').value.trim();
      const lat = Number($('#custom-lat').value);
      const lon = Number($('#custom-lon').value);
      try {
        if (!name || !zone || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('Enter a place name, valid coordinates and an IANA time-zone name.');
        new Intl.DateTimeFormat('en', { timeZone: zone });
        choosePlace({ city: name, region: '', country: '', label: name, zone, lat, lon, source: 'Manual place details' }, query, confirmation, results);
        query.value = name;
        confirmation.scrollIntoView({ block: 'nearest' });
      } catch (error) {
        $('#input-error').textContent = error.message;
      }
    });
    $('#cancel-input').addEventListener('click', enter);
    if (pendingInput) {
      form.querySelector(`input[name="type"][value="${pendingInput.type}"]`).checked = true;
      form.querySelector(`input[name="precision"][value="${pendingInput.precision}"]`).checked = true;
      $('#record-name').value = pendingInput.name;
      $('#chart-date').value = pendingInput.date;
      timeInput.value = pendingInput.time;
      $('#uncertainty').value = String(pendingInput.uncertainty);
      $('#fold-choice').value = pendingInput.fold;
      $('#fold-field').hidden = !pendingInput.fold;
      $('#date-label').textContent = pendingInput.type === 'event' ? 'Event / project date' : 'Birth date';
      if (chosenPlace && chosenPlace.source === 'Manual place details') {
        $('.custom-place').open = true;
        $('#custom-place-name').value = chosenPlace.city;
        $('#custom-zone').value = chosenPlace.zone;
        $('#custom-lat').value = chosenPlace.lat;
        $('#custom-lon').value = chosenPlace.lon;
      }
    }
    updatePrecision();
    if (chosenPlace) choosePlace(chosenPlace, query, confirmation, results);

    form.addEventListener('submit', event => {
      event.preventDefault();
      $('#input-error').textContent = '';
      $('#fold-field').hidden = true;
      try {
        if (!chosenPlace) {
          const exact = exactPlaceMatch(query.value);
          if (exact) choosePlace(exact, query, confirmation, results);
        }
        if (!chosenPlace) throw new Error('Select a matching result or use Find place. You do not need to enter a time-zone name.');
        const precision = form.querySelector('input[name="precision"]:checked').value;
        const data = {
          type: form.querySelector('input[name="type"]:checked').value,
          name: $('#record-name').value.trim(),
          date: $('#chart-date').value,
          time: precision === 'unknown' ? '' : timeInput.value,
          precision,
          uncertainty: Number($('#uncertainty').value),
          fold: $('#fold-choice').value,
          place: chosenPlace.label,
          placeSource: chosenPlace.source,
          zone: chosenPlace.zone,
          lat: chosenPlace.lat,
          lon: chosenPlace.lon
        };
        if (!data.date) throw new Error('Enter the birth or event date.');
        const span = C.interval(data);
        pendingInput = data;
        placeReview(data, span);
      } catch (error) {
        if (error.code === 'AMBIGUOUS_TIME') {
          $('#fold-field').hidden = false;
          $('#input-error').textContent = error.message;
          $('#fold-choice').focus();
          return;
        }
        $('#input-error').textContent = error.message || 'The chart details could not be resolved. Check the date, time and place.';
      }
    });
  }

  function renderPlaces(matches, host) {
    host.innerHTML = matches.slice(0, 8).map(place => `<button type="button" class="place-result" data-place-index="${places.indexOf(place)}" data-place="${esc(JSON.stringify(place))}"><span>${esc(place.label)}</span><small>${esc(place.zone)}</small></button>`).join('');
  }

  function choosePlace(place, query, confirmation, results) {
    chosenPlace = place;
    query.value = place.label;
    results.innerHTML = '';
    const now = new Date();
    const zoneTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: place.zone }).format(now);
    confirmation.innerHTML = `<span class="confirmation-mark" aria-hidden="true">○</span><div><strong>${esc(place.label)}</strong><p>${place.lat.toFixed(4)}°, ${place.lon.toFixed(4)}° · ${esc(place.zone)}</p><p>Local time now: ${esc(zoneTime)} · ${esc(place.source)}</p></div>`;
    confirmation.hidden = false;
    query.focus();
  }

  async function findPlace(rawQuery, host) {
    const query = rawQuery.trim();
    if (query.length < 2) {
      host.innerHTML = '<p class="small-message">Enter at least two characters.</p>';
      return;
    }
    const local = cityMatches(query);
    if (local.length) {
      renderPlaces(local, host);
      return;
    }
    host.innerHTML = '<p class="small-message">Searching Open-Meteo / GeoNames for this place…</p>';
    try {
      const url = 'https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({ name: query.replace(/\//g, ','), count: '8', language: 'en', format: 'json' });
      const response = await fetch(url);
      if (!response.ok) throw new Error('The place service returned an error.');
      const payload = await response.json();
      const matches = (payload.results || []).filter(place => place.name && place.country && place.timezone && Number.isFinite(place.latitude) && Number.isFinite(place.longitude)).map(place => ({
        city: place.name, region: place.admin1 || '', country: place.country,
        label: [place.name, place.admin1 && place.admin1 !== place.name ? place.admin1 : '', place.country].filter(Boolean).join(', '),
        zone: place.timezone, lat: place.latitude, lon: place.longitude, source: 'Open-Meteo / GeoNames'
      }));
      if (!matches.length) {
        host.innerHTML = '<p class="small-message">No matching place with a time zone was found. Try a more specific name or enter details manually.</p>';
        return;
      }
      host.innerHTML = matches.map(place => `<button type="button" class="place-result" data-place="${esc(JSON.stringify(place))}"><span>${esc(place.label)}</span><small>${esc(place.zone)}</small></button>`).join('');
      host.querySelectorAll('[data-place]').forEach(button => button.addEventListener('click', () => choosePlace(JSON.parse(button.dataset.place), $('#place-query'), $('#place-confirmation'), host)));
    } catch (error) {
      host.innerHTML = `<p class="small-message">${esc(error.message)} Built-in places and manual coordinates still work.</p>`;
    }
  }

  function formatLocal(instant, zone) {
    return new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: zone, timeZoneName: 'short' }).format(new Date(instant));
  }

  function placeReview(input, span) {
    const timeDescription = input.precision === 'unknown'
      ? 'Unknown · the full local date will be sampled'
      : input.precision === 'approximate'
        ? `Approximate · ±${input.uncertainty} minutes`
        : `Exact as entered · ${input.time}`;
    const localAtCenter = formatLocal(span.center, input.zone);
    setScreen(`
      <section class="verification-screen" aria-labelledby="verification-title">
        <span class="overline">02 / VERIFICATION</span>
        <h1 id="verification-title">Confirm the place and time.</h1>
        <p class="verification-lead">The chart uses the resolved location and its time-zone history. Check the details before the calculation begins.</p>
        <div class="verification-card">
          <div class="verification-row"><span>CHART</span><strong>${input.type === 'event' ? 'Event / project' : 'Birth'}${input.name ? ` · ${esc(input.name)}` : ''}</strong></div>
          <div class="verification-row"><span>DATE</span><strong>${esc(input.date)}</strong></div>
          <div class="verification-row"><span>PLACE</span><strong>${esc(input.place)}</strong></div>
          <div class="verification-row"><span>COORDINATES</span><strong>${input.lat.toFixed(4)}°, ${input.lon.toFixed(4)}°</strong></div>
          <div class="verification-row"><span>TIME ZONE</span><strong>${esc(input.zone)}</strong></div>
          <div class="verification-row"><span>TIME CERTAINTY</span><strong>${esc(timeDescription)}</strong></div>
          <div class="verification-row"><span>RESOLVED LOCAL TIME</span><strong>${esc(localAtCenter)}</strong></div>
          ${input.precision === 'unknown' ? `<p class="verification-note">The calculation will span ${esc(formatLocal(span.start, input.zone))} to ${esc(formatLocal(span.end - 60000, input.zone))}. No noon birth time will be assumed.</p>` : ''}
          ${input.precision === 'approximate' ? `<p class="verification-note">The sensitivity check spans ${esc(formatLocal(span.start, input.zone))} to ${esc(formatLocal(span.end, input.zone))}.</p>` : ''}
          <p class="verification-note">Place source: ${esc(input.placeSource)}. Browser time-zone data can vary by browser version.</p>
        </div>
        <div class="form-actions"><button id="calculate-chart" class="primary-button" type="button">Confirm &amp; calculate <span aria-hidden="true">→</span></button><button id="edit-details" class="outline-button" type="button">Edit details</button></div>
      </section>
    `);
    $('#edit-details').addEventListener('click', () => inputScreen(false));
    $('#calculate-chart').addEventListener('click', () => {
      try {
        if (!window.Astronomy) throw new Error('The astronomy library did not load. Reload the page and try again.');
        chart = C.calculate(input, window.Astronomy);
        resultsScreen();
      } catch (error) {
        const note = document.createElement('p');
        note.className = 'error-message';
        note.setAttribute('role', 'alert');
        note.textContent = error.message || 'The chart could not be calculated.';
        $('#calculate-chart').before(note);
      }
    });
  }

  function formatPosition(longitude) {
    const signNumber = C.signs.findIndex((_, index) => index === Math.floor(longitude / 30));
    const degreeFloat = longitude % 30;
    const degree = Math.floor(degreeFloat);
    const minute = Math.floor((degreeFloat - degree) * 60);
    return `${degree}° ${String(minute).padStart(2, '0')}′ ${C.signs[signNumber]}`;
  }

  function wheelSvg(saturn, uncertainTime) {
    const cx = 180, cy = 180;
    const polar = (degrees, radius) => {
      const radians = (degrees - 90) * Math.PI / 180;
      return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
    };
    const labels = C.signs.map((sign, index) => {
      const point = polar(index * 30 + 15, 139);
      return `<text class="zodiac-glyph" x="${point.x.toFixed(2)}" y="${(point.y + 7).toFixed(2)}" text-anchor="middle">${C.signGlyphs[index]}\uFE0E</text>`;
    }).join('');
    const marks = Array.from({ length: 72 }, (_, index) => {
      const angle = index * 5;
      const outer = polar(angle, 160);
      const inner = polar(angle, index % 6 === 0 ? 147 : index % 3 === 0 ? 152 : 156);
      return `<line class="wheel-tick ${index % 6 === 0 ? 'major' : ''}" x1="${inner.x.toFixed(2)}" y1="${inner.y.toFixed(2)}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}" />`;
    }).join('');
    const marker = polar(saturn.longitude, 105);
    const markerOuter = polar(saturn.longitude, 127);
    const positionText = uncertainTime ? `Time-interval midpoint · ${formatPosition(saturn.longitude)}` : `${formatPosition(saturn.longitude)} · Saturn`;
    return `<svg class="chart-wheel" viewBox="0 0 360 360" role="img" aria-labelledby="wheel-title wheel-desc">
      <title id="wheel-title">Saturn’s tropical zodiac position</title>
      <desc id="wheel-desc">A zodiac wheel with Saturn marked at ${esc(positionText)}. No houses or other planetary positions are shown.</desc>
      <circle class="wheel-circle outer" cx="180" cy="180" r="160" /><circle class="wheel-circle" cx="180" cy="180" r="145" /><circle class="wheel-circle inner" cx="180" cy="180" r="96" />
      ${marks}${labels}
      <line class="saturn-marker-line" x1="${marker.x.toFixed(2)}" y1="${marker.y.toFixed(2)}" x2="${markerOuter.x.toFixed(2)}" y2="${markerOuter.y.toFixed(2)}" />
      <circle class="saturn-marker" cx="${marker.x.toFixed(2)}" cy="${marker.y.toFixed(2)}" r="4.5" />
      <text class="wheel-center-glyph" x="180" y="188" text-anchor="middle">♄</text>
      <text class="wheel-center-label" x="180" y="211" text-anchor="middle">SATURN</text>
    </svg>`;
  }

  function resultsScreen() {
    const reading = C.reading(chart);
    const saturn = chart.saturn;
    const sign = C.signs[saturn.sign];
    const timeText = chart.input.precision === 'unknown' ? 'Unknown time · full local day checked' : chart.input.precision === 'approximate' ? `Approximate time · ±${chart.input.uncertainty} minutes checked` : `Exact time · ${chart.input.time}`;
    const motionText = saturn.motion === 'uncertain' ? 'Motion changes during the interval' : saturn.motion === 'retrograde' ? 'Retrograde' : saturn.motion === 'stationary' ? 'Near station' : 'Direct';
    const aspectMarkup = reading.aspects.length
      ? reading.aspects.map(aspect => `<article class="aspect-card"><div class="aspect-card-head"><span>${esc(aspect.body)} ${esc(aspect.name)} Saturn</span><span>${aspect.orb.toFixed(2)}° orb</span></div><p>${esc(aspect.text)}</p><p class="factor-id">${esc(aspect.id)} · ${aspect.angle.toFixed(2)}° separation · ${aspect.limit}° limit</p></article>`).join('')
      : `<article class="aspect-card aspect-card-alone"><div class="aspect-card-head"><span>Saturn unaspected</span><span>no contact</span></div><p>${esc(reading.unaspected)}</p></article>`;
    const uncertaintyMarkup = reading.uncertainAspects.length
      ? `<div class="uncertainty-panel"><h3>Factors that change across the interval</h3><p>These possible Saturn aspects do not persist through every sampled time, so they are not used in the reading.</p><ul>${reading.uncertainAspects.map(item => `<li>${esc(item.body)}${item.possible.length ? ` · ${esc(item.possible.join(' / '))} possible` : ''}</li>`).join('')}</ul></div>`
      : '';
    setScreen(`
      <section class="chart-result" aria-labelledby="result-title">
        <div class="result-heading">
          <span class="overline">03 / THE CHART</span>
          <div class="result-title-row"><div><h1 id="result-title">${saturn.stableSign ? `Saturn in ${esc(sign)}` : 'Saturn · interval midpoint'}</h1><p>${chart.input.type === 'event' ? 'Event / project chart' : 'Natal chart'}${chart.input.name ? ` · ${esc(chart.input.name)}` : ''} <span class="dot-separator">·</span> ${esc(chart.input.place)}</p></div><button class="quiet-button new-chart" id="new-chart" type="button">Start another chart</button></div>
        </div>
        <div class="form-actions save-chart-actions"><button id="save-chart" class="outline-button" type="button">Save chart</button><button id="print-chart" class="outline-button" type="button">Save as PDF</button><button id="view-saved-charts" class="quiet-button" type="button">View saved charts</button><span id="save-status" class="field-help" role="status">Save in this browser or choose Save as PDF in the print dialog.</span></div>
        <div class="chart-layout">
          <figure class="wheel-panel"><div class="wheel-holder">${wheelSvg(saturn, chart.input.precision !== 'exact')}</div><figcaption><span>THE ZODIAC · SATURN’S CALCULATED POSITION</span><span>${chart.input.precision === 'exact' ? 'NO HOUSES OR ORBITS SHOWN' : 'INTERVAL MIDPOINT · NO HOUSES OR ORBITS'}</span></figcaption></figure>
          <div class="chart-summary">
            <span class="overline">SATURN / CALCULATED SUMMARY</span>
            <div class="position-reading"><span class="saturn-glyph" aria-hidden="true">♄</span><div><strong>${formatPosition(saturn.longitude)}</strong><span>${saturn.stableSign ? 'Sign stable across time range' : `Sign varies: ${saturn.signs.map(index => C.signs[index]).join(' / ')}`}</span></div></div>
            <dl class="summary-list">
              <div><dt>Motion</dt><dd>${esc(motionText)}</dd></div>
              <div><dt>Time basis</dt><dd>${esc(timeText)}</dd></div>
              <div><dt>Stable Saturn aspects</dt><dd>${chart.aspects.length} calculated</dd></div>
              <div><dt>House / angle</dt><dd>Not calculated</dd></div>
            </dl>
            <p class="summary-note">${saturn.stableSign ? esc(reading.placement) : esc(reading.uncertainty || reading.placement)}</p>
          </div>
        </div>
        <div class="time-sensitivity">${uncertaintyMarkup}</div>
      </section>

      <div class="reading-layout">
        <nav class="section-nav" aria-label="Reading sections">
          <span class="overline">THE READING</span>
          <a href="#placement">Saturn in the chart</a><a href="#weight">The weight</a><a href="#structure">The structure</a><a href="#endurance">Time &amp; endurance</a><a href="#aspects">Contacts</a><a href="#returns">Returns</a><a href="#door" class="nav-door" hidden>Room ♄</a>
        </nav>
        <article class="reading-content">
          <section class="reading-section reveal" id="placement">
            <span class="overline">01 / POSITION</span><h2>Saturn in the chart</h2>
            <p class="reading-lead">${esc(reading.placement)}</p>
            ${reading.opening ? `<p>${esc(reading.opening)}</p>` : ''}
            ${saturn.stableSign && reading.motionLine ? `<p>${esc(reading.motionLine)}</p>` : ''}
            <p class="factor-id">Factor: ${esc(saturn.id)} · ${saturn.longitude.toFixed(5)}° tropical longitude · ${saturn.speed.toFixed(5)}° / day</p>
          </section>
          <section class="reading-section reveal" id="weight"><span class="overline">02 / LIMIT</span><h2>The weight</h2><p>${esc(reading.weight)}</p></section>
          <section class="reading-section reveal" id="structure"><span class="overline">03 / FORM</span><h2>The structure</h2><p>${esc(reading.structure)}</p></section>
          <section class="reading-section reveal" id="endurance"><span class="overline">04 / DURATION</span><h2>Time &amp; endurance</h2><p>${esc(reading.endurance)}</p></section>
          <section class="reading-section reveal" id="aspects"><span class="overline">05 / CONTACT</span><h2>Saturn &amp; the other planets</h2><p class="section-intro">${esc(reading.aspectNote)}</p>${aspectMarkup}</section>
          <section class="reading-section returns-section reveal" id="returns">
            <span class="overline">06 / CYCLE</span><h2>Saturn returns</h2>
            <p>Every twenty-nine years Saturn comes back to the place it held at the start, and the building is inspected.</p>
            <p class="return-meaning">What has stood only because nobody leaned on it?</p>
            <p class="section-intro">${chart.input.type === 'event' ? 'For this event chart, the cycle starts at the event’s Saturn position.' : 'The first three returns.'} Saturn’s apparent backward motion can produce several exact contacts within one return.</p>
            <button id="calculate-returns" class="outline-button" type="button">Calculate return dates</button>
            <div id="returns-output" class="returns-output" aria-live="polite"></div>
          </section>
          <details class="evidence-details">
            <summary>Chart factors, method &amp; sources</summary>
            <div class="evidence-body">
              <h3>Calculated factors</h3>
              <p>Saturn: ${formatPosition(saturn.longitude)} tropical longitude (${saturn.longitude.toFixed(6)}°). Motion: ${esc(saturn.motion)}. Time zone: ${esc(chart.input.zone)}. Input location: ${esc(chart.input.place)} (${chart.input.lat.toFixed(4)}, ${chart.input.lon.toFixed(4)}).</p>
              ${chart.aspects.length ? `<ul>${chart.aspects.map(aspect => `<li>${esc(aspect.body)} ${esc(aspect.name)} Saturn · ${aspect.angle.toFixed(4)}° separation · ${aspect.orb.toFixed(4)}° orb · limit ${aspect.limit}° · ${esc(aspect.id)}</li>`).join('')}</ul>` : '<p>No Saturn aspects met the implemented orb throughout this time interval.</p>'}
              <h3>Calculation settings</h3><p>${esc(chart.method.zodiac)} zodiac; ${esc(chart.method.position)}. Houses and angles are omitted. ${esc(chart.method.sensitivity)}</p>
              <h3>Saturn returns</h3><p>A return is the moment transiting Saturn’s apparent geocentric tropical longitude equals the chart’s Saturn longitude. A 29.4-year period only centres each search window; each date is solved from the ephemeris with two-day sampling and bisection. Retrograde re-crossings are kept. For uncertain times the target is the interval midpoint and the sensitivity range is solved at the sampled extremes. Return dates have not yet been independently compared against a reference ephemeris. <a href="https://science.nasa.gov/saturn/facts/" target="_blank" rel="noopener">NASA Saturn facts ↗</a></p>
              <h3>Editorial status</h3><p>${esc(reading.status)}. All sign, aspect, return and House of Death texts are original editorial writing, not source-verified summaries. House of Death epigraphs are quotations from public-domain authors, drawn per chart; translations are editorial. Entry IDs: ${reading.entryIds.map(esc).join(', ')}.</p>
              <p>Calculation library: Astronomy Engine, MIT license, bundled in <code>vendor/astronomy.js</code>. Time-zone history comes from the browser and is not pinned.</p>
            </div>
          </details>
          <div id="end-of-reading" class="end-sentinel" aria-hidden="true"></div>
          <section id="door" class="sealed-door" hidden aria-labelledby="door-title">
            <div class="door-frame">
              <span class="overline">07 / ——— · NOT PART OF THE READING</span>
              <h2 id="door-title">There is one more room.</h2>
              ${epigraphHtml(C.houseEpigraphs(chart).door)}
              <p>At the end of the corridor, a door without a handle. The plate reads ♄. Behind it Saturn is followed through its four hard angles: lockdown, isolation, demolition and re-forming.</p>
              <div id="door-gate" class="door-gate">
                <button id="approach-door" class="outline-button" type="button">Approach the door</button>
              </div>
            </div>
          </section>
        </article>
      </div>
      <p class="reading-status"><span class="status-dot" aria-hidden="true"></span>${esc(reading.status)}</p>
    `);
    $('#new-chart').addEventListener('click', startAnotherChart);
    $('#save-chart').addEventListener('click', saveChart);
    $('#print-chart').addEventListener('click', printChart);
    $('#view-saved-charts').addEventListener('click', showSavedChartsDialog);
    $('#calculate-returns').addEventListener('click', () => {
      const button = $('#calculate-returns');
      const host = $('#returns-output');
      button.disabled = true;
      button.textContent = 'Calculating return dates…';
      host.textContent = 'Solving Saturn longitude crossings…';
      window.setTimeout(() => {
        try {
          const result = C.calculateReturns(chart, window.Astronomy);
          host.innerHTML = renderReturnCycles(result, chart);
          button.textContent = 'Recalculate return dates';
        } catch (error) {
          host.innerHTML = `<p class="error-message" role="alert">${esc(error.message || 'Return dates could not be calculated.')}</p>`;
          button.textContent = 'Try again';
        }
        button.disabled = false;
      }, 30);
    });
    main.querySelectorAll('.section-nav a').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      const target = main.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }));
    setupReveal();
    setupNavTracking();
    setupDoor();
  }

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sections surface as they are reached. Without IntersectionObserver or with reduced motion, everything is shown at once.
  function setupReveal() {
    const items = [...main.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window) || reducedMotion()) {
      items.forEach(item => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(item => observer.observe(item));
  }

  function setupNavTracking() {
    if (!('IntersectionObserver' in window)) return;
    const links = [...main.querySelectorAll('.section-nav a')];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.removeAttribute('aria-current'));
      const active = links.find(link => link.getAttribute('href') === `#${entry.target.id}`);
      if (active) active.setAttribute('aria-current', 'true');
    }), { rootMargin: '-30% 0px -60% 0px' });
    main.querySelectorAll('.reading-section, .sealed-door').forEach(section => observer.observe(section));
  }

  // The door appears only after the reader reaches the end of the reading.
  function setupDoor() {
    const door = $('#door');
    const sentinel = $('#end-of-reading');
    if (!door || !sentinel) return;
    const reveal = () => {
      if (!door.hidden) return;
      door.hidden = false;
      main.querySelector('.nav-door').hidden = false;
      window.requestAnimationFrame(() => door.classList.add('is-open'));
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      });
      observer.observe(sentinel);
    } else {
      reveal();
    }
    $('#approach-door').addEventListener('click', openGate);
  }

  function openGate() {
    const gate = $('#door-gate');
    gate.innerHTML = `<div class="content-gate" role="group" aria-labelledby="gate-title">
      <p id="gate-title" class="gate-title">Before entering</p>
      <p>Inside: death, confinement, demolition, the ward.</p>
      <p>You can leave at any moment.</p>
      <div class="form-actions"><button id="enter-house" class="primary-button" type="button">Enter the house <span aria-hidden="true">→</span></button><button id="stay-outside" class="quiet-button" type="button">Stay in the reading</button></div>
    </div>`;
    $('#enter-house').addEventListener('click', houseScreen);
    $('#stay-outside').addEventListener('click', closeGate);
    $('#enter-house').focus();
  }

  function closeGate() {
    $('#door-gate').innerHTML = '<button id="approach-door" class="outline-button" type="button">Approach the door</button>';
    $('#approach-door').addEventListener('click', openGate);
    $('#approach-door').focus();
  }

  function epigraphHtml(epigraph) {
    if (!epigraph) return '';
    const lines = esc(epigraph.text).split('\n').join('<br>');
    return `<figure class="epigraph"><blockquote${epigraph.lang ? ` lang="${epigraph.lang}"` : ''}>${lines}</blockquote>${epigraph.translation ? `<p class="epigraph-translation">${esc(epigraph.translation)}</p>` : ''}<figcaption>— ${esc(epigraph.source)}</figcaption></figure>`;
  }

  function formatDate(instant, zone) {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: zone }).format(new Date(instant));
  }

  function houseScreen() {
    const event = chart.input.type === 'event';
    const longitude = chart.saturn.longitude;
    const fileNo = `♄-${String(Math.floor(longitude)).padStart(3, '0')}-${String(Math.floor((longitude % 1) * 60)).padStart(2, '0')}`;
    setScreen(`
      <section class="house" aria-labelledby="house-title">
        <div class="ward-strip"><span>HOUSE OF DEATH</span><span>WARD XII · FILE ${esc(fileNo)}</span><button class="ward-exit" data-leave-house type="button">Leave the house</button></div>
        <div class="house-intro">
          <img src="assets/saturnian_sigil.png" alt="" class="house-sigil">
          <span class="overline">ROOM ♄</span>
          <h1 id="house-title">The House of Death</h1>
          ${epigraphHtml(C.houseEpigraphs(chart).threshold)}
          <p class="house-lead">${esc(C.houseThreshold.lead)}</p>
          <p class="house-note">Dates solved for ${event ? 'the event chart’s' : 'the chart’s'} Saturn at ${esc(formatPosition(longitude))}.${chart.input.precision === 'exact' ? '' : ' Uncertain time: interval midpoint used.'}</p>
        </div>
        <div id="house-rooms" class="house-rooms" aria-live="polite"><p class="small-message">Locating the doors…</p></div>
      </section>
    `);
    document.body.classList.add('house-mode');
    main.querySelectorAll('[data-leave-house]').forEach(button => button.addEventListener('click', leaveHouse));
    window.setTimeout(() => {
      const host = $('#house-rooms');
      if (!host) return;
      try {
        const house = C.calculateHouse(chart, window.Astronomy);
        host.innerHTML = renderRooms(house, event);
        host.addEventListener('click', clickEvent => {
          const next = clickEvent.target.closest('[data-next]');
          if (next) openRoom(next.dataset.next);
          if (clickEvent.target.closest('[data-leave-house]')) leaveHouse();
        });
        main.querySelector('.room').classList.add('is-visible');
      } catch (error) {
        host.innerHTML = `<p class="error-message" role="alert">${esc(error.message || 'The rooms could not be calculated.')}</p>`;
      }
    }, 30);
  }

  function renderRooms(house, event) {
    const yearMs = 365.2425 * 86400000;
    const zone = chart.input.zone;
    const rooms = house.rooms.map((room, index) => {
      const text = event ? room.event : room.natal;
      const register = room.cycles.map(cycle => {
        if (!cycle.contacts.length) return `<li><span>Cycle ${cycle.number}</span><span>No exact contact found in the search window</span><span></span></li>`;
        const years = (cycle.contacts[0].instant - chart.span.center) / yearMs;
        const when = event ? `${years.toFixed(1)} yrs after` : `age ${years.toFixed(1)}`;
        return `<li><span>Cycle ${cycle.number}</span><span>${cycle.contacts.map(contact => esc(formatDate(contact.instant, zone))).join(' · ')}</span><span>${when}</span></li>`;
      }).join('');
      const next = house.rooms[index + 1];
      const nextButton = next
        ? `<button class="outline-button next-door" type="button" data-next="${index + 1}">Next door · ${esc(next.title)} <span aria-hidden="true">→</span></button>`
        : `<button class="outline-button next-door" type="button" data-next="exit">Walk to the end of the corridor <span aria-hidden="true">→</span></button>`;
      return `<article class="room" id="room-${room.id}" ${index ? 'hidden' : ''} aria-labelledby="room-title-${room.id}">
        <div class="room-plate"><span>ROOM ${room.numeral}</span><span>${esc(room.theme.toUpperCase())}</span><span>${esc(room.angle)}</span></div>
        <div class="observation-window">
          <h2 id="room-title-${room.id}" tabindex="-1">${esc(room.title)}</h2>
          ${epigraphHtml(room.epigraph)}
          ${text.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}
        </div>
        <div class="room-register">
          <span class="overline">Register · transiting Saturn at ${room.offset || 360}° from the chart’s Saturn</span>
          <ol>${register}</ol>
        </div>
        ${nextButton}
      </article>`;
    }).join('');
    return `${rooms}
      <section class="house-exit room" id="house-exit" hidden aria-labelledby="house-exit-title">
        <div class="observation-window">
          <h2 id="house-exit-title" tabindex="-1">${esc(C.houseExit.title)}</h2>
          ${epigraphHtml(house.epigraphs.exit)}
          <p>${esc(C.houseExit.text)}</p>
        </div>
        <p class="factor-id">${esc(house.method)}</p>
        <div class="form-actions"><button class="primary-button" type="button" data-leave-house>Leave the house <span aria-hidden="true">→</span></button></div>
      </section>`;
  }

  function openRoom(next) {
    const room = next === 'exit' ? $('#house-exit') : main.querySelectorAll('.room')[Number(next)];
    if (!room) return;
    room.hidden = false;
    window.requestAnimationFrame(() => room.classList.add('is-visible'));
    room.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    const heading = room.querySelector('h2');
    if (heading) heading.focus({ preventScroll: true });
  }

  function leaveHouse() {
    resultsScreen();
    const door = $('#door');
    if (!door) return;
    door.hidden = false;
    door.classList.add('is-open');
    main.querySelector('.nav-door').hidden = false;
    main.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
    window.requestAnimationFrame(() => door.scrollIntoView({ block: 'center' }));
    $('#approach-door').focus({ preventScroll: true });
  }

  function renderReturnCycles(result, chartRecord) {
    const yearMs = 365.2425 * 86400000;
    const natal = chartRecord.input.type === 'natal';
    if (!result.cycles.some(cycle => cycle.contacts.length)) return `<p class="quiet-note">No exact return contact was found inside the three configured search windows. The calculation is provisional; review the method and chart inputs.</p>`;
    return `${result.cycles.map(cycle => {
      const title = natal ? ['First return', 'Second return', 'Third return'][cycle.number - 1] : `Event chart return ${cycle.number}`;
      const ageLabel = natal
        ? chartRecord.input.precision === 'exact' ? 'Age at contact' : 'Approximate age from interval midpoint'
        : chartRecord.input.precision === 'exact' ? 'Time after event chart' : 'Approximate time after event midpoint';
      const contactList = cycle.contacts.length
        ? cycle.contacts.map((contact, index) => {
          const elapsed = (contact.instant - chartRecord.span.center) / yearMs;
          const sensitivity = chartRecord.input.precision === 'exact'
            ? ''
            : contact.sensitivityStable
              ? `<p class="return-sensitivity">Input-time sensitivity: ${esc(formatLocal(contact.rangeStart, chartRecord.input.zone))} – ${esc(formatLocal(contact.rangeEnd, chartRecord.input.zone))}</p>`
              : '<p class="return-sensitivity">The exact contact pattern varies across the sampled input-time range. This date is the interval-midpoint result.</p>';
          return `<div class="return-contact"><div class="return-contact-heading"><span>${cycle.contacts.length > 1 ? `Exact pass ${index + 1}` : 'Exact pass'}</span><span>${elapsed.toFixed(1)} years</span></div><p class="return-date">${esc(formatLocal(contact.instant, chartRecord.input.zone))}</p><p class="return-age">${ageLabel}: ${elapsed.toFixed(2)} years.</p>${sensitivity}<p class="factor-id">${esc(contact.id)} · zero-degree longitude conjunction</p></div>`;
        }).join('')
        : '<p class="quiet-note">No exact crossing was found inside this cycle’s search window.</p>';
      const audit = C.reading(chartRecord).returnAudits[cycle.number - 1] || '';
      return `<article class="return-cycle"><span class="overline">CYCLE ${String(cycle.number).padStart(2, '0')}</span><h3>${esc(title)}</h3>${contactList}<p class="return-prompt">${esc(audit)}</p></article>`;
    }).join('')}`;
  }

  function setVolume(value) {
    const target = Math.max(0, Math.min(0.12, Number(value)));
    if (!soundOn) {
      audio.volume = 0;
      return;
    }
    if (fadeTimer) clearInterval(fadeTimer);
    const start = audio.volume;
    const duration = 500;
    const started = performance.now();
    fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      audio.volume = start + (target - start) * progress;
      if (progress === 1) {
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    }, 30);
  }

  async function toggleSound() {
    soundOn = !soundOn;
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on');
    soundButton.textContent = soundOn ? 'Sound on' : 'Sound off';
    if (soundOn) {
      try {
        await audio.play();
        setVolume(volume.value);
      } catch {
        soundOn = false;
        soundButton.setAttribute('aria-pressed', 'false');
        soundButton.setAttribute('aria-label', 'Turn ambient sound on');
        soundButton.textContent = 'Sound off';
      }
    } else {
      if (fadeTimer) clearInterval(fadeTimer);
      const starting = audio.volume;
      const began = performance.now();
      fadeTimer = setInterval(() => {
        const progress = Math.min(1, (performance.now() - began) / 450);
        audio.volume = starting * (1 - progress);
        if (progress === 1) {
          clearInterval(fadeTimer);
          fadeTimer = null;
          audio.pause();
          audio.currentTime = 0;
        }
      }, 30);
    }
  }

  soundButton.addEventListener('click', toggleSound);
  volume.addEventListener('input', () => { if (soundOn) setVolume(volume.value); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && soundOn) {
      soundOn = false;
      if (fadeTimer) clearInterval(fadeTimer);
      fadeTimer = null;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.setAttribute('aria-label', 'Turn ambient sound on');
      soundButton.textContent = 'Sound off';
    }
  });

  document.getElementById('method-button').addEventListener('click', () => document.getElementById('method-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
  document.getElementById('confirm-new-chart').addEventListener('click', () => {
    document.getElementById('new-chart-dialog').close();
    inputScreen();
  });
  enter();
})();
