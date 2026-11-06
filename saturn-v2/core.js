/* Saturn chart adapter and original editorial prototype — v2 (narrative v0.3 in narrative.js, House of Death). */
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

  function findReturnRoots(target, expected, astronomy, halfWindowDays = 560) {
    const day = 86400000;
    const step = 2 * day;
    const halfWindow = halfWindowDays * day;
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

  // Narrative v0.3 lives in narrative.js (decans, two variants per natal text).
  const N = typeof module !== 'undefined' && module.exports ? require('./narrative.js') : root.SaturnNarrative;
  const { motionLines, planetThemes, planetImages, eventPlanetImages, aspectLanguage, returnAudits } = N;

  function seededRandom(seed) {
    let state = seed >>> 0 || 1;
    return () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Decan = which third of the sign Saturn occupies (0–10°, 10–20°, 20–30°). Uses the midpoint longitude.
  function decanOf(longitude) {
    return Math.min(2, Math.floor((norm(longitude) % 30) / 10));
  }

  function signProse(chart) {
    const saturn = chart.saturn;
    const decan = decanOf(saturn.longitude);
    if (chart.input.type === 'event') {
      const [opening, weight, structure, endurance] = N.event[saturn.sign][decan];
      return { decan, opening, weight, structure, endurance };
    }
    const lines = N.natal[saturn.sign][decan];
    const random = seededRandom(chartSeed(chart) ^ 0x5A7E12);
    const pick = index => lines[index * 2 + (random() < 0.5 ? 0 : 1)];
    return { decan, opening: pick(0), weight: pick(1), structure: pick(2), endurance: pick(3) };
  }

  function reading(chart) {
    const saturn = chart.saturn;
    const sign = signs[saturn.sign];
    const event = chart.input.type === 'event';
    const context = event ? 'This event chart' : 'This natal chart';
    const factorIds = [saturn.id];
    const entryIds = ['SATURN-CORE-EDITORIAL-v0.3'];
    const aspects = chart.aspects.map(aspect => {
      factorIds.push(aspect.id);
      entryIds.push(`SATURN-ASPECT-${aspect.name.toUpperCase()}-EDITORIAL-v0.3`);
      const language = aspectLanguage[aspect.name];
      const template = Array.isArray(language) ? language[Object.keys(planetThemes).indexOf(aspect.body) % language.length] : language;
      const image = (event ? eventPlanetImages : planetImages)[aspect.body];
      const text = (event ? 'For this event or project: ' : '') + template.replace('{theme}', planetThemes[aspect.body]) + ' ' + image;
      return { ...aspect, title: `${aspect.body} ${aspect.name} Saturn`, text, factorIds: [aspect.id] };
    });
    const unstableNote = saturn.stableSign ? '' : `The stated time range crosses ${saturn.signs.map(index => signs[index]).join(' and ')}. The wheel marks its midpoint only; sign-specific interpretation is withheld.`;
    const motionText = saturn.motion === 'uncertain' ? 'Motion changes across the time range.' : `Motion: ${saturn.motion}.`;
    const placement = saturn.stableSign ? `${context}: Saturn in ${sign}. ${motionText}` : unstableNote;
    const prose = saturn.stableSign ? signProse(chart) : null;
    return {
      placement,
      opening: prose ? prose.opening : '',
      motionLine: motionLines[saturn.motion] || '',
      weight: prose ? prose.weight : 'The interval does not support a sign-specific reading. The calculated position stays on file; the interpretation waits for a stable factor.',
      structure: prose ? prose.structure : 'No sign-based interpretation is assigned across an interval that changes Saturn’s sign.',
      endurance: prose ? prose.endurance : 'Unknown data stays unknown. Narrow the time range only if there is a reliable basis for it.',
      aspects,
      aspectNote: aspects.length
        ? (chart.input.precision === 'exact' ? 'Major aspects to Saturn within the set orbs.' : 'Only Saturn aspects that stay inside the set orb at every sampled time are read.')
        : (chart.input.precision === 'exact' ? 'No planet is within the set orb of a major aspect to Saturn.' : 'No planet stays within the set orb of a major aspect to Saturn across the whole time range.'),
      unaspected: aspects.length ? '' : (event ? N.unaspected.event : N.unaspected.natal[seededRandom(chartSeed(chart) ^ 0x0A5E17)() < 0.5 ? 0 : 1]),
      uncertainAspects: chart.uncertainAspects,
      uncertainty: unstableNote,
      returnAudits,
      factorIds: [...new Set(factorIds)],
      entryIds: [...new Set(entryIds)],
      status: 'Editorial draft v0.3 · source and astrologer review pending'
    };
  }

  // House of Death epigraphs. Public-domain authors only; translations are editorial.
  // Each chart draws one per slot from a seed built on its own input, so the same chart
  // always opens the same house and different charts open different ones.
  const epigraphPools = {
    door: [
      { author: 'Poe', text: 'Deep into that darkness peering, long I stood there wondering, fearing,', source: 'Edgar Allan Poe, “The Raven”' },
      { author: 'Lovecraft', text: 'The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown.', source: 'H. P. Lovecraft, “Supernatural Horror in Literature”' },
      { author: 'Lautréamont', text: 'Il n’est pas bon que tout le monde lise les pages qui vont suivre ; quelques-uns seuls savoureront ce fruit amer sans danger.', lang: 'fr', translation: 'It is not good that everyone should read the pages that follow; only a few will taste this bitter fruit without danger.', source: 'Lautréamont, Les Chants de Maldoror' },
      { author: 'Nerval', text: 'Le Rêve est une seconde vie. Je n’ai pu percer sans frémir ces portes d’ivoire ou de corne qui nous séparent du monde invisible.', lang: 'fr', translation: 'Dream is a second life. I have never passed without shuddering through those gates of ivory or horn that separate us from the invisible world.', source: 'Gérard de Nerval, Aurélia' },
      { author: 'Baudelaire', text: 'Le Temps m’engloutit minute par minute,\nComme la neige immense un corps pris de roideur ;', lang: 'fr', translation: 'Time swallows me minute by minute, as the immense snow swallows a body gone stiff.', source: 'Charles Baudelaire, “Le Goût du néant”' }
    ],
    threshold: [
      { author: 'Baudelaire', text: 'Souviens-toi que le Temps est un joueur avide\nQui gagne sans tricher, à tout coup ! c’est la loi.', lang: 'fr', translation: 'Remember: Time is a greedy gambler who wins without cheating, every throw. That is the law.', source: 'Charles Baudelaire, “L’Horloge”' },
      { author: 'Poe', text: 'The boundaries which divide Life from Death are at best shadowy and vague. Who shall say where the one ends, and where the other begins?', source: 'Edgar Allan Poe, “The Premature Burial”' },
      { author: 'Lovecraft', text: 'We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far.', source: 'H. P. Lovecraft, “The Call of Cthulhu”' },
      { author: 'Radiguet', text: 'Je vais encourir bien des reproches. Mais qu’y puis-je ?', lang: 'fr', translation: 'I am going to incur many reproaches. But what can I do about it?', source: 'Raymond Radiguet, Le Diable au corps' },
      { author: 'Leopardi', text: 'Amaro e noia\nla vita, altro mai nulla; e fango è il mondo.', lang: 'it', translation: 'Bitterness and tedium is life, nothing else ever; and the world is mud.', source: 'Giacomo Leopardi, “A se stesso”' }
    ],
    cell: [
      { author: 'Lovecraft', text: 'Unhappy is he to whom the memories of childhood bring only fear and sadness.', source: 'H. P. Lovecraft, “The Outsider”' },
      { author: 'Poe', text: 'From childhood’s hour I have not been\nAs others were — I have not seen\nAs others saw', source: 'Edgar Allan Poe, “Alone”' },
      { author: 'Baudelaire', text: 'Quand la terre est changée en un cachot humide,\nOù l’Espérance, comme une chauve-souris,\nS’en va battant les murs de son aile timide', lang: 'fr', translation: 'When the earth is changed into a damp cell, where Hope, like a bat, goes beating the walls with its timid wing', source: 'Charles Baudelaire, “Spleen” (LXXVIII)' },
      { author: 'Leopardi', text: 'Sempre caro mi fu quest’ermo colle,\ne questa siepe, che da tanta parte\ndell’ultimo orizzonte il guardo esclude.', lang: 'it', translation: 'Always dear to me was this lonely hill, and this hedge, which shuts the eye out from so much of the last horizon.', source: 'Giacomo Leopardi, “L’infinito”' },
      { author: 'Radiguet', text: 'Est-ce ma faute si j’eus douze ans quelques mois avant la déclaration de la guerre ?', lang: 'fr', translation: 'Is it my fault that I turned twelve a few months before war was declared?', source: 'Raymond Radiguet, Le Diable au corps' }
    ],
    ward: [
      { author: 'Lovecraft', text: 'The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents.', source: 'H. P. Lovecraft, “The Call of Cthulhu”' },
      { author: 'Poe', text: 'I became insane, with long intervals of horrible sanity.', source: 'Edgar Allan Poe, letter to George W. Eveleth, 1848' },
      { author: 'Nerval', text: 'Ici a commencé pour moi ce que j’appellerai l’épanchement du songe dans la vie réelle.', lang: 'fr', translation: 'Here began for me what I will call the overflowing of dream into real life.', source: 'Gérard de Nerval, Aurélia' },
      { author: 'Rimbaud', text: 'Le Poète se fait voyant par un long, immense et raisonné dérèglement de tous les sens.', lang: 'fr', translation: 'The Poet makes himself a seer by a long, immense and reasoned derangement of all the senses.', source: 'Arthur Rimbaud, letter to Paul Demeny, 1871' },
      { author: 'Baudelaire', text: 'Je suis la plaie et le couteau !\nJe suis le soufflet et la joue !\nJe suis les membres et la roue,\nEt la victime et le bourreau !', lang: 'fr', translation: 'I am the wound and the knife! I am the slap and the cheek! I am the limbs and the wheel, the victim and the executioner!', source: 'Charles Baudelaire, “L’Héautontimorouménos”' }
    ],
    demolition: [
      { author: 'Poe', text: 'And Darkness and Decay and the Red Death held illimitable dominion over all.', source: 'Edgar Allan Poe, “The Masque of the Red Death”' },
      { author: 'Poe', text: '…and the deep and dank tarn at my feet closed sullenly and silently over the fragments of the “House of Usher.”', source: 'Edgar Allan Poe, “The Fall of the House of Usher”' },
      { author: 'Baudelaire', text: 'Le vieux Paris n’est plus (la forme d’une ville\nChange plus vite, hélas ! que le cœur d’un mortel) ;', lang: 'fr', translation: 'Old Paris is no more (the form of a city changes faster, alas, than a mortal’s heart).', source: 'Charles Baudelaire, “Le Cygne”' },
      { author: 'Nerval', text: 'Je suis le Ténébreux, — le Veuf, — l’Inconsolé,\nLe Prince d’Aquitaine à la Tour abolie :', lang: 'fr', translation: 'I am the dark one, the widower, the unconsoled, the Prince of Aquitaine whose tower is abolished.', source: 'Gérard de Nerval, “El Desdichado”' },
      { author: 'Trakl', text: 'Am Abend tönen die herbstlichen Wälder\nVon tödlichen Waffen,', lang: 'de', translation: 'At evening the autumn woods resound with deadly weapons,', source: 'Georg Trakl, “Grodek”' },
      { author: 'Rimbaud', text: 'Ô que ma quille éclate ! Ô que j’aille à la mer !', lang: 'fr', translation: 'O let my keel burst! O let me go into the sea!', source: 'Arthur Rimbaud, “Le Bateau ivre”' }
    ],
    reforming: [
      { author: 'Baudelaire', text: 'Que j’ai gardé la forme […]\nDe mes amours décomposés !', lang: 'fr', translation: 'That I have kept the form […] of my decomposed loves.', source: 'Charles Baudelaire, “Une Charogne”' },
      { author: 'Lovecraft', text: 'That is not dead which can eternal lie,\nAnd with strange aeons even death may die.', source: 'H. P. Lovecraft, “The Call of Cthulhu”' },
      { author: 'Rimbaud', text: 'Je est un autre.', lang: 'fr', translation: 'I is another.', source: 'Arthur Rimbaud, letter to Paul Demeny, 1871' },
      { author: 'Radiguet', text: 'L’ordre, à la longue, se met de lui-même autour des choses.', lang: 'fr', translation: 'In the long run, order sets itself around things.', source: 'Raymond Radiguet, Le Diable au corps' },
      { author: 'Poe', text: 'All that we see or seem\nIs but a dream within a dream.', source: 'Edgar Allan Poe, “A Dream Within a Dream”' },
      { author: 'Leopardi', text: 'Così tra questa\nimmensità s’annega il pensier mio:\ne il naufragar m’è dolce in questo mare.', lang: 'it', translation: 'So in this immensity my thought drowns, and shipwreck is sweet to me in this sea.', source: 'Giacomo Leopardi, “L’infinito”' }
    ],
    exit: [
      { author: 'Poe', text: 'That the play is the tragedy, “Man,”\nAnd its hero the Conqueror Worm.', source: 'Edgar Allan Poe, “The Conqueror Worm”' },
      { author: 'Baudelaire', text: 'Ô Mort, vieux capitaine, il est temps ! levons l’ancre !', lang: 'fr', translation: 'O Death, old captain, it is time! Let us weigh anchor!', source: 'Charles Baudelaire, “Le Voyage”' },
      { author: 'Trakl', text: 'Alle Straßen münden in schwarze Verwesung.', lang: 'de', translation: 'All roads empty into black decay.', source: 'Georg Trakl, “Grodek”' },
      { author: 'Nerval', text: 'Ma seule Étoile est morte, — et mon luth constellé\nPorte le Soleil noir de la Mélancolie.', lang: 'fr', translation: 'My only Star is dead, and my star-strewn lute bears the black Sun of Melancholy.', source: 'Gérard de Nerval, “El Desdichado”' },
      { author: 'Rimbaud', text: 'Il a deux trous rouges au côté droit.', lang: 'fr', translation: 'He has two red holes in his right side.', source: 'Arthur Rimbaud, “Le Dormeur du val”' },
      { author: 'Leopardi', text: 'Amaro e noia\nla vita, altro mai nulla; e fango è il mondo.', lang: 'it', translation: 'Bitterness and tedium is life, nothing else ever; and the world is mud.', source: 'Giacomo Leopardi, “A se stesso”' }
    ]
  };
  const epigraphSlots = ['door', 'threshold', 'cell', 'ward', 'demolition', 'reforming', 'exit'];

  function chartSeed(chart) {
    const input = chart.input || {};
    const key = Object.keys(input).sort().map(name => `${name}=${JSON.stringify(input[name])}`).join('|')
      + `|saturn=${chart.saturn ? chart.saturn.longitude.toFixed(4) : ''}`;
    let hash = 2166136261;
    for (let index = 0; index < key.length; index++) {
      hash ^= key.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  // One epigraph per slot; no author or line repeats inside one house while the pools allow it.
  function houseEpigraphs(chart) {
    const random = seededRandom(chartSeed(chart));
    const draw = () => {
      const authors = new Set();
      const texts = new Set();
      const chosen = {};
      let clean = true;
      epigraphSlots.forEach(slot => {
        const pool = epigraphPools[slot].filter(item => !texts.has(item.text));
        const fresh = pool.filter(item => !authors.has(item.author));
        if (!fresh.length) clean = false;
        const options = fresh.length ? fresh : pool;
        const pick = options[Math.floor(random() * options.length)];
        authors.add(pick.author);
        texts.add(pick.text);
        chosen[slot] = pick;
      });
      return { chosen, clean };
    };
    let result = draw();
    for (let attempt = 0; attempt < 40 && !result.clean; attempt++) result = draw();
    const chosen = result.chosen;
    return chosen;
  }

  // House of Death: the four hard angles of transiting Saturn to the chart's own Saturn.
  const houseRooms = [
    {
      id: 'cell', numeral: 'I', title: 'The Cell', theme: 'Lockdown', offset: 90, fraction: 0.25, angle: 'Waxing square · 90°',
      natal: ['Early, the door is fitted. The window is high, the key hangs on the other side, and the child learns the walls by touch.'],
      event: ['The first wall. The project learns the size of its cell.']
    },
    {
      id: 'ward', numeral: 'II', title: 'The Ward', theme: 'Isolation', offset: 180, fraction: 0.5, angle: 'Opposition · 180°',
      natal: ['Halfway round, Saturn stares back at where it began. White corridor, observation glass, a file thickening in another hand. The mind correlates too much and is moved to a quieter room.'],
      event: ['The project faces its own beginning through glass. It is observed, and filed.']
    },
    {
      id: 'demolition', numeral: 'III', title: 'The Demolition', theme: 'Destruction', offset: 270, fraction: 0.75, angle: 'Waning square · 270°',
      natal: ['What was raised in youth comes down in the order it went up: plaster, brick, then the beams that held the face in place. Dust settles on everything that was certain.'],
      event: ['What the project built for its first half comes down. Dust settles on the plans.']
    },
    {
      id: 'reforming', numeral: 'IV', title: 'The Re-forming', theme: 'Rebirth', offset: 0, fraction: 1, angle: 'Return · 360°',
      natal: ['Saturn reaches the place it held at the start. The flesh of the first form has rotted; the form remains and takes new matter. At Saturn’s north pole the hexagon turns inside a storm that never ends.'],
      event: ['Saturn returns to where the project began. The material is gone. The form takes new material.']
    }
  ];

  const houseThreshold = {
    lead: 'Four doors. Saturn opens each in its own hour, and every life is walked through all four.'
  };

  const houseExit = {
    title: 'The corridor continues.',
    text: 'The four doors open again every twenty-nine years, until the material gives out.'
  };

  function calculateHouse(chart, astronomy, cycleCount = 3) {
    const epigraphs = houseEpigraphs(chart);
    const day = 86400000;
    const period = 29.4 * 365.2425 * day;
    return {
      rooms: houseRooms.map(room => {
        const target = norm(chart.saturn.longitude + room.offset);
        const cycles = [];
        for (let index = 0; index < cycleCount; index++) {
          const expected = chart.span.center + (index + room.fraction) * period;
          const contacts = findReturnRoots(target, expected, astronomy, 700).map(instant => ({
            instant,
            id: `saturn:house:${room.id}:${index + 1}:${new Date(instant).toISOString().slice(0, 10)}`
          }));
          cycles.push({ number: index + 1, contacts });
        }
        return { ...room, epigraph: epigraphs[room.id], target, cycles };
      }),
      epigraphs,
      method: 'Each room is a date on which transiting Saturn reaches a fixed angle (90°, 180°, 270°, 360°) from the chart’s calculated Saturn longitude. Same solver as Saturn returns; dates use the interval midpoint for uncertain times.'
    };
  }

  const api = { signs, signGlyphs, bodies, glyphs, aspectRules, resolveLocal, interval, calculate, calculateReturns, calculateHouse, houseEpigraphs, epigraphPools, decanOf, houseRooms, houseThreshold, houseExit, reading, separation, norm };
  if (typeof module !== 'undefined') module.exports = api;
  root.SaturnCore = api;
})(globalThis);
