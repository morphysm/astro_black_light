/* Saturn reading texts — narrative v0.3 (decans, heavier voice). Original editorial drafts.
   natal[sign][decan] = [openingA, openingB, weightA, weightB, structureA, structureB, enduranceA, enduranceB]
   event[sign][decan] = [opening, weight, structure, endurance]
   Decans follow the Chaldean order of rulers; the ruler shapes the imagery and is not shown on screen. */
(function (root) {
  'use strict';

  const natal = [
    // Aries — Mars, Sun, Venus
    [
      ['Saturn where the first blow should land. The arm is raised and the order to lower it never comes.', 'A starting pistol rusted shut in a drawer. Every race begins without it.',
        'Force collects in the shoulders and stays there, a weight of unthrown punches.', 'Each start costs blood that is never returned. The veins learn to give it quietly.',
        'Walls built from what was not allowed to burn. Scorch marks on the inside of every brick.', 'A firing range at night, targets riddled, nobody on the line. The shots were fired years ago.',
        'The impulse is kept so long it hardens into bone. The bone aches before rain.', 'What charged first lies in the mud. What stood behind it is still standing, older and lame.'],
      ['Saturn at the head of the column. The first face in the line takes the first shot.', 'A spotlight switched on in an empty yard. It finds a wall, and a figure pressed against it.',
        'To step forward is to be photographed and filed. The photograph is still on record.', 'Every attempt to stand out is answered by a colder light. The skin learns to flinch before it is touched.',
        'A statue begun in youth and abandoned at the shoulders. The rest is raw stone.', 'A narrow balcony above an empty square. Speeches are made to the pigeons and the wind.',
        'Pride survives as posture: the spine straight, the eyes dry, the rest gone.', 'The face that was pushed forward hardens into a mask. Behind it the features go on rotting.'],
      ['Saturn at the door of the first desire. The hand on the latch is frozen there.', 'A red dress hung in a cold wardrobe. The moths found it before anyone else did.',
        'Wanting is a fever kept below the skin. It burns without rising and leaves the body thin.', 'Each approach is met with a slammed door. The knuckles remember the wood.',
        'Rooms rented by the hour and left unused. The sheets yellow on their own.', 'Letters burned in a bucket. The ash is kept in a jar on the shelf.',
        'Desire outlives the bodies it was meant for. It goes on knocking at addresses that no longer exist.', 'The flesh learns patience the way meat learns salt.']
    ],
    // Taurus — Mercury, Moon, Saturn
    [
      ['Saturn in the counting house. The coins are cold and every one of them is listed.', 'A warehouse ledger kept by lamplight. The clerk counts until the numbers outlive the goods.',
        'Possession is a weight in the pockets. It pulls the coat out of shape, and the shoulders with it.', 'Every object is tagged, every tag recorded. The hand cannot touch without counting.',
        'Shelves to the ceiling, stock that never moves. Dust settles in the order of acquisition.', 'A lock on the cupboard, a lock on the drawer, a key on a string around the neck. The string has cut a groove.',
        'The inventory outlasts the warehouse. Somewhere a list still names what rotted long ago.', 'The hoard is counted on the last day too. The numbers come out right; the hands do not.'],
      ['Saturn in the cellar under the house. Jars of preserved fruit, the labels in a dead hand.', 'The larder is full and the house is starving. Nobody is allowed to open it.',
        'Hunger is stored like grain in a damp silo. It sprouts in the dark and spoils.', 'Comfort is weighed on an old scale. The weights were filed down long ago, always against the eater.',
        'Root cellars, sealed tins, a key the size of a hand. Shelter built from things that keep.', 'A farmhouse with the shutters nailed. The livestock was sold; the stalls still smell of it.',
        'The body keeps what it was denied and grows heavy on it. The weight does not leave in sleep.', 'What was saved for later rots in its jar. Later came, and nobody was there to eat.'],
      ['Saturn in its own quarry. Granite cut for a building that will never be raised.', 'A field of stone fenced with barbed wire. Nothing grows; the ownership is beyond dispute.',
        'The body is made of slow matter. Each year a little more of it turns to stone.', 'Holding becomes the only motion. The grip tightens past feeling and stays.',
        'Walls a metre thick around nothing. The vault is built; the treasure was never found.', 'A boundary stone sunk deep in clay. The land around it has changed hands five times.',
        'Stone outlasts the hand that claimed it. Moss writes over the deed.', 'What was hoarded becomes the tomb of the one who hoarded it. Same size, same weight.']
    ],
    // Gemini — Jupiter, Mars, Sun
    [
      ['Saturn at the switchboard of a great ministry. A thousand lines open, every one recorded.', 'A dictionary rewritten each year. Words disappear from it without notice.',
        'Speech is issued in approved forms. The tongue grows heavy with what it may not say.', 'Every sentence is weighed by a committee before it is spoken. Most die in session.',
        'Corridors of filing cabinets, transcripts of conversations nobody remembers having.', 'A loudspeaker on every corner, one voice repeating one statement until it means nothing.',
        'The official version outlives every witness. Only the typewriter ribbons remember the drafts.', 'Words kept from the mouth gather in the throat. The voice comes out lower each year.'],
      ['Saturn under the interrogation lamp. Two chairs, one table, a question repeated until morning.', 'A tongue bitten through to keep a name in. The blood is swallowed with the name.',
        'Every word costs a wound. The mouth learns to stay shut and the jaw learns to ache.', 'Argument turns inward. Two voices in one skull, neither allowed to win.',
        'Soundproofed rooms with drains in the floor. What is said here is hosed away by morning.', 'Letters opened and resealed, the glue still wet. Every message arrives already read.',
        'The informer and the informed share one body. Neither sleeps.', 'The statement is signed, and the signature outlives the hand. The file is never closed.'],
      ['Saturn on the radio at dawn. A calm voice reads out names, and some of them are known.', 'A press photograph with one face scratched out. The silhouette is still recognisable.',
        'To speak in public is to be quoted against oneself later. The quotation is kept on file.', 'The brilliant remark is paid for with years of silence. The account is still in debit.',
        'A podium wired for sound, microphones in the ceiling, an audience that applauds on cue.', 'Newsprint yellowing in an archive, headlines brittle, the corrections never printed.',
        'The voice is recorded and outlives the throat. In the archive it still says what it was made to say.', 'What was once said brightly survives only as evidence.']
    ],
    // Cancer — Venus, Mercury, Moon
    [
      ['Saturn in the parlour. Wax fruit, drawn curtains, a clock nobody winds.', 'A wedding photograph turned to face the wall. The nail has rusted through the wallpaper.',
        'Affection is served at table in fixed portions. The plates are cold before they arrive.', 'Love in this house is a debt inherited with the furniture. Interest accrues in silence.',
        'A flat in a block of identical flats, thin walls that carry every quarrel to the neighbours.', 'Lace curtains grey with smoke. Behind them the same chairs in the same places for forty years.',
        'The family outlives its love. The rooms stay occupied by habit alone.', 'Old perfume in the wardrobe, sweet and rotten. It comes back on every coat.'],
      ['Saturn at the kitchen table where the letters are opened. Nothing reaches the child unread.', 'A drawer of documents: birth, marriage, illness, eviction. The family is a dossier.',
        'Every secret is kept by everyone, and each keeper is watched by the others.', 'The house speaks a code the child learns before words. Most of it means: not here, not now, never.',
        'Thin walls, a shared stairwell, a neighbour who reports. The home is a listening post.', 'Albums with faces cut out. The photographs are complete except for the people.',
        'The family story is repeated until it replaces what happened. The original is buried with the last witness.', 'The letters are never answered. They are kept, tied with string, and they outlast both hands.'],
      ['Saturn above the cradle. A cold draught from a window that will not close.', 'The nursery has bars on the window and a lock on the outside. The wallpaper peels in long strips.',
        'Hunger for shelter becomes the shape of the body. The shoulders curl as if the ceiling were low.', 'A face at the frosted glass, coming and going like a moon. It gives no warmth.',
        'Damp in the corners of every room the family ever rented. The same damp, carried from flat to flat.', 'A children’s sanatorium by a grey sea. Iron beds in rows, the windows open all winter on doctor’s orders.',
        'The childhood room is demolished and its cold stays in the bones.', 'Each night the tide comes back into the same flooded cellar. The line on the wall rises a little every year.']
    ],
    // Leo — Saturn, Jupiter, Mars
    [
      ['Saturn in a theatre after closing. Dust sheets on the seats, a single bulb on a stand.', 'The stage lights were sold for scrap. The performance goes on in the dark.',
        'To be seen is forbidden and to be unseen is unbearable. The body is held between the two.', 'Every gesture is rehearsed for an audience that never arrives. The muscles tire of waiting.',
        'A proscenium of poured concrete, a curtain rotted on its rope, a trapdoor nailed shut.', 'Dressing rooms with cracked mirrors. Each crack is older than the last tenant.',
        'The performance outlives the house. Rats cross the stalls during the soliloquy.', 'The crown is cardboard and the cardboard has gone soft. It is worn anyway, every night.'],
      ['Saturn reviewing a parade in the rain. The banners are soaked and the ranks keep marching.', 'A palace with most of its rooms closed. The chandeliers are wrapped in grey cloth.',
        'Greatness is demanded and then taxed. The tax is collected in years.', 'The heart wants a throne and is given a chair in an office. The chair is hard and permanent.',
        'A boulevard built too wide for its traffic, lined with lamps that are never lit.', 'A hall of honours with blank plaques, spaces kept for names not yet decided.',
        'The pomp outlives the regime. The uniforms are sold in markets and worn by strangers.', 'The festival ends and the bunting stays up all winter, bleaching, tearing, still tied to the poles.'],
      ['Saturn in an arena after the games. The sand is raked over what happened here.', 'A boxing ring in a cold gymnasium. The ropes are frayed; the blood on the canvas is old.',
        'Courage is spent in public and refunded in private as pain.', 'Pride is a wound kept open so it can be shown. It does not heal and it is not allowed to.',
        'Bleachers of rusting steel, a scoreboard frozen on the last result, nobody left to read it.', 'A trophy cabinet with the glass broken. The cups have tarnished black.',
        'The scar becomes the only medal. It is shown to nobody.', 'The champion ages in the gymnasium where the title was won. The title went to someone else long ago.']
    ],
    // Virgo — Sun, Venus, Mercury
    [
      ['Saturn under the examination lamp. The skin is checked inch by inch for flaws.', 'A white room, a steel table, a light without shadows. Everything is visible and nothing is spared.',
        'The self is inspected before it is allowed to exist. Most of it fails.', 'Every merit is scrubbed until it bleeds. The rag is wrung out and used again.',
        'A clinic in a provincial town, linoleum polished to a dull shine, carbolic in the walls.', 'Charts on clipboards at the foot of the bed. Temperature, weight, conduct.',
        'The flaw is found in the end, because the search never stops. It is filed with the others.', 'The light outlasts the patient. The bed is stripped and made up for the next one.'],
      ['Saturn in a room where nothing may be touched. Gloves, masks, the hands kept at the sides.', 'Flowers in a hospital vase, the water gone green. Nobody changes it.',
        'Desire is examined and sent back for correction. It returns smaller each time.', 'The body is kept clean the way a crime scene is kept clean.',
        'Tiled walls, a drain in the floor, one chair bolted in place. Intimacy happens elsewhere, or nowhere.', 'Starched sheets with hospital corners. The bed is made so tight that no one can get in.',
        'What is never touched does not stay clean. It yellows in the drawer like old linen.', 'Love is filed under hygiene and forgotten under hygiene.'],
      ['Saturn at the proofreader’s desk. Red ink, a magnifying glass, a manuscript that will never be clean.', 'A ward clerk recording symptoms through the night. The handwriting shrinks toward dawn.',
        'Every thought is corrected before it ends. The sentences come out short and crippled.', 'The mind counts its errors in its sleep. The count is always higher by morning.',
        'Card indexes, case notes, a cabinet of small drawers labelled in a tight hand.', 'Procedures pinned to the wall, laminated, signed, unread, obeyed.',
        'The method outlives the illness it was meant to cure. It is now the illness.', 'The ledger of faults runs to several volumes. The last page is never reached.']
    ],
    // Libra — Moon, Saturn, Jupiter
    [
      ['Saturn in a marriage bed. Two bodies kept a ruler’s width apart all night.', 'A ring left on the sink. The water has drawn a green circle on the porcelain.',
        'Closeness is kept on terms. The terms are revised at night, in whispers, without witnesses.', 'The need to be held is weighed against the cost. The scale has always favoured the cost.',
        'Twin beds pushed together, the gap still there under the sheet.', 'A shared flat divided with tape on the floor. Each half kept clean, the line kept clean.',
        'The marriage outlives the affection and goes on, in good order, like a lease.', 'The second pillow is never moved. It keeps the shape of a head long after.'],
      ['Saturn at the notary’s table. The contract runs to many pages and binds past death.', 'A courtroom in winter, both parties in coats. The judgment is read and nobody looks up.',
        'Every bond is a chain with a printed clause. The clause is honoured until the wrist goes numb.', 'Fairness is enforced with a ruler across the knuckles.',
        'Scales with lead weights, every grain accounted for, nothing given freely.', 'Two signatures at the foot of a page, the ink faded to brown, the terms still in force.',
        'The agreement outlives both who signed it. Strangers inherit its obligations.', 'The debt is cleared at last in the only currency left: time, paid in full.'],
      ['Saturn in the hall where treaties are signed. A long table, two flags, a border redrawn in pencil.', 'A banquet laid for envoys who never arrived. The roast has gone grey in its gravy.',
        'Peace is paid for with land that belonged to someone else.', 'The handshake is photographed. The hand inside it is cold.',
        'Partition walls, demarcation lines, a strip of no-man’s-land kept mown.', 'An embassy with its shutters down and a flag left out in all weathers.',
        'The treaty outlasts the war it ended and the peace it promised.', 'Borders drawn at a table stay drawn on the land long after the table is burned.']
    ],
    // Scorpio — Mars, Sun, Venus
    [
      ['Saturn in the cellar where the knives are kept. Oiled, wrapped in cloth, never used, never thrown away.', 'A wound sewn shut without cleaning. It heals around what is still inside.',
        'Rage is buried alive and goes on breathing through a reed.', 'Every betrayal is remembered to the day. The memory is sharpened on the anniversary.',
        'A bunker under the garden, stocked for a siege. The air down there is years old.', 'Steel doors, chains, a room nobody else has entered. The lock is oiled every week.',
        'What is buried does not rot evenly. It waits, and it keeps its teeth.', 'The grudge outlasts its object. It is kept for its own sake, like a rifle from a war that ended.'],
      ['Saturn in an archive below the street. The files on the deepest shelf concern one name.', 'A photograph developed in the dark and never printed. The negative is locked away.',
        'To be known is to be exposed, and exposure is a small death. The self stays in the cellar.', 'Power is gathered in secret and held in the dark. It feeds there and grows pale.',
        'Two-way mirrors, false bottoms, a second ledger under the first.', 'A mausoleum with the name chiselled off. Inside, everything is in order.',
        'The secret outlives its keeper. It is found later, still sealed, still dangerous.', 'The face hidden longest becomes the only true one. Nobody alive has seen it.'],
      ['Saturn in the bedroom of a house closed for years. Perfume dried to a crust in the bottles on the dresser.', 'Flowers left on a grave until they become part of it.',
        'Desire is tangled with decay. Every caress carries the smell of what comes after.', 'Love is held so tightly it bruises, and the bruise is kept as proof.',
        'Velvet gone to mould, a canopy rotting over the bed, letters tied with hair.', 'A locked trunk under the bed. Inside: gloves, a lock of hair, a photograph with the eyes burned out.',
        'The flesh goes first. The shape of the wanting stays on the sheets.', 'What was loved in secret is buried in secret. The ground over it stays soft for years.']
    ],
    // Sagittarius — Mercury, Moon, Saturn
    [
      ['Saturn at the border post. A guard turns the passport over and over under a yellow lamp.', 'A suitcase of documents for a journey that is always postponed.',
        'Every road requires a permit, and every permit requires another road to fetch it.', 'Belief is carried in writing, stamped and countersigned. It weighs more each year.',
        'Checkpoints, turnstiles, waiting rooms with numbered tickets and no clock.', 'A library with a locked section and a list of forbidden titles nailed to the door.',
        'The visa expires in the waiting room. The traveller grows old holding it.', 'The doctrine outlives the mind that wrote it. It is recited by people who have never read it.'],
      ['Saturn on a night train across a frozen plain. The compartment is unheated and nobody says where it stops.', 'A camp in winter. Tents in rows, numbers on the tents, smoke rising straight up in the still cold.',
        'Home is always across a border that cannot be crossed. The longing has calloused over.', 'Wandering is enforced. The body is moved on before it can warm a place.',
        'Transit halls, dormitories, one bunk each night and a different bunk the next.', 'A map with the homeland painted over. The old names survive only in the mouths of the old.',
        'Exile becomes permanent and is renamed residence. Nothing else changes.', 'The road outlives the destination. The walking goes on after the city has been erased.'],
      ['Saturn at the edge of the steppe. The horizon has not moved in years of walking.', 'A wall built across open country, from nowhere to nowhere, patrolled.',
        'Conviction is a load carried uphill toward a summit that recedes. The legs give first.', 'Freedom is promised beyond each wall, and each wall has another behind it.',
        'Watchtowers at regular intervals to the vanishing point. Searchlights sweep the snow.', 'A frontier town of empty barracks. The border moved; the guards were never told.',
        'The distance does not close. The walker is buried by the road, facing the horizon.', 'The principle hardens into a monument. The monument cracks, and the principle inside it died long ago.']
    ],
    // Capricorn — Jupiter, Mars, Sun
    [
      ['Saturn in a ministry that has outgrown its dead. Wet plaster, typewriters still running in rooms nobody enters.', 'The building is enormous and it is rotting from the archive up. Mould climbs the files floor by floor.',
        'The law is carried in the body like lead shot. It settles in the joints and does not leave.', 'Every year a heavier ledger is chained to the wrist. The skin under the chain has gone grey.',
        'Corridors lengthen at night. The doors are numbered past any count, and behind one of them a clerk dies at the desk.', 'Stairwells without landings, lifts that stop between floors. The air is breathed again and again until it tastes of the first lungs.',
        'The building stands long after its purpose has died inside it. Nobody has dared to remove the body.', 'The occupant dies at the post. The post is advertised the next morning, unchanged.'],
      ['Saturn in the barracks. Iron in the blood and frost on the iron; by spring both are rust.', 'The drill starts in the dark. Breath freezes, boots crack on the yard, someone falls and is left there.',
        'The fist is clenched so long the tendons shorten. The hand will not open again.', 'Violence is swallowed and kept in the gut. It ferments there.',
        'Bunks bolted to the wall, a bucket in the corner, a bulb that is never switched off. Order is kept by the sound of the next beating.', 'Concrete poured over the old trench. The dead are still in it, and the walls sweat in summer.',
        'The body stands in the cold until it stops feeling the cold, then stops feeling.', 'The anger outlives the reason, then the face, then the name. Only the scar keeps the date.'],
      ['Saturn at the solstice. A low white sun on a monument nobody looks at any more.', 'A portrait hangs in every office. The man in it has been dead for years and still watches the room.',
        'To be seen is to be stripped and measured under a hard lamp. The lamp never goes out.', 'Authority is a coat lined with lead. It is buttoned on in youth and buried with the wearer.',
        'The podium, the parade, the official photograph. The face is cast in bronze while the flesh behind it is still warm.', 'A staircase of rank lit from above, each step colder and brighter. At the top, an empty chair in an unheated room.',
        'The statue outlives the face it was cast from. Pigeons foul the eyes. Nobody reads the name on the plinth.', 'After the longest night the sun returns, low and white, and shows the bodies that froze waiting for it.']
    ],
    // Aquarius — Venus, Mercury, Moon
    [
      ['Saturn in a housing block at night. Ten thousand windows, ten thousand lamps, nobody touching.', 'A dance hall in a workers’ district. The band plays to an empty floor under a portrait of the director.',
        'Love is allocated by the housing committee. The waiting list is long and the flats are small.', 'Desire is shared out evenly until there is none left for anyone.',
        'Prefabricated panels, identical kitchens, a wall shared with strangers who cough through the night.', 'A communal bathroom down the corridor. A rota on the door, a cracked mirror over the sink.',
        'The plan outlives every couple housed in it. The panels stain; the numbers on the doors remain.', 'Friendship is filed as membership. When the membership lapses the friendship is not renewed.'],
      ['Saturn in the computing centre. Tape reels turning, punch cards in trays, a citizen reduced to holes.', 'A city drawn with a ruler. The streets are numbered, and the people are numbered after the streets.',
        'The mind is wired into the collective. Every thought passes through a relay and comes back altered.', 'Ideas are approved by vote. The vote is unanimous every time.',
        'Control rooms, switching stations, cables under every street feeding one building in the centre.', 'An index card for every resident, cross-referenced, updated weekly by people who have never met them.',
        'The system runs after its architects are dead. Nobody remembers how to switch it off.', 'The individual becomes a data point, then a rounding error, then nothing at all.'],
      ['Saturn over a new town built for a future that was cancelled. Kindergartens with no children, swimming pools drained.', 'A model city under glass in a museum. The real one has been left to the weeds.',
        'The need to belong is met with a uniform. It fits nobody and everybody wears it.', 'Shelter is provided collectively, and the cold is distributed fairly.',
        'Tower blocks on a flat plain, wind between them, playgrounds rusting in the grass.', 'A culture house with a mosaic of smiling workers. Half the tiles have fallen, the faces first.',
        'The utopia ages into a ruin with a maintenance budget. Somebody still sweeps the steps.', 'The dream of the many is outlived by the concrete of the many. The concrete does not dream.']
    ],
    // Pisces — Saturn, Jupiter, Mars
    [
      ['Saturn under the water. A town flooded for a reservoir; in dry years the school roof shows above the surface.', 'A sea wall at low tide, slick with weed, holding back an ocean that has not yet decided.',
        'The boundary dissolves and the body fills with water. The weight comes from inside.', 'The flood is held off for years by a wall built while drowning.',
        'Breakwaters, sluice gates, sandbags in every doorway, a tide table nailed to the wall.', 'An asylum on a marsh. Long corridors, damp rising up the plaster, patients counting the drips.',
        'The water always comes back. What remains is the line on the wall where it stopped last time.', 'The drowned town is mapped and forgotten. In dry summers its streets surface, intact and empty.'],
      ['Saturn in a sanatorium by the sea. Wicker chairs on the terrace, blankets, nobody speaks.', 'A great hospital built for the incurable. Its wings stretch along the coast like a stranded hulk.',
        'The dream is too large for the body that holds it. The body is sedated.', 'Pity is administered in doses, on a schedule, by the clock.',
        'Wards named after benefactors nobody remembers, white beds to the vanishing point.', 'A dispensary hatch, a queue in slippers, small paper cups in rows.',
        'The institution outlives the reason anyone was sent there. The patients become the staff.', 'Visions become case notes. The case notes are bound and shelved and never read.'],
      ['Saturn at the wreck. A hull broken on the rocks, the cargo drifting out in slow circles.', 'A lifeboat with no oars. The sea is calm and the shore never comes closer.',
        'Fighting the current exhausts the arms long before the current tires.', 'Rage is drowned and comes back up bloated, days later, on another shore.',
        'Rusting hulls in a ship graveyard, cut up for scrap one plate at a time.', 'A lighthouse with the lamp shot out. The keeper still climbs the stairs at dusk.',
        'What sinks keeps its shape on the bottom until the salt takes it.', 'The wreck settles on the seabed and the fish move in. The sea above it goes on as before.']
    ]
  ];

  const event = [
    [
      ['Saturn at the launch. The engines fire into a wall.', 'The project spends its first force against resistance already in place. None of it comes back.', 'Its frame is built from everything refused in order to begin.', 'It is judged by what still stands after the first push, and most of it does not.'],
      ['Saturn at the opening. The ribbon is cut in an empty street.', 'Its public face is photographed early and used against it later.', 'A façade raised before the building behind it.', 'The façade outlasts the work it advertised.'],
      ['Saturn at the first meeting. The partners shake hands with cold fingers.', 'Its alliances are bought at a price that keeps rising.', 'Partnerships held together by contract, without appetite.', 'The partners leave; the contract stays in a drawer, binding nobody.']
    ],
    [
      ['Saturn in the stockroom. Every item is counted before anything is made.', 'Its resources are listed faster than they are used.', 'Inventories, reserves, locks on the stores.', 'The inventory outlives the stock.'],
      ['Saturn in the cellar of the enterprise. Supplies are hoarded against a winter that always comes.', 'Its base is fed sparingly and remembers it.', 'Store rooms, emergency rations, a key held by one person.', 'The reserves spoil before they are touched.'],
      ['Saturn in the foundations. Poured thick, cured slowly, never finished.', 'Its assets become a weight it must carry everywhere.', 'Walls thicker than the rooms they enclose.', 'It lasts where nothing can reach it, the way a ruin lasts.']
    ],
    [
      ['Saturn in the press office. Every statement is drafted ten times.', 'Its communications pass through a committee and come out dead.', 'Minutes, memos, a filing system larger than the work.', 'The archive outgrows the project.'],
      ['Saturn at the negotiating table under a bare bulb.', 'Every word it publishes is used against it.', 'Disputes kept in writing, every argument on file.', 'The quarrel outlasts the people who started it.'],
      ['Saturn at the press conference. The cameras flash; the answers were written in advance.', 'Its public voice is recorded and quoted back at it for years.', 'A podium, a script, a spokesman reading.', 'Only its retractions are remembered.']
    ],
    [
      ['Saturn at the founding dinner. The table is laid; half the chairs stay empty.', 'The group it shelters expects an affection it cannot pay for.', 'Shared rooms, inherited loyalties, uneven loads.', 'The founding friendships sour and the arrangement continues.'],
      ['Saturn in the house records. Everything about the members is written down.', 'It keeps its people by keeping their secrets.', 'Registers, rotas, a book of who owes what.', 'Its records outlive its members.'],
      ['Saturn under a leaking roof. The project shelters more than it can heat.', 'Its base wants protection and gets damp walls.', 'Makeshift shelters, temporary rooms that become permanent.', 'The temporary arrangement is still in place decades later.']
    ],
    [
      ['Saturn backstage. The curtain stays down on opening night.', 'Recognition is withheld for years.', 'A stage poured in concrete for a show that waits.', 'Its authority, if it comes, comes late and in the dark.'],
      ['Saturn on the reviewing stand. The parade is long and the crowd is thin.', 'Its ambitions are larger than its means, and the difference is paid in time.', 'Grand halls, unlit, half furnished.', 'The grandeur outlives the purpose and costs more to heat each year.'],
      ['Saturn in the arena. The project fights in public and bleeds in public.', 'Every victory is paid for with an injury it keeps.', 'A ring with frayed ropes, a crowd that wants blood.', 'It ends with scars and no title.']
    ],
    [
      ['Saturn under the inspection lamp. The project is examined before it may begin.', 'Every flaw is found and listed.', 'Audits, checklists, a clean room with no window.', 'The inspection never closes.'],
      ['Saturn in the clean room. Nothing may be touched without gloves.', 'Its relationships are kept sterile and die of it.', 'A protocol for every contact.', 'It stays clean and nobody wants it.'],
      ['Saturn at the proofreader’s desk, red ink on every page.', 'Correction comes before completion, and completion never comes.', 'Procedures pinned to every wall.', 'The procedure becomes the product.']
    ],
    [
      ['Saturn at the signing. Two parties, one pen, nobody smiling.', 'Its partnerships are held at a measured, cold distance.', 'Agreements, schedules, separate keys.', 'The partnership survives as paperwork.'],
      ['Saturn at the notary’s table. The terms run to many pages.', 'Every clause binds and every bond costs.', 'Contracts, guarantees, penalties for delay.', 'It is held to its terms long after anyone remembers why.'],
      ['Saturn at the treaty table. Borders drawn in pencil, enforced in steel.', 'Its peace is bought with concessions it cannot recover.', 'Demarcation lines, buffer zones, a neutral room.', 'The settlement outlives the conflict and becomes the next one.']
    ],
    [
      ['Saturn in the locked room where the weapons are kept.', 'It is born guarded and stays armed.', 'Restricted access, sealed doors, a list of enemies.', 'Its feuds outlive its aims.'],
      ['Saturn in the archive under the building.', 'What it shows is little; the real work is hidden.', 'A second set of books, a room missing from the plans.', 'Its secrets are found after it ends, still sealed.'],
      ['Saturn in the closed house. Velvet, dust, the windows painted over.', 'Its attachments are total, and they rot.', 'Private agreements, unwritten loyalties.', 'What it buries works on it slowly from below.']
    ],
    [
      ['Saturn at the border post. The project waits in line with its papers.', 'Every advance requires a permit.', 'Applications, approvals, waiting rooms.', 'The permission arrives after the need has passed.'],
      ['Saturn on the night train. The project moves and never arrives.', 'It has no home and is moved on before it settles.', 'Temporary offices, borrowed rooms, boxes never unpacked.', 'The journey becomes its only address.'],
      ['Saturn at the frontier wall.', 'Its principle is guarded until nobody remembers it.', 'Doctrine set in concrete.', 'Its horizon recedes as it advances.']
    ],
    [
      ['Saturn in the ministry. The project is born into a building too large for it.', 'Duty fills its calendar from the first day.', 'Departments, ranks, forms in triplicate.', 'The institution outlives its purpose and keeps the staff.'],
      ['Saturn in the barracks. The project is drilled before it is trusted.', 'Its force is spent on discipline.', 'Chain of command, inspection at dawn.', 'It survives as a habit of obedience.'],
      ['Saturn at the solstice. The project is unveiled in the shortest light.', 'Its authority is cast early and grows heavy.', 'A monument raised before the work is done.', 'The monument stands; the work is forgotten.']
    ],
    [
      ['Saturn in the housing block. The project serves many and is loved by none.', 'Its collective rules sit badly on every individual.', 'Allocation lists, waiting lists, shared rooms.', 'The members change; the plan does not notice.'],
      ['Saturn in the control room. Cables run from every corner to one desk.', 'Its information is centralised and slowly poisoned.', 'Systems for everyone, inhabited by no one.', 'The system runs after its architects are gone.'],
      ['Saturn over the new town, built for a future that was cancelled.', 'It shelters everyone and warms no one.', 'Tower blocks on a windy plain.', 'It ages into an institution with a maintenance budget.']
    ],
    [
      ['Saturn at the sea wall. The project holds back what it cannot shape.', 'Its edges leak from the first day.', 'Sandbags, sluices, improvised boundaries.', 'What remains is the water line on its walls.'],
      ['Saturn in the sanatorium. The project tends what cannot be cured.', 'Its vision is too large for its means, and is sedated.', 'Wards, schedules, doses.', 'It outlives its founders as a routine.'],
      ['Saturn at the wreck. The project fights the current.', 'Its force is spent against the tide.', 'Hulls patched at sea.', 'It settles on the bottom and keeps its shape until the salt takes it.']
    ]
  ];

  const motionLines = {
    retrograde: 'Saturn was retrograde. The clock runs backward through the same hours, and every mark is cut twice.',
    direct: 'Saturn was direct. The weight moves forward at its own pace, a cart with iron wheels on a frozen road.',
    stationary: 'Saturn was stationary. The weight stands on one point, and the point gives way slowly.',
    uncertain: 'Saturn’s motion changes across the entered interval, so it is not read.'
  };

  const planetThemes = {
    Sun: 'recognition', Moon: 'security', Mercury: 'communication', Venus: 'affection and values',
    Mars: 'action', Jupiter: 'growth', Uranus: 'independence', Neptune: 'ideals', Pluto: 'power'
  };
  const planetImages = {
    Sun: 'The self that wants light is kept waiting in the corridor until the bulb fails.',
    Moon: 'The need for shelter is met with a cold room and a thin blanket.',
    Mercury: 'Every word passes the censor and comes out missing a limb.',
    Venus: 'Affection is priced by weight, like meat, and the scale is crooked.',
    Mars: 'Force is kept chained until the chain is the only thing it knows how to pull against.',
    Jupiter: 'Growth meets the planning committee and is approved in pieces, too late.',
    Uranus: 'The urge to break out throws itself at the wall built to stop it.',
    Neptune: 'The dream is given a floor plan, and water comes up through the floor.',
    Pluto: 'Something under the foundations presses up, slow as rot, patient as roots.'
  };
  const eventPlanetImages = {
    Sun: 'Its public face is kept waiting in the corridor.',
    Moon: 'Its base is housed in cold rooms.',
    Mercury: 'Its messages are censored in transit.',
    Venus: 'Its alliances are bought by weight.',
    Mars: 'Its force is chained.',
    Jupiter: 'Its growth is approved too late.',
    Uranus: 'Its break with the old order hits the old order’s walls.',
    Neptune: 'Its vision floods its own foundations.',
    Pluto: 'Pressure under its foundations does not let up.'
  };
  const aspectLanguage = {
    conjunction: 'Saturn lies on top of {theme}. The two are fused like metal in a fire; one cannot move without dragging the other.',
    sextile: 'A crack runs through the wall between Saturn and {theme}. Something passes through it when forced, and the edges cut.',
    square: ['Saturn stands across the road of {theme}. The collision repeats, and the wreckage piles up at the same corner.', 'Checkpoint: {theme} is stopped, searched and turned back, every time.'],
    trine: 'Saturn and {theme} share a load-bearing wall. It holds, and behind the plaster the cracks spread in silence.',
    opposition: 'Saturn faces {theme} across a strip of mined ground. Each side watches the other through the wire.'
  };

  // Saturn with no major aspect: the isolated planet.
  const unaspected = {
    natal: [
      'Saturn stands alone. No other planet reaches it: no visitor, no letter, no voice through the wall. The weight is carried in a sealed room.',
      'No planet answers Saturn. It turns in its cell without contact, and the silence around it is total. What it builds, it builds unwitnessed.'
    ],
    event: 'No planet touches Saturn in this chart. The project carries its weight alone, in a sealed room.'
  };

  const returnAudits = [
    'The first audit. The inherited walls are knocked on one by one; the hollow ones are marked for demolition.',
    'The second audit. Everything built since the first is loaded until it groans. What cracks is taken down.',
    'The third audit. The inspector is old, and so is the building. What remains is what the years could not carry off.'
  ];

  const api = { natal, event, unaspected, motionLines, planetThemes, planetImages, eventPlanetImages, aspectLanguage, returnAudits };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SaturnNarrative = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
