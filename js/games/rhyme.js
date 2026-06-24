/* ============================================================
   GAME: "Reim-Paare" — Reim-Erkennung (phonologische Bewusstheit).
   Pepe shows a key word and asks which picture rhymes with it.
   Child taps the matching rhyme word among distractors. This is a
   LISTENING / matching task (no speech required) -> safe to auto-score.
   Tapping any choice speaks it so the child hears the rhyme too.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  const ROUNDS = 6;

  function mount(root, ctx){
    let round = 0, busy = false;
    // shuffle the rhyme set; loop if there are fewer than ROUNDS entries
    const deck = UI.shuffle(D.RHYMES);

    root.appendChild(UI.topbar({ onHome: ctx.exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🎵 Reim-Paare"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function nextRound(){
      prog.set(round/ROUNDS);
      if(round >= ROUNDS){ return finish(); }
      busy = false;
      const item = deck[round % deck.length];
      const key = item.key;

      stage.innerHTML = "";

      // key word card
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, key[1]),
        el("div",{class:"word-text"}, key[0])
      ]));

      function ask(){ UI.say("Was reimt sich auf " + key[0] + "?"); }

      // listen button repeats the question
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); ask(); }},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Anhören"])
      ]));

      // choices: correct match + two distractors, shuffled
      const choices = UI.shuffle([item.match, item.distractors[0], item.distractors[1]]);
      const grid = el("div",{class:"choice-grid cols-3"});
      choices.forEach(opt=>{
        const btn = el("button",{class:"choice", onclick:()=>pick(opt, btn, key, item.match)},[
          el("div",{class:"c-emoji emoji"}, opt[1]),
          el("div",{class:"c-label"}, opt[0])
        ]);
        grid.appendChild(btn);
      });
      stage.appendChild(grid);

      // ask once on arrival
      setTimeout(ask, 300);
    }

    function pick(opt, btn, key, match){
      if(busy) return;
      // speak the tapped word so the child hears the rhyme
      UI.say(opt[0]);
      if(opt === match){
        busy = true;
        btn.classList.add("correct");
        UI.reward({ worldId:"rhyme", stars:1 });
        round++;
        // reinforce the rhyme: key ... match
        setTimeout(()=>{ UI.say(key[0] + " ... " + match[0]); }, 350);
        setTimeout(nextRound, 900);
      } else {
        btn.classList.add("wrong");
        setTimeout(()=>btn.classList.remove("wrong"), 500);
        UI.tryAgain();
      }
    }

    function finish(){
      prog.set(1);
      UI.bigCheer("Reim-Profi!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, "🎵"),
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
    id:"rhyme", order:7, title:"Reim-Paare", subtitle:"Was reimt sich?",
    emoji:"🎵", color:"c-grape", needsPhoneme:false, mount
  });
})();
