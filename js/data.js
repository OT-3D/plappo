/* ============================================================
   PLAPPO – Content data
   Sourced from the clinical reference (Fox-Boyer acquisition order,
   P.O.P.T., Würzburger Trainingsprogramm). Every word is a common,
   drawable child noun mapped to an emoji.
   Age tiers gate by phoneme acquisition order:
     tier 1 ~2-3 | tier 2 ~3-4 | tier 3 ~4-5 | tier 4 ~5-6+
   ============================================================ */
window.PLAPPO_DATA = (function(){

  // ---- Target-sound "worlds". color matches a .tile.c-* class.
  // pos: A=Anlaut(initial) I=Inlaut(medial) E=Auslaut(final)
  const PHONEMES = [
    {
      id:"L", label:"L wie Lampe", sound:"l", emoji:"💡", color:"c-leaf", tier:1,
      hint:"Zunge nach oben hinter die Zähne – llll.",
      words:{
        A:[["Lampe","💡"],["Löwe","🦁"],["Leiter","🪜"],["Luftballon","🎈"],["Lupe","🔍"],["Lineal","📏"],["Lutscher","🍭"]],
        I:[["Blume","🌸"],["Teller","🍽️"],["Brille","👓"],["Gabel","🍴"],["Pilz","🍄"],["Elefant","🐘"],["Salat","🥗"],["Schlüssel","🔑"],["Wolke","☁️"],["Kerze","🕯️"]],
        E:[["Ball","⚽"],["Apfel","🍎"],["Igel","🦔"],["Stuhl","🪑"],["Pinsel","🖌️"],["Mantel","🧥"],["Vogel","🐦"]]
      }
    },
    {
      id:"F", label:"F wie Fisch", sound:"f", emoji:"🐟", color:"c-sky", tier:1,
      hint:"Obere Zähne sanft auf die Unterlippe – ffff.",
      words:{
        A:[["Fisch","🐟"],["Feder","🪶"],["Fuchs","🦊"],["Fenster","🪟"],["Fahne","🚩"],["Frosch","🐸"],["Foto","📷"],["Fußball","⚽"],["Feuer","🔥"],["Flugzeug","✈️"],["Flasche","🍼"],["Fahrrad","🚲"],["Familie","👪"]],
        I:[["Affe","🐵"],["Kaffee","☕"],["Giraffe","🦒"],["Seife","🧼"]],
        E:[["Schaf","🐑"],["Brief","✉️"],["Apfel","🍎"]]
      }
    },
    {
      id:"K", label:"K wie Katze", sound:"k", emoji:"🐈", color:"c-sun", tier:2,
      hint:"Zungenspitze unten halten, hinten 'kuck' – k-k-k.",
      words:{
        A:[["Katze","🐈"],["Kuh","🐄"],["Koffer","🧳"],["Krone","👑"],["Kerze","🕯️"],["Kanne","🫖"],["Korb","🧺"],["Kamm","🪮"],["Karotte","🥕"],["Kürbis","🎃"],["Käse","🧀"],["Kette","📿"],["Kaktus","🌵"],["Kuchen","🍰"],["König","🤴"]],
        I:[["Jacke","🧥"],["Glocke","🔔"],["Schaukel","🛝"],["Brücke","🌉"],["Socke","🧦"],["Wecker","⏰"]],
        E:[["Sack","🛍️"],["Rock","👗"],["Block","🧱"],["Tag","🌞"],["Zug","🚂"],["Berg","⛰️"]]
      }
    },
    {
      id:"G", label:"G wie Giraffe", sound:"g", emoji:"🦒", color:"c-leaf", tier:2,
      hint:"Wie K, aber mit Stimme – g-g-g.",
      words:{
        A:[["Gabel","🍴"],["Gans","🪿"],["Giraffe","🦒"],["Garten","🌻"],["Gurke","🥒"],["Glocke","🔔"],["Gitarre","🎸"],["Geschenk","🎁"],["Gespenst","👻"],["Glas","🥛"],["Geld","💶"]],
        I:[["Regen","🌧️"],["Vogel","🐦"],["Wagen","🚃"],["Bagger","🚜"],["Flügel","🪽"],["Auge","👁️"]]
        // no Auslaut: final g devoices to k (Auslautverhärtung)
      }
    },
    {
      id:"SCH", label:"Sch wie Schaf", sound:"sch", emoji:"🐑", color:"c-grape", tier:3,
      hint:"Lippen vorstülpen wie ein Kuss – schhh.",
      words:{
        A:[["Schaf","🐑"],["Schule","🏫"],["Schnecke","🐌"],["Schmetterling","🦋"],["Schiff","🚢"],["Schere","✂️"],["Schlange","🐍"],["Schuh","👟"],["Schwein","🐷"],["Schlüssel","🔑"],["Schnee","❄️"],["Schaukel","🛝"],["Schwan","🦢"]],
        I:[["Tasche","👜"],["Flasche","🍼"],["Dusche","🚿"],["Kirsche","🍒"],["Muschel","🐚"],["Waschbär","🦝"]],
        E:[["Fisch","🐟"],["Frosch","🐸"],["Busch","🌳"],["Hirsch","🦌"]]
      }
    },
    {
      id:"R", label:"R wie Rakete", sound:"r", emoji:"🚀", color:"c-coral", tier:4,
      hint:"Hinten im Mund gurgeln – rrrr.",
      words:{
        A:[["Rakete","🚀"],["Rose","🌹"],["Roboter","🤖"],["Raupe","🐛"],["Rad","🛞"],["Ring","💍"],["Regenschirm","☂️"],["Rutsche","🛝"],["Regen","🌧️"],["Rabe","🐦‍⬛"],["Regenbogen","🌈"]],
        I:[["Giraffe","🦒"],["Karotte","🥕"],["Gitarre","🎸"],["Schere","✂️"],["Birne","🍐"],["Karussell","🎠"],["Marienkäfer","🐞"]]
        // no Auslaut: final/postvocalic R is vocalized to [ɐ] (Tür, Uhr) — not a producible /r/
      }
    },
    {
      id:"S", label:"S wie Sonne", sound:"s", emoji:"☀️", color:"c-sun", tier:4,
      hint:"Zähne sind ein Zaun, Zunge dahinter – sssss.",
      words:{
        A:[["Sonne","☀️"],["Sofa","🛋️"],["Salat","🥗"],["Suppe","🍲"],["Säge","🪚"],["Seil","🪢"],["Socke","🧦"],["Sand","🏖️"],["Saft","🧃"],["Salz","🧂"],["Sonnenblume","🌻"]],
        I:[["Hase","🐰"],["Nase","👃"],["Hose","👖"],["Esel","🫏"],["Käse","🧀"],["Wiese","🌱"],["Dose","🥫"],["Vase","🏺"]],
        E:[["Maus","🐭"],["Haus","🏠"],["Eis","🍦"],["Bus","🚌"],["Gras","🌿"],["Fuß","🦶"],["Nuss","🌰"]]
      }
    }
  ];

  // ---- Minimal pairs (both members drawable). contrast = what it trains.
  const MINIMAL_PAIRS = [
    {a:["Sonne","☀️"], b:["Tonne","🗑️"], contrast:"s ↔ t"},
    {a:["Kanne","🫖"],  b:["Tanne","🌲"], contrast:"k ↔ t"},
    {a:["Kopf","👤"],   b:["Topf","🍲"], contrast:"k ↔ t"},
    {a:["Hose","👖"],   b:["Dose","🥫"], contrast:"h ↔ d"},
    {a:["Maus","🐭"],   b:["Haus","🏠"], contrast:"m ↔ h"},
    {a:["Schuh","👟"],  b:["Kuh","🐄"],  contrast:"sch ↔ k"},
    {a:["Kirsche","🍒"],b:["Kirche","⛪"],contrast:"sch ↔ ch"},
    {a:["Gabel","🍴"],  b:["Kabel","🔌"],contrast:"g ↔ k"},
    {a:["Tasche","👜"], b:["Tasse","🍵"], contrast:"sch ↔ s"},
    {a:["Rose","🌹"],   b:["Hose","👖"], contrast:"r ↔ h"},
    {a:["Brot","🍞"],   b:["Boot","⛵"], contrast:"Konsonanten-Verbindung"},
    {a:["Suppe","🍲"],  b:["Puppe","🪆"],contrast:"s ↔ p"},
    {a:["Hase","🐰"],   b:["Nase","👃"], contrast:"h ↔ n"},
    {a:["Hase","🐰"],   b:["Vase","🏺"], contrast:"h ↔ w (v-Laut)"},
    {a:["Nase","👃"],   b:["Vase","🏺"], contrast:"n ↔ w (v-Laut)"},
    {a:["Hand","🖐️"],   b:["Sand","🏖️"], contrast:"h ↔ s"},
    {a:["Bein","🦵"],   b:["Wein","🍷"], contrast:"b ↔ w"},
    {a:["Katze","🐈"],  b:["Tatze","🐾"], contrast:"k ↔ t"},
    {a:["Bus","🚌"],    b:["Busch","🌳"], contrast:"s ↔ sch"},
    {a:["Hund","🐶"],   b:["Mund","👄"], contrast:"h ↔ m"},
    {a:["Rose","🌹"],   b:["Dose","🥫"], contrast:"r ↔ d"}
  ];

  // ---- Syllable words (clap/hop counting). syll = number of syllables.
  const SYLLABLES = [
    ["Ball","⚽",1],["Baum","🌳",1],["Eis","🍦",1],["Stern","⭐",1],
    ["Auto","🚗",2],["Sonne","☀️",2],["Apfel","🍎",2],["Blume","🌸",2],["Hose","👖",2],["Katze","🐈",2],
    ["Banane","🍌",3],["Elefant","🐘",3],["Giraffe","🦒",3],["Tomate","🍅",3],["Rakete","🚀",3],
    ["Telefon","☎️",3],["Känguru","🦘",3],["Zitrone","🍋",3],["Krokodil","🐊",3],
    ["Schmetterling","🦋",3],["Marienkäfer","🐞",5],["Schokolade","🍫",4],
    ["Hund","🐶",1],["Maus","🐭",1],["Brot","🍞",1],["Fisch","🐟",1],
    ["Igel","🦔",2],["Sofa","🛋️",2],["Kerze","🕯️",2],["Schnecke","🐌",2],["Vogel","🐦",2],["Kamel","🐪",2],
    ["Pinguin","🐧",3],["Ananas","🍍",3],["Erdbeere","🍓",3],["Luftballon","🎈",3],
    ["Krankenwagen","🚑",4],["Wassermelone","🍉",5]
  ];

  // ---- Rhyme pairs + distractors for "find the rhyme".
  const RHYMES = [
    {key:["Haus","🏠"], match:["Maus","🐭"], distractors:[["Ball","⚽"],["Sonne","☀️"]]},
    {key:["Hose","👖"], match:["Rose","🌹"], distractors:[["Fisch","🐟"],["Auto","🚗"]]},
    {key:["Hase","🐰"], match:["Nase","👃"], distractors:[["Baum","🌳"],["Schuh","👟"]]},
    {key:["Sonne","☀️"],match:["Tonne","🗑️"],distractors:[["Maus","🐭"],["Igel","🦔"]]},
    {key:["Katze","🐈"],match:["Tatze","🐾"], distractors:[["Lampe","💡"],["Eis","🍦"]]},
    {key:["Hose","👖"], match:["Dose","🥫"], distractors:[["Ball","⚽"],["Maus","🐭"]]},
    {key:["Hund","🐶"], match:["Mund","👄"], distractors:[["Ball","⚽"],["Rose","🌹"]]},
    {key:["Nase","👃"], match:["Vase","🏺"], distractors:[["Sonne","☀️"],["Schuh","👟"]]},
    {key:["Bein","🦵"], match:["Wein","🍷"], distractors:[["Ball","⚽"],["Hose","👖"]]},
    {key:["Ball","⚽"], match:["Wal","🐳"], distractors:[["Maus","🐭"],["Sonne","☀️"]]},
    {key:["Schnee","❄️"],match:["Tee","🍵"], distractors:[["Ball","⚽"],["Hund","🐶"]]}
  ];

  // ---- Mundmotorik warm-ups (framed as fun mouth-play, NOT an articulation fix)
  // anim = which animated mouth the SVG face shows (see face.js / mundmotorik.js)
  const MUNDMOTORIK = [
    {name:"Wildes Pferd", emoji:"🐴", anim:"tongueClick", say:"Schnalz mit der Zunge wie ein Pferd! Klock, klock!", secs:8},
    {name:"Lange Giraffe", emoji:"🦒", anim:"tongueUp", say:"Streck die Zunge ganz weit raus. Berührst du die Nase?", secs:8},
    {name:"Pustefix", emoji:"🫧", anim:"blow", say:"Puste ganz sanft – so machst du viele Seifenblasen!", secs:8},
    {name:"Kussmund & Lachen", emoji:"😘", anim:"kissSmile", say:"Mach einen Kussmund... und jetzt ganz breit lachen! Hin und her.", secs:8},
    {name:"Fischmaul", emoji:"🐟", anim:"fish", say:"Mach den Mund auf und zu wie ein Fisch. Blubb, blubb!", secs:8},
    {name:"Dicke Backen", emoji:"🎈", anim:"cheeks", say:"Blas beide Backen ganz dick auf wie ein Ballon – und dann pust die Luft wieder raus!", secs:8},
    {name:"Zähne putzen", emoji:"🪥", anim:"teeth", say:"Fahr mit der Zunge an den oberen Zähnen entlang. Zähl sie!", secs:8},
    {name:"Der Maler", emoji:"🎨", anim:"lickCircle", say:"Male mit der Zungenspitze einen Kreis rund um die Lippen.", secs:8}
  ];

  // ---- Collectible stickers (unlocked by stars). Pure delight.
  const STICKERS = ["🦜","🦊","🐢","🦁","🐘","🦒","🐙","🦄","🐝","🦋","🐳","🦕","🌈","⭐","🚀","🎈","🍓","🌻","🐧","🦉","🐬","🐨","🐼","🐸","🦓","🦔","🐞","🦩","🦚","🌸","🍄","🌟","🎁","🍭","🦖","🐠","🌺","🦢"];

  // ---- Encouragement (varied so praise never feels robotic). Spoken by Pepe.
  const PRAISE = [
    "Super gemacht!","Das war toll!","Wow, klasse!","Ja, genau so!","Prima!",
    "Du bist spitze!","Richtig gut!","Weiter so!","Bravo!","Mega!","Toll gesprochen!","Juhu!",
    "Fantastisch!","Spitzenmäßig!","Das klang super!","Du machst das klasse!",
    "Hurra, geschafft!","Wunderbar!","Sauber gesprochen!","Du bist ein Plapper-Profi!"
  ];
  const TRY_AGAIN = [
    "Fast! Versuch's noch mal mit mir.","Probier es noch einmal – du schaffst das!",
    "Hör nochmal genau hin.","Gemeinsam nochmal, los!"
  ];
  const GREETINGS = [
    "Hallo, ich bin Pepe! Sprich mir nach.","Schön, dass du da bist! Lass uns plappern.",
    "Hallo! Heute üben wir zusammen.","Hi! Ich freu mich auf dich!",
    "Hallöchen! Bist du bereit zum Plappern?","Juhu, da bist du ja! Los geht's!",
    "Schön dich zu sehen! Wir haben heute viel Spaß.","Hey! Ich bin Pepe und freue mich auf dich!"
  ];

  // ---- Quatschwörter (silly nonsense words) per target sound — the "neue Autobahn"
  //      method: practise the new sound in playful made-up words, pure giggles.
  const QUATSCH = {
    L:   ["Lalülü","Lilalo","Lululu","Lollipam","Leilala","Lalelu"],
    F:   ["Fifafo","Fuffifu","Falafu","Fifofa","Faffelfu","Fofifu"],
    K:   ["Kakako","Kukika","Kokoku","Kakadu","Kikariki","Kukuko"],
    G:   ["Gagago","Guguga","Gigogu","Gageli","Goggomo","Gugugo"],
    SCH: ["Schischo","Schubidu","Schascho","Schuschi","Schalala","Schoschu"],
    R:   ["Riraro","Rurura","Rorori","Rakara","Rumdiro","Rarero"],
    S:   ["Sosasu","Sumsisa","Sisaso","Sususa","Sassala","Sosiso"]
  };

  // ---- Lautschlüssel (Sprachify): get a hard sound via an animal/trick the child can copy.
  //      Tier-Sound-Methode: Rabe "Kra"→k, Tiger "Grrr"→r, Schlange "Schhh"→sch ...
  const LAUTSCHLUESSEL = {
    K:   { animal:"🐦‍⬛", helper:"der Rabe",
           trick:"Hör mal, der Rabe macht: Kra, Kra! Mach es ihm nach – ganz hinten im Hals.",
           again:"Noch mal wie der Rabe: Kra, Kra!" },
    G:   { animal:"🐸", helper:"der Frosch",
           trick:"Der Frosch quakt ganz tief: Gack, gack! Mach es nach – hinten im Hals, mit Brummen.",
           again:"Noch mal wie der Frosch: Gack, gack!" },
    SCH: { animal:"🐍", helper:"die Schlange", face:"blow",
           trick:"Die Schlange zischt leise: Schhh! Mach eine Kuss-Schnute und zisch mit.",
           again:"Noch mal wie die Schlange: Schhh!" },
    R:   { animal:"🐯", helper:"der Tiger",
           trick:"Der Tiger knurrt ganz hinten: Grrr! Und jetzt wird er leise und müde: rrr.",
           again:"Noch mal wie der Tiger: Grrr!" },
    S:   { animal:"🎈", helper:"der Luftballon", face:"teeth",
           trick:"Lass die Luft raus wie ein Ballon: Ssssss! Zähne zu, Zunge dahinter.",
           again:"Noch mal: Ssssss!" },
    L:   { animal:"🔔", helper:"die Glocke", face:"tongueRidge",
           trick:"Die Zunge klettert nach oben hinter die Zähne: la, la, la!",
           again:"Noch mal: la, la, la!" },
    F:   { animal:"🐱", helper:"die Katze", face:"lipbite",
           trick:"Die Katze faucht: Fffff! Obere Zähne sanft auf die Unterlippe.",
           again:"Noch mal: Fffff!" }
  };

  return { PHONEMES, MINIMAL_PAIRS, SYLLABLES, RHYMES, MUNDMOTORIK, STICKERS, PRAISE, TRY_AGAIN, GREETINGS, QUATSCH, LAUTSCHLUESSEL };
})();

