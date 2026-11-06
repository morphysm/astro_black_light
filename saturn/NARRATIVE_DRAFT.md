# SATURN — narrative rewrite draft (v0.2, 5 Nov 2026)

Status: proposal only. Nothing here is wired into `core.js` / `app.js` yet.
Replaces the current advice-style copy ("Leave room to pause", "Rest makes practice sustainable").

## Voice rules

1. Declare, do not advise. No imperatives telling the reader to rest, pause, review, honor or release.
2. No reassurance. No "this does not require a crisis", no "an honest one", no softening second clause.
3. No Christian frame: no sin, guilt-as-debt, grace, redemption, salvation, judgment, devil, angel, heaven/hell, resurrection, sacrifice-as-virtue, confession, "Saturn asks".
4. Imagery comes from the built world: concrete, lead, wall, corridor, file, permit, checkpoint, ward, ration, archive, frost, housing block.
5. Rebirth is described Morphystically: a pattern that dissolves and re-forms in the flow (the hexagon), not a soul that is saved.
6. Symbolic tendency only. No diagnosis, no biography, no event or death-date claims.

## Entrance

- Overline: `A READING UNDER ONE PLANET` (was "A reading devoted to one planet" — "devoted" is devotional language).
- Line: keep **"Time gives form to what it takes away."**
- Button: `Enter` (shorter, colder).

## Natal sign texts (weight / structure / endurance)

| Sign | Weight | Structure | Endurance |
| --- | --- | --- | --- |
| Aries | The first move is taxed. Every start is made against something already pushing back, and the force spent there is not refunded. | The wall is built from refused impulses. What is not allowed to burn is stacked, brick by brick, into discipline. | Time does not reward the charge. It records what was left standing after it. |
| Taurus | What is held also holds. Ownership carries the weight of lead in the pocket. | Fences, reserves, the locked cupboard. The structure is a guard post around what might be taken. | Erosion is the method. What lasts is not what was defended but what the defence could not reach. |
| Gemini | Words arrive already censored. The sentence is checked at the border before it may cross. | A grammar of permits: what may be said, to whom, in what order. The mind keeps its own registry. | Over years the ledger of unsaid things grows longer than the ledger of spoken ones. Both are kept. |
| Cancer | The home is the first institution. Its rules were written before they could be read. | Walls inherited, not chosen. The family arrangement stands like a housing block: shared, cold, permanent. | The past is not left. It is walked through, room by room, until the rooms are known and no longer obeyed. |
| Leo | Light is rationed. To be seen costs something, and an unseen office checks the account. | The stage is poured concrete. Whatever is shown must carry weight without applause. | The face hardens before the self does. Authority arrives late and without ceremony. |
| Virgo | Fault is found before the work is finished. The inspector lives inside the hand. | Procedure, checklist, correct order. A ward kept spotless so that nothing can be blamed. | Repetition wears a groove. In time the groove is the skill, and the fear that cut it is no longer needed. |
| Libra | Every agreement carries a hidden tariff. Someone pays it; the receipt is rarely shown. | Contracts, treaties, the measured distance between two people. Balance is enforced, not felt. | Old terms expire whether or not they are renegotiated. Silence is also a signature. |
| Scorpio | Trust is surveilled. Closeness is let in only after it has been searched. | Sealed rooms, kept files, the archive under the floor. Control is the architecture of what was once exposed. | What is buried does not decay quickly. It waits for the slow pressure that turns it into something else. |
| Sagittarius | Belief is a border with guards. Freedom of thought is issued as a permit and revoked without notice. | Doctrine poured into a mould. A principle becomes a building, and the building outlives the principle. | The horizon recedes at the speed of approach. The distance does not close. |
| Capricorn | Saturn is at home here, and the home is a ministry. Duty fills every hour that is not locked. | Hierarchy, ladder, a fixed position in the block. Structure is not a refuge; it is the climate. | Achievement is measured in years of standing in the cold. What remains is what never needed warmth. |
| Aquarius | The collective is a second skin that does not fit. Belonging is assigned, not given. | Plans drawn for everyone, inhabited by no one. The system runs; the individual is a number on the door. | The utopia ages into an institution. Someone maintains the machinery after the revolution leaves. |
| Pisces | Boundaries dissolve and the flood finds every crack. Limit is the dam built while drowning. | The isolation ward, the shoreline, the sealed window. Form is the narrow shape given to what has no edge. | The tide returns. What endures is not the wall but the line where the wall once stood. |

