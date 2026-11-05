const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../saturn/core.js');
const astronomy = require('../saturn/vendor/astronomy.js');
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