/* ADDED — every new entry with emoji justification (3-year-old must recognize the exact word).

PHONEMES — L:
  A "Lkw" 🚚            — Lieferwagen = truck, exact.
  A "Lutscher" 🍭       — Lollipop emoji = Lutscher, exact.
  I "Salat" 🥗          — green salad bowl, exact.
  I "Schlüssel" 🔑      — key, exact.
  I "Wolke" ☁️          — cloud, exact.
  I "Kerze" 🕯️          — candle, exact.
  E "Vogel" 🐦          — bird, exact (final -gel carries /l/).
PHONEMES — F:
  A "Fußball" ⚽        — soccer ball, exact.
  A "Feuer" 🔥          — fire/flame, exact.
  A "Flugzeug" ✈️       — airplane, exact.
  A "Flasche" 🍼        — baby bottle = Flasche, exact.
  A "Fahrrad" 🚲        — bicycle, exact.
  A "Familie" 👪        — family group, exact.
  I "Schaufel" 🪏       — shovel, exact.
  I "Seife" 🧼          — soap bar, exact.
PHONEMES — K:
  A "Karotte" 🥕        — carrot, exact.
  A "Kürbis" 🎃         — pumpkin, exact.
  A "Käse" 🧀           — cheese, exact.
  A "Kette" 📿          — bead necklace/chain, exact.
  A "Kaktus" 🌵         — cactus, exact.
  A "Kuchen" 🍰         — slice of cake, exact.
  A "König" 🤴          — crowned royal, depicts king.
  I "Socke" 🧦          — sock, exact.
  I "Wecker" ⏰         — alarm clock = Wecker, exact.
  E "Berg" ⛰️           — mountain; final -g devoices to /k/, valid K-Auslaut.
PHONEMES — G:
  A "Geschenk" 🎁       — wrapped gift, exact.
  A "Gespenst" 👻       — ghost, exact.
  A "Glas" 🥛           — drinking glass, exact.
  A "Geld" 💶           — euro banknote = money, exact.
  I "Auge" 👁️           — eye, exact.
PHONEMES — SCH:
  A "Schwein" 🐷        — pig, exact.
  A "Schlüssel" 🔑      — key, exact.
  A "Schnee" ❄️         — snowflake = snow, exact.
  A "Schaukel" 🛝       — swing/slide playground, exact.
  A "Schwan" 🦢         — swan, exact.
PHONEMES — R:
  A "Regen" 🌧️          — rain cloud, exact.
  A "Rabe" 🐦‍⬛           — black bird = raven, exact.
  A "Regenbogen" 🌈     — rainbow, exact.
  I "Karussell" 🎠      — carousel, exact (intervocalic /r/).
  I "Marienkäfer" 🐞    — ladybug, exact (intervocalic /r/).
PHONEMES — S:
  A "Saft" 🧃           — juice box, exact (/z/ Anlaut).
  A "Salz" 🧂           — salt shaker, exact.
  A "Sonnenblume" 🌻    — sunflower, exact.
  I "Vase" 🏺           — vase, exact (intervocalic /z/; v-spelling).
  E "Fuß" 🦶            — foot, exact (final /s/).
  E "Nuss" 🌰           — chestnut = nut, exact (final /s/).

MINIMAL_PAIRS (one-phoneme contrasts, both drawable):
  Hase/Nase 🐰/👃           — h ↔ n.
  Hase/Vase 🐰/🏺           — h ↔ v(w-Laut).
  Nase/Vase 👃/🏺           — n ↔ v(w-Laut).
  Hand/Sand 🖐️/🏖️           — h ↔ s.
  Bein/Wein 🦵/🍷           — b ↔ w.
  Katze/Tatze 🐈/🐾         — k ↔ t.
  Bus/Busch 🚌/🌳           — s ↔ sch (final).
  Hund/Mund 🐶/👄           — h ↔ m.
  Rose/Dose 🌹/🥫           — r ↔ d.

SYLLABLES (verified Sprechsilben):
  Hund 🐶 (1) · Maus 🐭 (1) · Brot 🍞 (1) · Fisch 🐟 (1)
  Igel 🦔 (I-gel 2) · Sofa 🛋️ (So-fa 2) · Kerze 🕯️ (Ker-ze 2) · Schnecke 🐌 (Schne-cke 2) · Vogel 🐦 (Vo-gel 2) · Kamel 🐪 (Ka-mel 2)
  Pinguin 🐧 (Pin-gu-in 3) · Ananas 🍍 (A-na-nas 3) · Erdbeere 🍓 (Erd-bee-re 3) · Luftballon 🎈 (Luft-bal-lon 3)
  Krankenwagen 🚑 (Kran-ken-wa-gen 4) · Wassermelone 🍉 (Was-ser-me-lo-ne 5)

RHYMES (key+match rhyme; distractors do not):
  Hose/Dose 👖/🥫   (distract Ball ⚽, Maus 🐭)
  Hund/Mund 🐶/👄   (distract Ball ⚽, Rose 🌹)
  Nase/Vase 👃/🏺   (distract Sonne ☀️, Schuh 👟)
  Bein/Wein 🦵/🍷   (distract Ball ⚽, Hose 👖)
  Ball/Wal ⚽/🐳    (distract Maus 🐭, Sonne ☀️)
  Schnee/Tee ❄️/🍵  (distract Ball ⚽, Hund 🐶)

STICKERS (+16 unique, pure delight, no word-mapping needed):
  🐼 🐸 🦓 🦔 🐞 🦩 🦚 🌸 🍄 🌟 🎁 🍭 🦖 🐠 🌺 🦢

PRAISE (+8 German): Fantastisch! · Spitzenmäßig! · Das klang super! · Du machst das klasse! ·
  Hurra, geschafft! · Wunderbar! · Sauber gesprochen! · Du bist ein Plapper-Profi!

GREETINGS (+4 German): Hallöchen! Bist du bereit zum Plappern? · Juhu, da bist du ja! Los geht's! ·
  Schön dich zu sehen! Wir haben heute viel Spaß. · Hey! Ich bin Pepe und freue mich auf dich!

REJECTED for unfaithful/absent emoji (kept content strict):
  Hufeisen, Ofen, Pantoffel (F-I) · Decke, Hocker, Park, Hexe(/ks/-cluster) (K) ·
  Glühbirne, Wiege (G) · Tisch, Pinsel(no /ʃ/), Asche, Pinscher, Schubkarre (SCH) ·
  Radieschen, Ritter, Krone(cluster) (R) · Sänfte, Seestern, Sandale, Gans(misplaced), Riese (S) ·
  Lamm/Lachs(generic-sheep/fish), Lavendel, Locke (L).
*/
