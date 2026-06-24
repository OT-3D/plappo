/* ============================================================
   GAME: "Silben klatschen" — Silbensegmentierung (phonological
   awareness). Pepe says a word; the child claps once per syllable
   and/or taps how many syllables it has. Auto-scored against the
   word's known syllable count -> safe to auto-score.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  const ROUNDS = 6;

  function mount(root, ctx){
    let round = 0, busy = false, cur = null, taps = 0;

    root.appendChild(UI.topbar({ onHome: ctx.exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "👏 Silben klatschen"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function nextRound(){
      prog.set(round/ROUNDS);
      if(round >= ROUNDS){ return finish(); }
      const [text, emoji, syll] = UI.rand(D.SYLLABLES);
      cur = { text, emoji, syll };
      taps = 0;

      stage.innerHTML = "";

      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, emoji),
        el("div",{class:"word-text"}, text)
      ]));

      // listen button repeats the word
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); say(); }},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Hör zu"])
      ]));

      // fun clap feedback: each clap lights one dot in the row
      const dotRow = el("div",{class:"syll-row"});
      stage.appendChild(dotRow);
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn play big", onclick:()=>{
          UI.sfx("tap");
          taps++;
          dotRow.appendChild(el("span",{class:"syll-dot lit"}, String(taps)));
        }},[el("span",{class:"b-emoji emoji"},"👏"),"Klatschen"]),
        el("button",{class:"round-btn next", onclick:()=>answer(taps)},
          [el("span",{class:"b-emoji emoji"},"✅"),"Fertig"])
      ]));

      // primary path: tap how many syllables (1–4)
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"},
        "Wie viele Silben? Klatsch mit – oder tipp die Zahl."));
      const choiceRow = el("div",{class:"syll-row"});
      [1,2,3,4].forEach(n=>{
        choiceRow.appendChild(el("button",{class:"syll-dot", onclick:()=>answer(n)}, String(n)));
      });
      stage.appendChild(choiceRow);

      // model the word automatically on arrival, then invite clapping
      setTimeout(say, 300);
    }

    function say(){
      if(!cur) return;
      UI.say(cur.text, {rate:0.7});
      setTimeout(()=>UI.say("Wie viele Silben? Klatsch mit!"), 900);
    }

    function answer(count){
      if(busy) return;
      if(count === cur.syll){
        busy = true;
        UI.reward({ worldId:"syllables", stars:1 });
        round++;
        setTimeout(()=>{ busy = false; nextRound(); }, 900);
      } else {
        taps = 0;
        UI.tryAgain();
        setTimeout(()=>{ if(cur) UI.say(cur.text, {rate:0.7}); }, 500);
        // clear the clap dots so the child can start fresh
        const dots = stage.querySelector(".syll-row");
        if(dots) dots.innerHTML = "";
      }
    }

    function finish(){
      prog.set(1);
      UI.bigCheer("Klasse geklatscht!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, "👏"),
        el("div",{class:"word-text"}, "Toll!")
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
    id:"syllables", order:6, title:"Silben klatschen", subtitle:"Wie viele Silben?",
    emoji:"👏", color:"c-sun", needsPhoneme:false, mount
  });
})();
