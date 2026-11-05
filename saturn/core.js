/* Saturn chart adapter and original editorial prototype. */
(function (root) {
  'use strict';

  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signGlyphs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const glyphs = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇'];
  const aspectRules = [
    ['conjunction', 0, 7], ['sextile', 60, 4], ['square', 90, 6],
    ['trine', 120, 6], ['opposition', 180, 7]
  ];
  const norm = value => ((value % 360) + 360) % 360;
  const separation = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const signedDelta = (a, b) => ((a - b + 540) % 360) - 180;
  const signIndex = longitude => Math.floor(norm(longitude) / 30);
  const localParts = (ms, zone) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date(ms));
    return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  };

  function resolveLocal(date, time, zone) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Enter a valid local date and time.');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const nominal = Date.UTC(year, month - 1, day, hour, minute);
    if (new Date(nominal).toISOString().slice(0, 10) !== date || hour > 23 || minute > 59) throw new Error('That date or time is not valid.');
    const offsets = new Set();
    for (let delta = -48; delta <= 48; delta += 6) {
      const instant = nominal + delta * 3600000;
      const local = localParts(instant, zone);
      offsets.add(Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute) - instant);
    }
    return [...offsets].map(offset => nominal - offset).filter(instant => {
      const local = localParts(instant, zone);
      return local.year === year && local.month === month && local.day === day && local.hour === hour && local.minute === minute;
    }).sort((a, b) => a - b);
  }

  function firstInstantOfDate(date, zone) {
    for (let minute = 0; minute <= 180; minute++) {
      const candidate = `${date}T${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      const matches = resolveLocal(date, candidate.slice(11), zone);
      if (matches.length) return matches[0];
    }
    throw new Error('No local time exists on this date in the selected time zone. Check the date and place.');
  }

  function interval(input) {
    const inputYear = Number(String(input.date).slice(0, 4));
    if (!Number.isInteger(inputYear) || inputYear < 1900 || inputYear > 2100) throw new Error('This prototype supports dates from 1900 through 2100.');
    let center;
    let candidates = [];
    if (input.precision === 'unknown') {
      const start = firstInstantOfDate(input.date, input.zone);
      const nextDate = new Date(Date.parse(`${input.date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
      const end = firstInstantOfDate(nextDate, input.zone);
      if (end <= start) throw new Error('The local date has no usable time interval in this time zone.');
      return { center: (start + end) / 2, start, end, candidates: [] };
    }

    candidates = resolveLocal(input.date, input.time, input.zone);
    if (!candidates.length) throw new Error('This local time does not exist, possibly because of a daylight-saving clock change. Correct the time.');
    if (candidates.length > 1 && !input.fold) {
      const error = new Error('This local time occurs twice during a clock change. Choose the earlier or later occurrence.');
      error.code = 'AMBIGUOUS_TIME';
      error.candidates = candidates;
      throw error;
    }
    center = candidates[input.fold === 'later' ? candidates.length - 1 : 0];
    if (input.precision === 'exact') return { center, start: center, end: center, candidates };
    const uncertainty = Number(input.uncertainty);
    if (!Number.isFinite(uncertainty) || uncertainty < 1 || uncertainty > 360) throw new Error('Choose a time range from 1 to 360 minutes.');
    const spread = uncertainty * 60000;
    return { center, start: center - spread, end: center + spread, candidates };
  }

  function longitude(body, instant, astronomy) {
    return norm(astronomy.Ecliptic(astronomy.GeoVector(body, new Date(instant), true)).elon);
  }

  function speedPerDay(instant, astronomy) {
    const before = longitude('Saturn', instant - 86400000, astronomy);
    const after = longitude('Saturn', instant + 86400000, astronomy);
    return ((after - before + 540) % 360 - 180) / 2;
  }

  function closestAspect(a, b) {
    const angle = separation(a, b);
    for (const [name, target, orbLimit] of aspectRules) {
      const orb = Math.abs(angle - target);
      if (orb <= orbLimit) return { name, angle, orb, limit: orbLimit };
    }
    return null;
  }

  function calculate(input, astronomy) {
    const span = interval(input);
    const uncertain = input.precision !== 'exact';
    const times = uncertain
      ? Array.from({ length: 97 }, (_, i) => span.start + (span.end - span.start) * i / 96)
      : [span.center];
    const centerPositions = Object.fromEntries(bodies.map(body => [body, longitude(body, span.center, astronomy)]));
    const samplePositions = times.map(instant => Object.fromEntries(bodies.map(body => [body, longitude(body, instant, astronomy)])));
    const saturnLongitude = centerPositions.Saturn;
    const signSamples = new Set(samplePositions.map(position => signIndex(position.Saturn)));
    const longitudeOffsets = samplePositions.map(position => signedDelta(position.Saturn, saturnLongitude));
    const motionSamples = times.map(instant => speedPerDay(instant, astronomy));
    const motionKinds = new Set(motionSamples.map(speed => speed < -0.0001 ? 'retrograde' : speed > 0.0001 ? 'direct' : 'stationary'));
    const stableSign = signSamples.size === 1;
    const saturn = {
      id: 'saturn:position', name: 'Saturn', glyph: '♄', longitude: saturnLongitude,
      sign: signIndex(saturnLongitude), stableSign, signs: [...signSamples],
      degree: saturnLongitude % 30, speed: speedPerDay(span.center, astronomy),
      motion: motionKinds.size === 1 ? [...motionKinds][0] : 'uncertain', stableMotion: motionKinds.size === 1,
      range: Math.max(...samplePositions.map(position => separation(position.Saturn, saturnLongitude))),
      longitudeOffsetRange: [Math.min(...longitudeOffsets), Math.max(...longitudeOffsets)]
    };

    const aspects = [];
    const uncertainAspects = [];
    for (const body of bodies.filter(name => name !== 'Saturn')) {
      const foundAtSamples = samplePositions.map(position => closestAspect(position.Saturn, position[body]));
      const identities = new Set(foundAtSamples.map(found => found ? found.name : 'none'));
      const first = foundAtSamples[0];
      const allMatch = Boolean(first) && foundAtSamples.every(found => found && found.name === first.name);
      if (allMatch) {
        const centralAngle = separation(saturnLongitude, centerPositions[body]);
        aspects.push({
          id: `saturn:aspect:${body}:${first.name}`, body, glyph: glyphs[bodies.indexOf(body)],
          name: first.name, angle: centralAngle, orb: Math.abs(centralAngle - aspectRules.find(rule => rule[0] === first.name)[1]),
          limit: first.limit, longitude: centerPositions[body]
        });
      } else if (foundAtSamples.some(Boolean) || identities.size > 1) {
        const names = [...new Set(foundAtSamples.filter(Boolean).map(found => found.name))];
        uncertainAspects.push({ body, possible: names, id: `saturn:aspect:${body}:uncertain` });
      }
    }

    return {
      input: { ...input }, span, saturn, aspects: aspects.sort((a, b) => a.orb - b.orb),
      uncertainAspects, planets: bodies.map((name, i) => ({
        id: `planet:${name}`, name, glyph: glyphs[i], longitude: centerPositions[name], sign: signIndex(centerPositions[name])
      })),
      method: {
        zodiac: 'Tropical', position: 'Apparent geocentric ecliptic longitude of date',
        ephemeris: 'Astronomy Engine, vendored MIT release',
        aspectRules: aspectRules.map(([name, angle, orb]) => ({ name, angle, orb })),
        houses: 'Not calculated or displayed',
        sensitivity: uncertain ? '97 samples across the declared time interval. Sign, motion and aspects are included only when stable at every sample.' : 'Exact time as entered; local time resolved with the browser time-zone database.'
      }
    };
  }

  function findReturnRoots(target, expected, astronomy) {
    const day = 86400000;
    const step = 2 * day;
    const halfWindow = 560 * day;
    const start = expected - halfWindow;
    const end = expected + halfWindow;
    const deltaAt = instant => signedDelta(longitude('Saturn', instant, astronomy), target);
    const roots = [];
    let previousTime = start;
    let previousDelta = deltaAt(previousTime);

    for (let instant = start + step; instant <= end; instant += step) {
      const currentTime = Math.min(instant, end);
      const currentDelta = deltaAt(currentTime);
      const crossedZero = previousDelta === 0 || currentDelta === 0 || previousDelta * currentDelta < 0;
      if (crossedZero && Math.abs(currentDelta - previousDelta) < 0.5) {
        let left = previousTime;
        let right = currentTime;
        let leftDelta = previousDelta;
        if (leftDelta === 0) {
          right = left;
        } else if (currentDelta === 0) {
          left = right;
        } else {
          for (let iteration = 0; iteration < 42 && right - left > 1000; iteration++) {
            const middle = (left + right) / 2;
            const middleDelta = deltaAt(middle);
            if (middleDelta === 0) {
              left = middle;
              right = middle;
              break;
            }
            if (leftDelta * middleDelta <= 0) right = middle;
            else {
              left = middle;
              leftDelta = middleDelta;
            }
          }
        }
        const root = (left + right) / 2;
        if (!roots.some(existing => Math.abs(existing - root) < 3600000)) roots.push(root);
      }
      previousTime = currentTime;
      previousDelta = currentDelta;
    }
    return roots.sort((a, b) => a - b);
  }

  function calculateReturns(chart, astronomy) {
    const day = 86400000;
    const tropicalYear = 365.2425 * day;
    const approximatePeriod = 29.4 * tropicalYear;
    const offsets = chart.saturn.longitudeOffsetRange || [0, 0];
    const targets = [...new Set([norm(chart.saturn.longitude + offsets[0]), chart.saturn.longitude, norm(chart.saturn.longitude + offsets[1])])];
    const cycles = [];

    for (let number = 1; number <= 3; number++) {
      const expected = chart.span.center + number * approximatePeriod;
      const roots = new Map(targets.map(target => [target, findReturnRoots(target, expected, astronomy)]));
      const centerRoots = roots.get(chart.saturn.longitude) || [];
      const lowerRoots = roots.get(norm(chart.saturn.longitude + offsets[0])) || centerRoots;
      const upperRoots = roots.get(norm(chart.saturn.longitude + offsets[1])) || centerRoots;
      const countStable = lowerRoots.length === centerRoots.length && upperRoots.length === centerRoots.length;
      const contacts = centerRoots.map(instant => {
        const nearest = list => list.reduce((best, value) => best === null || Math.abs(value - instant) < Math.abs(best - instant) ? value : best, null);
        const lower = nearest(lowerRoots);
        const upper = nearest(upperRoots);
        const withinSamePass = lower !== null && upper !== null && Math.abs(lower - instant) < 180 * day && Math.abs(upper - instant) < 180 * day;
        const sensitivityStable = countStable && withinSamePass;
        return {
          instant,
          sensitivityStable,
          rangeStart: sensitivityStable ? Math.min(instant, lower, upper) : null,
          rangeEnd: sensitivityStable ? Math.max(instant, lower, upper) : null,
          id: `saturn:return:${number}:${new Date(instant).toISOString().slice(0, 10)}`
        };
      });
      cycles.push({ number, expected, contacts });
    }

    return {
      cycles,
      method: {
        target: 'Transiting apparent geocentric tropical ecliptic longitude equals the chart’s calculated natal Saturn longitude.',
        search: 'The approximate 29.4-year period only centers each search window. Two-day samples identify candidate crossings; bisection refines each exact longitude crossing. Retrograde re-crossings are retained.',
        uncertainty: chart.input.precision === 'exact'
          ? 'Exact chart time as entered.'
          : 'The midpoint longitude is used for listed contacts. Date sensitivity is estimated by solving at the minimum and maximum sampled natal Saturn longitudes; the sample interval is not a continuous proof.',
        verification: 'Prototype calculation; independent reference comparison is pending.'
      }
    };
  }

  const signReadings = [
    {
        "weight": "Urgency can spend strength too soon. Choose what deserves the effort.",
        "structure": "Begin with one clear commitment. Leave room to pause.",
        "endurance": "Continue after enthusiasm fades. Change direction when effort stops helping."
    },
    {
        "weight": "Security can become a reason to hold too tightly. Name what actually needs protecting.",
        "structure": "Keep a useful reserve. Let unused things leave.",
        "endurance": "Steadiness allows change. Review what habit has made untouchable."
    },
    {
        "weight": "Too many explanations can delay a decision. Find the question that matters.",
        "structure": "Set clear terms. Say what is known and what remains uncertain.",
        "endurance": "Revise an idea when evidence changes. Careful thought can still reach a conclusion."
    },
    {
        "weight": "Care can become an obligation without limits. Notice who carries the load.",
        "structure": "Make room for care and for rest. Share the work of keeping a home or group together.",
        "endurance": "Honor the past without repeating every arrangement. Present needs deserve attention."
    },
    {
        "weight": "Recognition can make every effort feel like a performance. Give the work a purpose beyond approval.",
        "structure": "Create something that can stand without constant applause. Accept responsibility for what is shown.",
        "endurance": "Allow the role to change. Authority can admit uncertainty."
    },
    {
        "weight": "Correction can postpone completion. Decide what the task actually requires.",
        "structure": "Set a workable standard. Finish, then review.",
        "endurance": "Practice builds skill. Rest makes practice sustainable."
    },
    {
        "weight": "An agreement can look fair while one side carries its cost. Make the terms visible.",
        "structure": "State the limit before resentment speaks for it. Leave room for disagreement.",
        "endurance": "Renew agreements when conditions change. Consent once given is not a permanent obligation."
    },
    {
        "weight": "Control can grow where trust is uncertain. Ask what information or agreement is missing.",
        "structure": "Protect privacy without making every matter a secret. Define shared responsibilities.",
        "endurance": "Allow difficult changes time. Inspect the grip that once offered protection."
    },
    {
        "weight": "Conviction carries consequences. Check what a belief asks others to bear.",
        "structure": "Put one principle into daily practice. Name its limits.",
        "endurance": "Let experience revise the map. A changed belief can still be an honest one."
    },
    {
        "weight": "Duty can fill every available hour. Distinguish necessary work from the need to prove worth.",
        "structure": "Assign responsibility in proportion to capacity. Include maintenance and rest.",
        "endurance": "Review what achievement has cost. Keep the structures that support continued life and work."
    },
    {
        "weight": "Independence and belonging can pull apart. Name the commitment each requires.",
        "structure": "Give shared rules a clear purpose. Make room for dissent and accountability.",
        "endurance": "A new system needs maintenance. Stay involved after the first change."
    },
    {
        "weight": "Care without limits can exhaust its source. Notice where attention becomes overextension.",
        "structure": "Give feeling a practical boundary: a time, a place, a clear promise.",
        "endurance": "Return to unfinished work patiently. Accept what cannot be forced into resolution."
    }
];

  // Event readings address the work or occasion rather than a person's traits.
  const eventSignReadings = [
    ['A rushed start can exhaust the resources available.', 'Set a clear objective and allow time for pauses.', 'Review the pace as the work develops.'],
    ['Protecting resources can become resistance to necessary change.', 'Set a practical reserve and decide what it is for.', 'Revisit assumptions about security as conditions change.'],
    ['Too many options can delay a decision.', 'Record the terms, evidence and open questions.', 'Revise the plan when new information warrants it.'],
    ['Care for the group can become an uneven workload.', 'Share responsibilities and make room for rest.', 'Revisit arrangements as the group’s needs change.'],
    ['Visibility can pull attention away from the work itself.', 'Give the project a purpose beyond recognition.', 'Allow roles and expectations to change.'],
    ['Repeated correction can delay completion.', 'Agree on a workable standard and a point of completion.', 'Reserve time for review without making it endless.'],
    ['An agreement may conceal an uneven share of the cost.', 'Make terms and responsibilities explicit.', 'Renew agreements when circumstances change.'],
    ['Uncertainty can encourage excessive control.', 'Clarify access, privacy and shared responsibilities.', 'Review restrictions as trust and conditions change.'],
    ['A guiding principle can have costs that are easy to overlook.', 'Translate the principle into a practical commitment.', 'Let experience revise the plan.'],
    ['Work can expand beyond the capacity available.', 'Assign responsibilities with time for maintenance and rest.', 'Review whether the structure still supports the work.'],
    ['Shared rules and independence can pull in different directions.', 'Give each rule a clear purpose and allow dissent.', 'Plan for maintenance after the initial change.'],
    ['Open-ended care or ambition can overextend resources.', 'Set a practical boundary for the work and its commitments.', 'Allow unresolved matters time without abandoning the plan.']
  ].map(([weight, structure, endurance]) => ({ weight, structure, endurance }));

  const planetThemes = {
    Sun: 'recognition', Moon: 'security', Mercury: 'communication', Venus: 'affection and values',
    Mars: 'action', Jupiter: 'growth', Uranus: 'independence', Neptune: 'ideals', Pluto: 'power'
  };
  const aspectLanguage = {
    conjunction: 'Duty and {theme} meet closely. Ask where one has become a condition for the other.',
    sextile: 'There is room to connect discipline with {theme}. Give that possibility a practical use.',
    square: ['Duty presses against {theme}. Name both demands before deciding what can change.', 'Friction between responsibility and {theme} calls for a workable limit. Consider what each requires.'],
    trine: 'Discipline can support {theme}. Use the available support deliberately.',
    opposition: 'Duty and {theme} pull in different directions. Give each a clear place and limit.'
  };

  function reading(chart) {
    const saturn = chart.saturn;
    const sign = signs[saturn.sign];
    const context = chart.input.type === 'event' ? 'This event chart' : 'This natal chart';
    const factorIds = [saturn.id];
    const entryIds = ['SATURN-CORE-EDITORIAL-v0.1', 'TRAD-SATURN-GENERAL-LILLY-HOULDING-v0.1'];
    const aspects = chart.aspects.map(aspect => {
      factorIds.push(aspect.id);
      entryIds.push(`SATURN-ASPECT-${aspect.name.toUpperCase()}-EDITORIAL-v0.1`);
      const language = aspectLanguage[aspect.name];
      const template = Array.isArray(language) ? language[Object.keys(planetThemes).indexOf(aspect.body) % language.length] : language;
      const text = (chart.input.type === 'event' ? 'For this event or project: ' : '') + template.replace('{theme}', planetThemes[aspect.body]);
      return { ...aspect, title: `${aspect.body} ${aspect.name} Saturn`, text, factorIds: [aspect.id] };
    });
    const unstableNote = saturn.stableSign ? '' : `The stated time range crosses ${saturn.signs.map(index => signs[index]).join(' and ')}. The wheel marks its midpoint only; sign-specific interpretation is withheld.`;
    const motionText = saturn.motion === 'uncertain' ? 'Motion changes across the time range.' : `Motion: ${saturn.motion}.`;
    const placement = saturn.stableSign
      ? `${context}: Saturn in ${sign}. ${motionText}`
      : unstableNote;
    const prose = saturn.stableSign ? (chart.input.type === 'event' ? eventSignReadings : signReadings)[saturn.sign] : null;
    return {
      placement,
      weight: prose ? prose.weight : 'The interval does not support a sign-specific reading. The calculated Saturn position remains available for inspection, while this interpretation waits for a stable factor.',
      structure: prose ? prose.structure : 'No sign-based interpretation is assigned across an interval that changes Saturn’s sign.',
      endurance: prose ? prose.endurance : 'Choose an exact or narrower time range only if you have a reliable basis for doing so. Unknown data should remain unknown.',
      aspects,
      aspectNote: aspects.length
        ? 'Only Saturn aspects that remain inside the stated orb at every sampled time are interpreted.'
        : 'No Saturn aspect met the prototype’s defined orb at every sampled time. This does not mean the planets have no relationship in another interpretive system.',
      uncertainAspects: chart.uncertainAspects,
      uncertainty: unstableNote,
      factorIds: [...new Set(factorIds)],
      entryIds: [...new Set(entryIds)],
      status: 'Original sign/aspect draft · further source review pending'
    };
  }

  const api = { signs, signGlyphs, bodies, glyphs, aspectRules, resolveLocal, interval, calculate, calculateReturns, reading, separation, norm };
  if (typeof module !== 'undefined') module.exports = api;
  root.SaturnCore = api;
})(globalThis);
