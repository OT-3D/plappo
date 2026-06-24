/* ============================================================
   PLAPPO – App shell: boot, hub, world picker, album, parent area.
   Games self-register into window.PlappoGames (array).
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el, rand = UI.rand;
  const app = document.getElementById("app");
  const GAMES = (window.PlappoGames || []).slice().sort((a,b)=>(a.order||0)-(b.order||0));

  function clear(){ app.innerHTML = ""; A.stopSpeak(); UI.stopIdle(); }

  /* ---------------- boot / audio gate ---------------- */
  function boot(){
    const gate = document.getElementById("audio-gate");
    const btn = document.getElementById("gate-btn");
    let started = false;
    const start = (ev)=>{
      if(ev) ev.preventDefault();         // stop the synthetic click after touchend on iOS
      if(started) return;                 // idempotent: never boot twice
      started = true;
      A.unlock();                         // unlock iOS audio inside the gesture
      UI.mountPepe();
      gate.classList.add("hidden");
      setTimeout(()=>{ gate.style.display="none"; }, 450);
      hub(true);
    };
    btn.addEventListener("touchend", start);
    btn.addEventListener("click", start);
  }

  /* ---------------- HUB ---------------- */
  function hub(greet){
    clear(); UI.hidePepe(false);
    app.appendChild(UI.topbar({ onParent:openParentGate }));

    app.appendChild(el("div",{class:"hub-hero"},[
      el("div",{class:"pepe emoji", onclick:()=>UI.say(rand(D.GREETINGS))}, "🦜"),
      el("h2",{},"Plappo"),
      el("p",{},"Tipp ein Spiel an und sprich mit Pepe!")
    ]));

    const grid = el("div",{class:"tile-grid"});
    GAMES.forEach(g=>{
      const done = S.progressOf(g.id);
      const pips = el("div",{class:"pips"});
      for(let i=0;i<5;i++) pips.appendChild(el("i",{class: i < Math.min(5, done) ? "on":""}));
      grid.appendChild(el("button",{class:`tile ${g.color}`, onclick:()=>openGame(g)},[
        el("div",{class:"tile-emoji emoji"}, g.emoji),
        el("div",{class:"tile-label"}, g.title),
        el("div",{class:"tile-sub"}, g.subtitle||""),
        pips
      ]));
    });
    // playground tile (reward mini-games)
    grid.appendChild(el("button",{class:"tile c-coral", onclick:openPlayground},[
      el("div",{class:"tile-emoji emoji"}, "🎡"),
      el("div",{class:"tile-label"}, "Spielplatz"),
      el("div",{class:"tile-sub"}, "Spiele zocken")
    ]));
    // progress tile (Laut-Garten + diary)
    grid.appendChild(el("button",{class:"tile c-leaf", onclick:openProgress},[
      el("div",{class:"tile-emoji emoji"}, "🌱"),
      el("div",{class:"tile-label"}, "Mein Fortschritt"),
      el("div",{class:"tile-sub"}, "Garten & Tagebuch")
    ]));
    // sticker album tile
    grid.appendChild(el("button",{class:"tile c-sun", onclick:openAlbum},[
      el("div",{class:"tile-emoji emoji"}, "📒"),
      el("div",{class:"tile-label"}, "Meine Sticker"),
      el("div",{class:"tile-sub"}, S.stickers.length+" gesammelt")
    ]));
    app.appendChild(grid);

    if(greet){ setTimeout(()=>UI.say(rand(D.GREETINGS)), 350); }
  }

  /* ---------------- open a game (maybe pick a sound first) ---------------- */
  function openGame(g){
    if(g.needsPhoneme){
      const ph = S.activePhonemes();
      if(ph.length <= 1){ launch(g, ph[0]); }
      else if(S.ageBand === "2-4"){ launch(g, UI.rand(ph)); }  // youngest: skip the abstract sound chooser
      else pickPhoneme(g);
    } else {
      launch(g, null);
    }
  }
  function launch(g, phoneme){
    clear(); UI.hidePepe(false);
    g.mount(app, { phoneme, exit: ()=>hub(false), home: ()=>hub(false) });
  }

  function pickPhoneme(g){
    clear();
    app.appendChild(UI.topbar({ onHome:()=>hub(false) }));
    app.appendChild(el("h2",{class:"screen-title"}, g.title));
    app.appendChild(el("p",{class:"screen-sub"}, "Welchen Laut möchtest du üben?"));
    const grid = el("div",{class:"tile-grid"});
    S.activePhonemes().forEach(p=>{
      grid.appendChild(el("button",{class:`tile ${p.color}`, onclick:()=>launch(g,p)},[
        el("div",{class:"tile-emoji emoji"}, p.emoji),
        el("div",{class:"tile-label"}, p.label)
      ]));
    });
    app.appendChild(grid);
    setTimeout(()=>UI.say("Welchen Laut üben wir?"), 250);
  }

  /* ---------------- sticker album ---------------- */
  function openAlbum(){
    clear();
    app.appendChild(UI.topbar({ onHome:()=>hub(false) }));
    app.appendChild(el("h2",{class:"screen-title"}, "📒 Meine Sticker"));
    const left = (S.starsPerSticker - (S.stars % S.starsPerSticker)) % S.starsPerSticker;
    app.appendChild(el("p",{class:"screen-sub"},
      left===0 ? "Sammle ⭐ und hol dir Sticker!" : `Noch ${left} ⭐ bis zum nächsten Sticker!`));
    const grid = el("div",{class:"album-grid"});
    const total = D.STICKERS.length;
    for(let i=0;i<total;i++){
      const got = S.stickers[i];
      grid.appendChild(got
        ? el("button",{class:"album-slot", onclick:()=>playSticker(got)}, el("span",{class:"emoji"}, got))
        : el("div",{class:"album-slot empty"}, el("span",{class:"emoji"}, "❓")));
    }
    app.appendChild(grid);
    setTimeout(()=>UI.say(S.stickers.length ? "Tipp einen Sticker an – schau, was passiert!" : "Sammle Sterne und hol dir Sticker!"), 200);
  }

  /* ---------------- parent area (behind a math gate) ---------------- */
  function openParentGate(){
    UI.hidePepe(true);
    const a = 3 + Math.floor(Math.random()*6);   // 3..8
    const b = 2 + Math.floor(Math.random()*7);   // 2..8
    const answer = a*b;
    const opts = new Set([answer]);
    while(opts.size < 6){ opts.add(answer + (Math.floor(Math.random()*17)-8)); }
    const choices = UI.shuffle([...opts]).filter(x=>x>0);

    const gateWrap = el("div",{class:"parent-gate"});
    const box = el("div",{class:"gate-box"});
    box.appendChild(el("h3",{},"Nur für Erwachsene"));
    box.appendChild(el("p",{},"Bitte löse die Aufgabe, um in den Elternbereich zu gelangen."));
    box.appendChild(el("div",{class:"gate-q"}, `${a} × ${b} = ?`));
    const keys = el("div",{class:"gate-keys"});
    choices.forEach(c=>{
      keys.appendChild(el("button",{onclick:()=>{
        if(c===answer){ gateWrap.remove(); openParent(); }
        else { box.querySelector(".gate-q").textContent = "Versuch es nochmal: "+a+" × "+b+" = ?"; }
      }}, String(c)));
    });
    box.appendChild(keys);
    box.appendChild(el("button",{class:"link-btn", onclick:()=>{ gateWrap.remove(); UI.hidePepe(false); }}, "Zurück"));
    gateWrap.appendChild(box);
    document.body.appendChild(gateWrap);
  }

  function openParent(){
    clear(); UI.hidePepe(true);
    app.appendChild(UI.topbar({ onHome:()=>{ UI.hidePepe(false); hub(false); } }));
    const panel = el("div",{class:"parent-panel"});
    panel.appendChild(el("h2",{class:"screen-title"}, "⚙️ Elternbereich"));

    // Age band
    const ageCard = el("div",{class:"panel-card"});
    ageCard.appendChild(el("h4",{}, "Alter deines Kindes"));
    ageCard.appendChild(el("p",{class:"disclaimer"}, "Bestimmt, welche Laute angeboten werden (nach Lauterwerb)."));
    const ageSeg = el("div",{class:"seg"});
    ["2-4","5-7","8-10"].forEach(band=>{
      ageSeg.appendChild(el("button",{class: S.ageBand===band?"on":"", onclick:()=>{ S.setAge(band); openParent(); }}, "Jahre "+band));
    });
    ageCard.appendChild(ageSeg);
    panel.appendChild(ageCard);

    // Target sounds
    const tCard = el("div",{class:"panel-card"});
    tCard.appendChild(el("h4",{}, "Ziel-Laute (optional)"));
    tCard.appendChild(el("p",{class:"disclaimer"}, "Standard: passend zum Alter. Du kannst gezielt einzelne Laute wählen, z. B. wenn dein Kind /sch/ übt."));
    const tSeg = el("div",{class:"seg"});
    D.PHONEMES.forEach(p=>{
      const on = S.isPhonemeUnlocked(p.id);
      tSeg.appendChild(el("button",{class: on?"on":"", onclick:()=>{ S.toggleTarget(p.id); openParent(); }},
        p.emoji+" "+p.id));
    });
    tCard.appendChild(tSeg);
    tCard.appendChild(el("button",{class:"link-btn", onclick:()=>{ S.setTargets(null); openParent(); }}, "Zurück auf Alters-Standard"));
    panel.appendChild(tCard);

    // Sound toggle
    const sCard = el("div",{class:"panel-card"});
    sCard.appendChild(el("h4",{}, "Ton"));
    const sSeg = el("div",{class:"seg"});
    sSeg.appendChild(el("button",{class:S.soundOn?"on":"", onclick:()=>{ S.setSound(true); openParent(); }}, "🔊 An"));
    sSeg.appendChild(el("button",{class:!S.soundOn?"on":"", onclick:()=>{ S.setSound(false); openParent(); }}, "🔇 Aus"));
    sCard.appendChild(sSeg);
    if(!A.hasVoice){
      sCard.appendChild(el("p",{class:"disclaimer", style:"margin-top:10px"},
        "Hinweis: Auf diesem Gerät wurde keine deutsche Sprachstimme gefunden. Die Wörter werden trotzdem angezeigt; für gesprochene Wörter bitte eine deutsche Stimme im System installieren."));
    }
    panel.appendChild(sCard);

    // How to practise (parent coaching) — the FAU/dbl home-practice model
    const hCard = el("div",{class:"panel-card"});
    hCard.appendChild(el("h4",{}, "So übt ihr zusammen"));
    hCard.appendChild(el("div",{class:"disclaimer", html:
      "<b>1. Hören</b> – Pepe spricht das Wort vor. <br>"+
      "<b>2. Nachsprechen</b> – dein Kind spricht nach.<br>"+
      "<b>3. Aufnehmen & Anhören</b> – gemeinsam vergleichen: „Klingt es gleich?"+
      "“<br><b>4. Du entscheidest</b> – ✓ wenn es gut klang, sonst gemeinsam nochmal. "+
      "Lob und Sterne motivieren. Kurze Einheiten (2–4: ~5 Min, 5–7: ~10 Min) wirken am besten."}));
    panel.appendChild(hCard);

    // Sonjas Methode — 3 Heim-Rituale (Sprachify) + No-Gos
    const mCard = el("div",{class:"panel-card"});
    mCard.appendChild(el("h4",{}, "🌱 Üben wie beim Zähneputzen"));
    mCard.appendChild(el("div",{class:"disclaimer", html:
      "Nicht lange üben, sondern <b>3× täglich 3 Minuten</b> spielerisch im Alltag. "+
      "„Sprache beginnt nicht im Mund\" – zuerst <b>Hören</b>, dann der Laut.<br><br>"+
      "<b>3 einfache Rituale für zu Hause:</b><br>"+
      "🦶 <b>Fersengang</b> – auf dem Weg ins Bad auf den Fersen gehen (gibt Kraft für hintere Laute k, g, r); auf Zehenspitzen für t.<br>"+
      "🥕 <b>Mund-Fühlen beim Essen</b> – Karotte mal hart/weich, eckig, kalt: „Wie fühlt sich das im Mund an? Wer hat die härteste?\"<br>"+
      "👂 <b>Lausch-Spiel unterwegs</b> – „Aus welcher Richtung kommt das? Welches Tier/Auto war das?\""}));
    panel.appendChild(mCard);

    // Humor & Druck raus (Koko / verhexte Tage)
    const kCard = el("div",{class:"panel-card"});
    kCard.appendChild(el("h4",{}, "🦜 Mit Humor & ohne Druck"));
    kCard.appendChild(el("div",{class:"disclaimer", html:
      "Fehler <b>nie</b> aufs Kind beziehen („Du kannst das nicht, nochmal\"). Lieber auf den Mund/das Maskottchen: "+
      "„Mein Mund schläft heute\" oder „Pepe hat Quatschwasser getrunken\".<br>"+
      "Nicht ständig erinnern – ein <b>Spielfigur-Trick</b>: „Koko passt heute auf die K-Wörter auf!\" "+
      "Und ein <b>verhexter Tag</b> darf sein: Laut darf mal aussetzen, einfach entspannen. "+
      "<b>Mit Humor gewinnt man alle zum Lernen.</b>"}));
    panel.appendChild(kCard);

    // Disclaimer / safety
    const dCard = el("div",{class:"panel-card"});
    dCard.appendChild(el("h4",{}, "Wichtig"));
    dCard.appendChild(el("p",{class:"disclaimer"},
      "Plappo ist ein Spiel zum Üben und Anregen. Es ersetzt keine logopädische Diagnostik oder Therapie. "+
      "Bei anhaltenden Auffälligkeiten (z. B. mit 2 Jahren weniger als 50 Wörter oder keine Zweiwortsätze, "+
      "Lispeln nach 4½ Jahren, mit 4 Jahren für Fremde schwer verständlich, "+
      "Stottern mit Anstrengung, Verlust bereits gekonnter Wörter) wende dich an Kinderärzt:in, HNO oder Logopäd:in. "+
      "Alle Daten (Sterne, Aufnahmen) bleiben nur auf diesem Gerät."));
    panel.appendChild(dCard);

    app.appendChild(panel);
  }

  /* ---------------- Spielplatz: reward mini-games unlocked with stars ---------------- */
  function openPlayground(){
    clear(); UI.hidePepe(false);
    app.appendChild(UI.topbar({ onHome:()=>hub(false) }));
    app.appendChild(el("h2",{class:"screen-title"}, "🎡 Spielplatz"));
    app.appendChild(el("p",{class:"screen-sub"}, "Erspiel dir mit ⭐ Spiele zum Zocken!"));
    const fun = (window.PlappoFun||[]).slice().sort((a,b)=>(a.unlockStars||0)-(b.unlockStars||0));
    const grid = el("div",{class:"tile-grid"});
    if(!fun.length) grid.appendChild(el("p",{class:"disclaimer"}, "Bald gibt es hier Spiele!"));
    fun.forEach(g=>{
      const unlocked = S.stars >= (g.unlockStars||0);
      const tile = el("button",{class:"tile c-grape"+(unlocked?"":" locked"),
        onclick:()=> unlocked ? launchFun(g) : lockedHint(g)},[
        el("div",{class:"tile-emoji emoji"}, g.emoji),
        el("div",{class:"tile-label"}, g.title),
        el("div",{class:"tile-sub"}, unlocked ? "Spielen!" : ("Noch "+((g.unlockStars||0)-S.stars)+" ⭐"))
      ]);
      if(!unlocked) tile.appendChild(el("div",{class:"lock emoji"}, "🔒"));
      grid.appendChild(tile);
    });
    app.appendChild(grid);
    const anyUnlocked = fun.some(g=> S.stars >= (g.unlockStars||0));
    setTimeout(()=>UI.say(anyUnlocked ? "Such dir ein Spiel aus!" : "Sammle Sterne und schalte Spiele frei!"), 250);
  }
  function lockedHint(g){
    UI.sfx("wrongSoft");
    UI.say("Sammle noch "+((g.unlockStars||0)-S.stars)+" Sterne, dann kannst du das spielen!");
  }
  function launchFun(g){
    clear(); UI.hidePepe(false);
    g.mount(app, { exit: openPlayground });
  }

  /* ---------------- sticker tap -> little character "video" ---------------- */
  const ST_FLY  = ["🦜","🦋","🐝","🐦","🦅","🦉","🕊️","🦢","🚀","🎈","🛸","🪁","🐉","🦇"];
  const ST_SWIM = ["🐳","🐬","🐙","🐢","🐠","🐡","🦈","🐧","🦭","🐟","🦀","🦐"];
  const ST_HOP  = ["🐰","🐸","🦘","🐇","🦗","🐿️","🦒"];
  function stArchetype(e){ return ST_FLY.includes(e)?"fly":ST_SWIM.includes(e)?"swim":ST_HOP.includes(e)?"hop":"dance"; }

  function playSticker(emoji){
    const arche = stArchetype(emoji);
    const stage = el("div",{class:"sticker-stage", onclick:()=>stage.remove()});
    const scene = el("div",{class:"sticker-scene"});
    scene.appendChild(el("div",{class:"st-char emoji st-"+arche}, emoji));
    for(let i=0;i<9;i++){ const sp=el("div",{class:"st-spark emoji"},"✨");
      sp.style.left=(8+Math.random()*84)+"%"; sp.style.top=(8+Math.random()*72)+"%";
      sp.style.animationDelay=(Math.random()*1.4)+"s"; scene.appendChild(sp); }
    scene.appendChild(el("div",{class:"st-ground"}));
    scene.appendChild(el("div",{class:"st-hint"}, "Tipp zum Schließen"));
    stage.appendChild(scene);
    document.body.appendChild(stage);
    UI.sfx("star");
    UI.say(rand(["Hihi, das bin ich!","Schau mal, ich tanze!","Juhu!","Hallo, du!","Kuck mal!"]));
    setTimeout(()=>{ if(stage.parentNode) stage.remove(); }, 6500);
  }

  /* ---------------- progress: Laut-Garten + Sprach-Tagebuch ---------------- */
  function findEmoji(word){
    for(const p of D.PHONEMES) for(const pos of ["A","I","E"]) for(const w of (p.words[pos]||[])) if(w[0]===word) return w[1];
    for(const m of D.MINIMAL_PAIRS){ if(m.a[0]===word) return m.a[1]; if(m.b[0]===word) return m.b[1]; }
    for(const sy of D.SYLLABLES) if(sy[0]===word) return sy[1];
    return null;
  }

  function openProgress(){
    clear(); UI.hidePepe(false);
    app.appendChild(UI.topbar({ onHome:()=>hub(false) }));
    app.appendChild(el("h2",{class:"screen-title"}, "🌱 Mein Fortschritt"));
    const st = S.streak(), days = S.dayCount();
    app.appendChild(el("p",{class:"screen-sub"},
      st > 1 ? `🔥 ${st} Tage hintereinander geübt!` : (days ? `Schon ${days} Tag${days===1?"":"e"} geübt – stark!` : "Lass uns üben!")));

    app.appendChild(el("h3",{class:"sec-title"}, "🌳 Dein Laut-Garten"));
    app.appendChild(el("p",{class:"disclaimer",style:"margin:-6px 4px 10px"},
      "Jeder Laut wächst, je mehr du ihn übst – vom Samen bis zur Blüte."));
    const garden = el("div",{class:"garden-grid"});
    D.PHONEMES.forEach(p=>{
      const reps = S.phonemeReps(p.id), stg = S.phonemeStage(p.id);
      const frac = Math.min(1, reps / S.stageMaxReps());
      const unlocked = S.isPhonemeUnlocked(p.id);
      garden.appendChild(el("div",{class:"garden-card"+(unlocked?"":" locked")},[
        el("div",{class:"plant emoji"}, S.stageEmoji(stg)),
        el("div",{class:"plant-label"}, p.id),
        el("div",{class:"prog-wrap", style:"height:12px;max-width:120px"},
          el("div",{class:"prog-fill", style:`width:${Math.round(frac*100)}%`})),
        el("div",{class:"plant-sub"}, reps+"×")
      ]));
    });
    app.appendChild(garden);

    app.appendChild(el("h3",{class:"sec-title"}, "🎧 Mein Sprach-Tagebuch"));
    app.appendChild(el("p",{class:"disclaimer",style:"margin:-6px 4px 10px"},
      "Hör dich selbst – früher und jetzt – und merke, wie du besser wirst."));
    const diaryWrap = el("div",{class:"diary-wrap"});
    app.appendChild(diaryWrap);
    if(window.PlappoDiary && PlappoDiary.available){
      PlappoDiary.words().then(ws=>{
        if(!ws || !ws.length){
          diaryWrap.appendChild(el("p",{class:"disclaimer"},
            "Noch leer. Nimm im Spiel Sprich nach deine Stimme auf – dann erscheint hier dein Tagebuch!"));
          return;
        }
        ws.forEach(w=>{
          const emoji = findEmoji(w.word) || "🎤";
          diaryWrap.appendChild(el("button",{class:"diary-row", onclick:()=>compareModal(w.word, emoji)},[
            el("span",{class:"emoji dr-emoji"}, emoji),
            el("span",{class:"dr-word"}, w.word),
            el("span",{class:"dr-count"}, w.count+"×"),
            el("span",{class:"emoji dr-go"}, "▶")
          ]));
        });
      }).catch(()=>{});
    } else {
      diaryWrap.appendChild(el("p",{class:"disclaimer"}, "Auf diesem Gerät ist das Tagebuch nicht verfügbar."));
    }
    setTimeout(()=>UI.say("Schau, wie dein Garten wächst!"), 250);
  }

  function compareModal(word, emoji){
    if(!(window.PlappoDiary && PlappoDiary.available)) return;
    PlappoDiary.firstLatest(word).then(fl=>{
      const wrap = el("div",{class:"parent-gate", onclick:e=>{ if(e.target===wrap) wrap.remove(); }});
      const box = el("div",{class:"gate-box"});
      box.appendChild(el("div",{class:"emoji", style:"font-size:84px"}, emoji));
      box.appendChild(el("h3",{}, word));
      const multi = fl.count > 1;
      box.appendChild(el("p",{}, multi ? "Hör den Unterschied!" : "Deine Aufnahme:"));
      const row = el("div",{class:"compare-row"});
      if(fl.first && multi){
        row.appendChild(el("button",{class:"round-btn play", onclick:()=>{ const u=PlappoDiary.url(fl.first); UI.sfx("tap"); A.playback(u).finally(()=>URL.revokeObjectURL(u)); }},
          [el("span",{class:"b-emoji emoji"},"⏪"),"Früher"]));
      }
      row.appendChild(el("button",{class:"round-btn listen", onclick:()=>{ const u=PlappoDiary.url(fl.latest); UI.sfx("tap"); A.playback(u).finally(()=>URL.revokeObjectURL(u)); }},
        [el("span",{class:"b-emoji emoji"},"⭐"),"Jetzt"]));
      box.appendChild(row);
      box.appendChild(el("button",{class:"round-btn next", style:"margin-top:14px", onclick:()=>{ UI.sfx("tap"); UI.say(word,{rate:0.7}); }},
        [el("span",{class:"b-emoji emoji"},"🦜"),"So klingt Pepe"]));
      box.appendChild(el("button",{class:"link-btn", onclick:()=>wrap.remove()}, "Schließen"));
      wrap.appendChild(box); document.body.appendChild(wrap);
      if(multi) setTimeout(()=>UI.say("Hör, wie viel besser du schon sprichst!"), 200);
    }).catch(()=>{});
  }

  // expose minimal API and start
  window.PlappoApp = { hub };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
