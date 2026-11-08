const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../saturn-v2/core.js');
const astronomy = require('../saturn-v2/vendor/astronomy.js');
const base = { type: 'natal', name: '', date: '2000-01-01', time: '12:00', precision: 'exact', uncertainty: 30, fold: '', zone: 'UTC', place: 'Greenwich', lat: 51.48, lon: 0 };

test('Saturn positions and motion agree with published reference dates', () => {
  // https://bookofhoroscopes.com/en/calendar/2000-01-01 (noon UTC, rounded to minutes)
  // https://www.selfgazer.com/sky/date/2024-10-27 (noon UTC)
  for (const [date, longitude] of [['2000-01-01', 40 + 24 / 60], ['2024-10-27', 343 + 24 / 3600]]) {
    const result = C.calculate({ ...base, date }, astronomy);
    assert.ok(Math.abs(result.saturn.longitude - longitude) < 0.03, `${date}: ${result.saturn.longitude}`);
    assert.equal(result.saturn.motion, 'retrograde');
  }
});

test('local clock gaps and overlaps require correction or an occurrence', () => {
  const local = { ...base, zone: 'Europe/Stockholm', time: '02:30' };
  assert.throws(() => C.interval({ ...local, date: '2024-03-31' }), /does not exist/);
  assert.throws(() => C.interval({ ...local, date: '2024-10-27' }), error => error.code === 'AMBIGUOUS_TIME');
  const earlier = C.interval({ ...local, date: '2024-10-27', fold: 'earlier' });
  const later = C.interval({ ...local, date: '2024-10-27', fold: 'later' });
  assert.equal(later.center - earlier.center, 3600000);
});

test('unknown time preserves only aspects stable across the sampled day', () => {
  const chart = C.calculate({ ...base, date: '2024-03-31', zone: 'Europe/Stockholm', time: '', precision: 'unknown' }, astronomy);
  assert.equal(chart.span.end - chart.span.start, 23 * 3600000);
  assert.ok(chart.aspects.some(a => a.body === 'Jupiter' && a.name === 'sextile'));
  assert.ok(chart.uncertainAspects.some(a => a.body === 'Moon'));
  assert.ok(!chart.aspects.some(a => a.body === 'Moon'));
  const reading = C.reading(chart);
  assert.ok(reading.uncertainAspects.some(a => a.body === 'Moon'));
  assert.ok(!reading.aspects.some(a => a.body === 'Moon'));
});

test('first Saturn return finds all three passes and the published third-pass date', () => {
  const chart = C.calculate(base, astronomy);
  const contacts = C.calculateReturns(chart, astronomy).cycles[0].contacts;
  assert.equal(contacts.length, 3);
  assert.deepEqual(contacts.map(c => new Date(c.instant).toISOString().slice(0, 10)), ['2028-07-21', '2028-09-24', '2029-04-01']);
  // At noon on 1 April 2029 the independent table reports 10°21′ Taurus,
  // close to the natal position of 10°24′; this checks the date, not the minute.
  // https://bookofhoroscopes.com/en/calendar/2029-04-01
});

test('event readings use project-specific sign text and identify their context', () => {
  const input = { ...base, date: '1984-06-18', time: '10:30', precision: 'approximate' };
  const natal = C.reading(C.calculate(input, astronomy));
  const event = C.reading(C.calculate({ ...input, type: 'event' }, astronomy));
  assert.notEqual(event.weight, natal.weight);
  assert.notEqual(event.structure, natal.structure);
  assert.notEqual(event.endurance, natal.endurance);
  assert.ok(event.aspects.length > 0);
  assert.ok(event.aspects.every(a => a.text.startsWith('For this event or project:')));
});

