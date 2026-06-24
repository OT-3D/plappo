/* ============================================================
   GAME: "Wörter-Welt" — Wortschatz + auditive Worterkennung.
   Pepe names a target word; child finds the matching picture from
   a 3x2 grid. This is a LISTENING task (no speech produced) ->
   safe to auto-score. Trains target-sound vocabulary recognition.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  const GOAL = 6;          // correct finds per session
  const BOARD = 6;         // cards shown per board

  // flatten Anlaut/Inlaut/Auslaut into one [text,emoji] pool
  function wordPool(ph){
    const out = [];
    ["A","I","E"].forEach(pos=>{ (ph.words[pos]||[]).forEach(w=> out.push(w)); });
    return out;
  }

  function mount(root, ctx){
    const ph = ctx.phoneme || S.activePhonemes()[0];
    const pool = wordPool(ph);
    let found = 0, busy = false;
    let board = [], cards = [], doneOnBoard = [], target = null;

    root.appendChild(UI.topbar({ onHome: ctx.exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🔎 Wörter-Welt"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    // build a fresh board of BOARD distinct words
    function newBoard(){
      board = UI.shuffle(pool).slice(0, Math.min(BOARD, pool.length));
      doneOnBoard = board.map(()=>false);
      renderBoard();
      pickTarget();
    }

    function renderBoard(){
      stage.innerHTML = "";
      const grid = el("div",{class:"choice-grid cols-3"});
      cards = board.map((w, i)=>{
        const [text, emoji] = w;
        const btn = el("button",{class:"choice", onclick:()=>choose(i)},[
          el("div",{class:"c-emoji emoji"}, emoji),
          el("div",{class:"c-label"}, text)
        ]);
        grid.appendChild(btn);
        return btn;
      });
      stage.appendChild(grid);

      // "listen again" repeats the current prompt
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); say(); }},[
          el("span",{class:"b-emoji emoji"}, "🔊"), "Nochmal"
        ])
      ]));
    }

    // choose a not-yet-found word on the board as the new target
    function pickTarget(){
      const open = [];
      board.forEach((w,i)=>{ if(!doneOnBoard[i]) open.push(i); });
      if(open.length === 0){ return newBoard(); }
      const i = UI.rand(open);
      target = i;
      setTimeout(say, 350);
    }

    function say(){
      const [text] = board[target];
      UI.say("Wo ist " + text + "?");
    }

    function choose(i){
      if(busy) return;
      if(doneOnBoard[i]) return;            // already found -> inert
      if(i === target){
        busy = true;
        const card = cards[i];
        card.classList.add("correct");
        doneOnBoard[i] = true;
        found++;
        prog.set(found / GOAL);
        UI.reward({ worldId:"wordworld", stars:1 });
        S.addPhonemeRep(ph.id);   // grow this sound's plant in the Laut-Garten
        if(found >= GOAL){
          setTimeout(finish, 900);
        } else {
          setTimeout(()=>{
            card.classList.add("dim");       // keep it visible but inert
            busy = false;
            pickTarget();
          }, 800);
        }
      } else {
        const card = cards[i];
        card.classList.add("wrong");
        setTimeout(()=>card.classList.remove("wrong"), 500);
        UI.tryAgain();
        // do NOT advance
      }
    }

    function finish(){
      prog.set(1);
      UI.bigCheer("Alle gefunden!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, ph.emoji),
        el("div",{class:"word-text"}, "Super gesucht!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{ found=0; busy=false; prog.set(0); newBoard(); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:ctx.exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    newBoard();
  }

  window.PlappoGames.push({
    id:"wordworld", order:2, title:"Wörter-Welt", subtitle:"Wörter finden",
    emoji:"🔎", color:"c-grape", needsPhoneme:true, mount
  });
})();
