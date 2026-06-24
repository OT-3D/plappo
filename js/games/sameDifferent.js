/* ============================================================
   GAME: "Gleich oder anders?" — auditive Diskrimination.
   Pepe says two words; child decides same/different. This is a
   LISTENING task (no speech produced) -> safe to auto-score.
   Uses minimal pairs so the contrast trains the target distinction.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  const ROUNDS = 6;

  function mount(root, ctx){
    let round = 0, busy = false, cur = null;

    root.appendChild(UI.topbar({ onHome: ctx.exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "👂 Gleich oder anders?"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function nextTrial(){
      prog.set(round/ROUNDS);
      if(round >= ROUNDS){ return finish(); }
      const pair = UI.rand(D.MINIMAL_PAIRS);
      const same = Math.random() < 0.45;
      // word A always; word B = same word (same) or its pair partner (different)
      const wordA = pair.a;
      const wordB = same ? pair.a : pair.b;
      cur = { same, wordA, wordB };

      stage.innerHTML = "";
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"},
        "Hör gut zu! Klingen die zwei Wörter gleich?"));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen big", onclick:playPair},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Anhören"])
      ]));
      const row = el("div",{class:"bigchoice-row"},[
        el("button",{class:"bigchoice same", onclick:()=>answer(true)},
          [el("span",{class:"bc-emoji emoji"},"🟰"),"Gleich"]),
        el("button",{class:"bigchoice diff", onclick:()=>answer(false)},
          [el("span",{class:"bc-emoji emoji"},"🔀"),"Anders"])
      ]);
      stage.appendChild(row);
      setTimeout(playPair, 350);
    }

    async function playPair(){
      if(busy) return; busy = true;
      await A.speak(cur.wordA[0], {rate:0.75});
      await new Promise(r=>setTimeout(r,400));
      await A.speak(cur.wordB[0], {rate:0.75});
      busy = false;
    }

    function answer(saidSame){
      if(busy) return;
      const correct = (saidSame === cur.same);
      if(correct){
        UI.reward({ worldId:"sameDiff", stars:1 });
        round++;
        setTimeout(nextTrial, 800);
      } else {
        UI.tryAgain();
        setTimeout(playPair, 500);
      }
    }

    function finish(){
      prog.set(1);
      UI.bigCheer("Tolle Ohren!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, "👂"),
        el("div",{class:"word-text"}, "Super gehört!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{ round=0; nextTrial(); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:ctx.exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    nextTrial();
  }

  window.PlappoGames.push({
    id:"sameDiff", order:3, title:"Gleich oder anders?", subtitle:"Gut zuhören",
    emoji:"👂", color:"c-sky", needsPhoneme:false, mount
  });
})();