test('House of Death rooms land on the exact Saturn angles in cycle order', () => {
  const chart = C.calculate(base, astronomy);
  const house = C.calculateHouse(chart, astronomy);
  const day = 86400000;
  const year = 365.2425 * day;
  assert.deepEqual(house.rooms.map(room => room.offset), [90, 180, 270, 0]);
  let previous = chart.span.center;
  for (const room of house.rooms) {
    const first = room.cycles[0].contacts;
    assert.ok(first.length >= 1, `${room.id} has a first-cycle contact`);
    for (const contact of first) {
      const lon = C.norm(astronomy.Ecliptic(astronomy.GeoVector('Saturn', new Date(contact.instant), true)).elon);
      assert.ok(C.separation(lon, room.target) < 0.001, `${room.id} hits its target angle`);
    }
    assert.ok(first[0].instant > previous, `${room.id} follows the previous room`);
    previous = first[0].instant;
    for (const cycle of room.cycles) assert.ok(cycle.contacts.length >= 1, `${room.id} cycle ${cycle.number}`);
  }
  const cellYears = (house.rooms[0].cycles[0].contacts[0].instant - chart.span.center) / year;
  assert.ok(cellYears > 5 && cellYears < 10, `cell at ${cellYears}`);
});

test('the re-forming room matches the first Saturn return', () => {
  const chart = C.calculate(base, astronomy);
  const house = C.calculateHouse(chart, astronomy);
  const returns = C.calculateReturns(chart, astronomy);
  const roomDates = house.rooms[3].cycles[0].contacts.map(c => new Date(c.instant).toISOString().slice(0, 10));
  const returnDates = returns.cycles[0].contacts.map(c => new Date(c.instant).toISOString().slice(0, 10));
  assert.deepEqual(roomDates, returnDates);
});

test('v2 narrative has no Christian or advice-style vocabulary', () => {
  const read = file => require('node:fs').readFileSync(require('node:path').join(__dirname, '../saturn-v2', file), 'utf8');
  const source = read('core.js') + read('narrative.js');
  for (const word of [/confess/i, /\bchurch/i, /\baltar/i, /\bsaint/i, /\bfaith\b/i, /\bsin\b/i, /\bgrace\b/i, /redempt/i, /salvation/i, /\bdevil/i, /\bangel/i, /heaven/i, /\bhell\b/i, /Christian/, /\bpray/i, /resurrect/i, /symbolic/i, /This is not/, /does not kill/, /Leave room/i, /Rest makes/i, /deserves/i]) {
    assert.ok(!word.test(source), `found ${word}`);
  }
});

test('aspect texts for different planets are not one-word variants', () => {
  const chart = C.calculate({ ...base, date: '1990-03-15', time: '14:30', zone: 'Europe/Berlin' }, astronomy);
  const texts = C.reading(chart).aspects.map(a => a.text);
  assert.ok(texts.length >= 2);
  assert.equal(new Set(texts.map(t => t.split('. ').slice(-1)[0])).size, texts.length);
});

test('house epigraphs are stable per chart, vary across charts, and do not repeat authors', () => {
  const chart = C.calculate(base, astronomy);
  const first = C.houseEpigraphs(chart);
  assert.deepEqual(C.houseEpigraphs(C.calculate(base, astronomy)), first, 'same chart, same house');
  const slots = ['door', 'threshold', 'cell', 'ward', 'demolition', 'reforming', 'exit'];
  const signatures = new Set();
  for (let year = 1950; year < 2010; year++) {
    const picks = C.houseEpigraphs(C.calculate({ ...base, date: `${year}-03-15` }, astronomy));
    const authors = slots.map(slot => picks[slot].author);
    assert.equal(new Set(authors).size, authors.length, `${year}: author repeated`);
    for (const slot of slots) assert.ok(C.epigraphPools[slot].includes(picks[slot]), `${year}: ${slot} from its pool`);
    signatures.add(slots.map(slot => picks[slot].text).join('|'));
  }
  assert.ok(signatures.size >= 50, `only ${signatures.size} distinct houses in 60 charts`);
  assert.equal(C.calculateHouse(chart, astronomy).rooms[0].epigraph, first.cell);
});

