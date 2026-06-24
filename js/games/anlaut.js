/* ============================================================
   GAME: "Anlaut-Jagd" — Anlaut-Erkennung (phonological awareness).
   Child taps every picture whose word BEGINS with the target sound.
   Pure recognition -> safe to auto-score. Builds targets from the
   phoneme's own Anlaut words, distractors from OTHER phonemes' Anlaut
   words, mixed into a 6-card board.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  const BOARDS = 5;          // boards to complete to finish
  const CARDS  = 6;          // cards per board

  // collect Anlaut words ([text,emoji]) from every other phoneme
  function distractorPool(ph){
    const others = (S.activePhonemes && S.activePhonemes().length)
      ? S.activePhonemes() : D.PHONEMES;
    const out = [];
    others.forEach(p=>{
      if(p.id === ph.id) return;
      (p.words.A || []).forEach(w=> out.push(w));
    });
    // robustness: if too few (e.g. only one phoneme active), pull from full set
    if(out.length < CARDS){
      D.PHONEMES.forEach(p=>{
        if(p.id === ph.id) return;
        (p.words.A || []).forEach(w=> out.push(w));
      });
    }
    return out;
  }

  // take n items from arr, reusing (re-shuffling) when arr is short
  function pick(arr, n){
    const out = [];
    let bag = UI.shuffle(arr);
    while(out.length < n && bag.length){
      out.push(bag.shift());
      if(!bag.length && out.length < n) bag = UI.shuffle(arr);
    }
    return out;
  }

  function mount(root, ctx){
    const ph = ctx.phoneme || S.activePhonemes()[0];
    const targetPool = (ph.words.A || []).slice();
    const distPool   = distractorPool(ph);
    let board = 0;

    root.appendChild(UI.topbar({ onHome: ctx.exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🔤 Anlaut-Jagd"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function prompt(){
      var ex = (ph.label.split(" wie ")[1]) || (ph.words.A[0] && ph.words.A[0][0]) || "";
      return "Welche Bilder beginnen so wie " + ex + "?";
    }

    function render(){
      prog.set(board / BOARDS);
      if(board >= BOARDS){ return finish(); }

      // assemble a board: at least 2 targets + at least 2 distractors, 6 total
      const nTargets = 3;
      const targets = pick(targetPool, nTargets).map(w=> ({ w, target:true }));
      const distractors = pick(distPool, CARDS - nTargets).map(w=> ({ w, target:false }));
      const cards = UI.shuffle(targets.concat(distractors));
      let remaining = cards.filter(c=> c.target).length;

      stage.innerHTML = "";
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"}, prompt()));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); UI.say(prompt()); }},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Hören"])
      ]));

      const grid = el("div",{class:"choice-grid cols-3"});
      cards.forEach(c=>{
        const [text, emoji] = c.w;
        const btn = el("button",{class:"choice"},[
          el("div",{class:"c-emoji emoji"}, emoji),
          el("div",{class:"c-label"}, text)
        ]);
        btn.addEventListener("click", ()=>{
          if(c.done) return;
          if(c.target){
            c.done = true;
            btn.classList.add("correct");
            btn.style.pointerEvents = "none";
            UI.sfx("star");
            remaining--;
            if(remaining <= 0){
              UI.reward({ worldId:"anlaut", stars:1 });
              S.addPhonemeRep(ph.id);   // grow this sound's plant in the Laut-Garten
              board++;
              setTimeout(render, 800);
            }
          } else {
            btn.classList.add("wrong");
            UI.tryAgain();
            setTimeout(()=> btn.classList.remove("wrong"), 500);
          }
        });
        grid.appendChild(btn);
      });
      stage.appendChild(grid);

      // announce the task on arrival
      setTimeout(()=> UI.say(prompt()), 300);
    }

    function finish(){
      prog.set(1);
      UI.bigCheer("Tolle Anlaut-Jagd!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, ph.emoji),
        el("div",{class:"word-text"}, "Stark!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{ board=0; render(); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:ctx.exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    render();
  }

  window.PlappoGames.push({
    id:"anlaut", order:5, title:"Anlaut-Jagd", subtitle:"Welcher fängt damit an?",
    emoji:"🔤", color:"c-leaf", needsPhoneme:true, mount
  });
})();