## Event / project sign texts

| Sign | Weight | Structure | Endurance |
| --- | --- | --- | --- |
| Aries | The project starts at a cost it cannot recover. Early force is spent against resistance already in place. | Its frame is built from what had to be refused to begin. | It is judged by what still stands after the opening push. |
| Taurus | Its resources become the thing it guards. | Reserves, locks, inventories. The structure protects holdings before purpose. | It lasts where change cannot reach it, and erodes where it can. |
| Gemini | Every statement it makes passes inspection first. | Terms, records, minutes. It runs on documentation. | Its archive of unspoken decisions grows faster than its public one. |
| Cancer | The group it shelters becomes its obligation. | Shared rooms, uneven loads, inherited arrangements. | Its founding arrangement outlives the people who made it. |
| Leo | Visibility is rationed and costly. | It must carry weight without recognition. | Its authority, if it comes, comes late. |
| Virgo | Correction precedes completion. | Procedure governs it. | Repetition becomes its competence. |
| Libra | Its agreements hide a tariff someone pays. | Contracts and measured distances hold it together. | Its terms expire, renegotiated or not. |
| Scorpio | Access is controlled; trust is searched. | Sealed files, restricted rooms. | What it buries works on it slowly. |
| Sagittarius | Its principle has guards. | Doctrine hardens into structure. | Its horizon recedes as it advances. |
| Capricorn | Duty fills its calendar. | Hierarchy is its climate. | It is measured in years of cold standing. |
| Aquarius | Its collective rules sit badly on individuals. | Systems for everyone, inhabited by no one. | It ages into an institution that needs maintenance. |
| Pisces | Its edges leak. | Boundaries are improvised against overflow. | What remains is the outline of its walls. |

## Aspect language

`{theme}` = existing `planetThemes` values. Square keeps two variants.

- conjunction: `Saturn sits on {theme}. The two are welded; one does not move without the other's permit.`
- sextile: `A narrow passage runs between restraint and {theme}. It opens under deliberate effort and closes without it.`
- square (a): `Saturn stands across the path of {theme}. The friction does not resolve; it is worked, like a quarry.`
- square (b): `{theme} meets a checkpoint. Papers are demanded every time it tries to pass.` (needs capitalisation in code)
- trine: `Restraint and {theme} share a load-bearing wall. It holds quietly, and the quiet is easily mistaken for ease.`
- opposition: `Saturn faces {theme} across a guarded line. Each side watches the other; neither gives ground.`

## Saturn returns

- Intro (replaces "...they do not require a crisis"): `Every 29 years Saturn reaches the place it held at the start. What was built in the meantime is audited.`
- Prompt (replaces "What still deserves your effort?..."): `What has been kept only because it was never inspected?`
- Cycle reflection (replaces "what still deserves your commitment?..."): `The structure is checked against the time it has cost.`

## Removing Christian symbolism — source/UI changes

| Where | Now | Proposal |
| --- | --- | --- |
| `app.js` ~547–551, "Weight" section | Lilly, *Christian Astrology*, shown inside the reading | Move to Method/sources only, or replace with a pre-Christian source (Ptolemy, *Tetrabiblos*; Vettius Valens). Must be source-checked before use. |
| `app.js` ~583 | Liz Greene, *A New Look at an Old Devil* | Drop from the reading view; keep only in `EDITORIAL_REVIEW.md` if wanted. |
| `index.html` ~34 | Biblical Archaeology Society link | Remove; the Oxford and Philo links already support the sentence. |
| `app.js` ~133, GDD | "devoted", "devotional" | "under", "austere". |
| GDD working title | "Kabah of Black Light" | Not Christian, but Kaaba is a living sacred site (Islam). Flag for creator decision. |