test('natal readings use the decan and a stable per-chart variant', () => {
  const N = require('../saturn-v2/narrative.js');
  assert.equal(N.natal.length, 12);
  for (const sign of N.natal) { assert.equal(sign.length, 3); for (const decan of sign) assert.equal(decan.length, 8); }
  for (const sign of N.event) { assert.equal(sign.length, 3); for (const decan of sign) assert.equal(decan.length, 4); }
  const all = N.natal.flat(2).concat(N.event.flat(2));
  assert.equal(new Set(all).size, all.length, 'no duplicated lines');
  const chart = C.calculate(base, astronomy);
  const decan = C.decanOf(chart.saturn.longitude);
  const lines = N.natal[chart.saturn.sign][decan];
  const reading = C.reading(chart);
  assert.ok([lines[0], lines[1]].includes(reading.opening));
  assert.ok([lines[2], lines[3]].includes(reading.weight));
  assert.ok([lines[4], lines[5]].includes(reading.structure));
  assert.ok([lines[6], lines[7]].includes(reading.endurance));
  assert.deepEqual(C.reading(C.calculate(base, astronomy)), reading, 'same chart, same reading');
  const variants = new Set();
  for (const name of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
    const r = C.reading(C.calculate({ ...base, name }, astronomy));
    variants.add([r.opening, r.weight, r.structure, r.endurance].join('|'));
  }
  assert.ok(variants.size > 1, 'different charts with the same Saturn can read differently');
  assert.equal(C.decanOf(9.99), 0); assert.equal(C.decanOf(10), 1); assert.equal(C.decanOf(293.33), 2);
});

test('a chart with no Saturn aspects gets the unaspected reading once', () => {
  const N = require('../saturn-v2/narrative.js');
  const chart = C.calculate({ ...base, date: '1966-06-01' }, astronomy);
  assert.equal(chart.aspects.length, 0);
  const reading = C.reading(chart);
  assert.ok(N.unaspected.natal.includes(reading.unaspected));
  assert.match(reading.aspectNote, /No planet/);
  assert.equal(C.reading(C.calculate(base, astronomy)).unaspected, '');
  assert.equal(C.reading(C.calculate({ ...base, date: '1966-06-01', type: 'event' }, astronomy)).unaspected, N.unaspected.event);
});

test('View saved charts opens a dialog and does not reset the current chart', () => {
  const read = file => require('node:fs').readFileSync(require('node:path').join(__dirname, '../saturn-v2', file), 'utf8');
  const app = read('app.js');
  assert.match(app, /'#view-saved-charts'\)\.addEventListener\('click', showSavedChartsDialog\)/);
  assert.match(read('index.html'), /id="saved-charts-dialog"/);
  const dialogFn = app.slice(app.indexOf('function showSavedChartsDialog'), app.indexOf('function enter()'));
  assert.doesNotMatch(dialogFn, /chart = null|enter\(\)|setScreen/);
});

test('opening a saved chart warns before replacing an unsaved chart', () => {
  const app = require('node:fs').readFileSync(require('node:path').join(__dirname, '../saturn-v2/app.js'), 'utf8');
  const warnAt = app.indexOf("!open.hasAttribute('data-confirmed') && !isCurrentChartIn(current)");
  const replaceAt = app.indexOf('chart = C.calculate(input, window.Astronomy);', app.indexOf('function renderSavedCharts'));
  assert.ok(warnAt > 0 && warnAt < replaceAt, 'warning check must run before the chart is replaced');
});

test('Start another chart goes through the unsaved-chart check', () => {
  const read = file => require('node:fs').readFileSync(require('node:path').join(__dirname, '../saturn-v2', file), 'utf8');
  assert.match(read('app.js'), /'#new-chart'\)\.addEventListener\('click', startAnotherChart\)/);
  assert.match(read('index.html'), /id="new-chart-dialog"/);
});
