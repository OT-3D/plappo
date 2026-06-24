/* ============================================================
   GAME: "Welches Wort?" — Minimalpaar-Identifikation.
   Pepe says ONE word of a minimal pair; child taps the matching
   picture. A LISTENING task (no speech produced) -> safe to auto-score.
   Trains auditory discrimination of the trained contrast.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  const ROUNDS = 6;

  function mount(root, ctx){
    let round = 0, busy = false, cur = null;

    root.appendChild(UI.topbar({ onHome: ctx.exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🎯 Welches Wort?"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function nextRound(){
      prog.set(round/ROUNDS);
      if(round >= ROUNDS){ return finish(); }
      const pair = UI.rand(D.MINIMAL_PAIRS);
      // pick which member is the target word Pepe says
      const targetIsA = Math.random() < 0.5;
      const target = targetIsA ? pair.a : pair.b;
      const other  = targetIsA ? pair.b : pair.a;
      cur = { target };

      // random left/right order of the two choices
      const members = Math.random() < 0.5 ? [target, other] : [other, target];

      stage.innerHTML = "";
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"},
        "Welches Wort hast du gehört? Tipp es an!"));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:playTarget},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Nochmal"])
      ]));
      const grid = el("div",{class:"choice-grid"}, members.map(m=>{
        const [text, emoji] = m;
        const btn = el("button",{class:"choice"},[
          el("div",{class:"c-emoji emoji"}, emoji),
          el("div",{class:"c-label"}, text)
        ]);
        btn.addEventListener("click", ()=> answer(btn, m));
        return btn;
      }));
      stage.appendChild(grid);
      setTimeout(playTarget, 350);
    }

    async function playTarget(){
      if(busy) return; busy = true;
      await UI.say(cur.target[0], {rate:0.75});
      busy = false;
    }

    function answer(btn, picked){
      if(busy) return;
      if(picked === cur.target){
        btn.classList.add("correct");
        UI.reward({ worldId:"minimalpair", stars:1 });
        round++;
        setTimeout(nextRound, 800);
      } else {
        btn.classList.add("wrong");
        setTimeout(()=>btn.classList.remove("wrong"), 500);
        UI.tryAgain();
        setTimeout(playTarget, 500);
      }
    }

    function finish(){
      prog.set(1);
      UI.bigCheer("Super gehört!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, "🎯"),
        el("div",{class:"word-text"}, "Klasse!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{ round=0; nextRound(); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:ctx.exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    nextRound();
  }

  window.PlappoGames.push({
    id:"minimalpair", order:4, title:"Welches Wort?", subtitle:"Genau hinhören",
    emoji:"🎯", color:"c-coral", needsPhoneme:false, mount
  });
})();
