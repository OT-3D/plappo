/* ============================================================
   GAME: "Quatsch-Maschine" — die Quatschwörter-Methode (Sprachify).
   Pepe spricht alberne Zauberwörter mit dem Ziel-Laut vor, das Kind
   spricht nach und hört sich selbst. Reiner Spaß = "neue Autobahn"
   für den Laut, ohne Drill. Mit Humor gewinnt man alle zum Lernen.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];
  const INTRO = "Wir haben Quatschwasser getrunken! Sprich mir die Zauberwörter nach. Hihi!";
  const GIGGLES = ["Hahaha!","So lustig!","Was für ein Quatsch!","Hihihi!","Voll albern!"];

  async function mount(root, ctx){
    const ph = ctx.phoneme || S.activePhonemes()[0];
    let words = UI.shuffle(((D.QUATSCH && D.QUATSCH[ph.id]) || ["Lalülü","Sosasu","Kakako"]).slice());
    let idx = 0, recUrl = null, recording = false, exited = false, rewardedWord = false;
    let canRec = await A.canRecord();
    const exit = ()=>{ exited = true; A.stopMic(); ctx.exit(); };
    function rewardWord(){ if(rewardedWord) return; rewardedWord = true;
      UI.reward({ worldId:"quatsch", stars:1, praise:false }); S.addPhonemeRep(ph.id); UI.say(UI.rand(GIGGLES)); }

    root.appendChild(UI.topbar({ onHome: exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🤪 Quatsch-Maschine"));
    const prog = UI.progressBar(0); root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"}); root.appendChild(stage);
    setTimeout(()=>UI.say(INTRO), 300);

    function say(){ UI.say(words[idx], {rate:0.85}); }

    function render(){
      if(exited) return;
      stage.innerHTML = ""; recUrl = null; recording = false; rewardedWord = false;
      const word = words[idx]; prog.set(idx / words.length);

      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji quatsch-face"}, "🤪"),
        el("div",{class:"word-text quatsch-wobble"}, word)
      ]));

      const listen = el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); say(); }},
        [el("span",{class:"b-emoji emoji"},"🔊"), "Hör zu"]);
      const recBtn = el("button",{class:"round-btn record big"},
        [el("span",{class:"b-emoji emoji"},"🎤"), el("span",{class:"rl"},"Sprich nach")]);
      if(canRec){
        recBtn.addEventListener("click", async ()=>{   // ONE tap -> records 3s -> plays you back -> ⭐
          const u = await UI.recordTake(recBtn, {onError:()=>{ recBtn.style.display="none"; }});
          if(u){ recUrl = u; rewardWord(); }
        });
      } else { recBtn.style.display = "none"; }
      stage.appendChild(el("div",{class:"btn-row"}, canRec ? [listen, recBtn] : [listen]));
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"}, "So ein Quatsch! Sprich es nach. 🤭"));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:advance},
          [el("span",{class:"b-emoji emoji"},"😜"), "Noch ein Quatschwort"])
      ]));
      setTimeout(say, 400);
    }

    function advance(){
      rewardWord();                 // ⭐ + giggle (no-op if already earned by recording)
      idx++;
      if(idx >= words.length){ prog.set(1); finish(); }
      else setTimeout(render, 700);
    }

    function finish(){
      if(exited) return;
      UI.bigCheer("So viel Quatsch!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, "🤪"),
        el("div",{class:"word-text"}, "Quatsch-Profi!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{ words = UI.shuffle(((D.QUATSCH && D.QUATSCH[ph.id])||["Lalülü"]).slice()); idx=0; render(); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    render();
  }

  window.PlappoGames.push({
    id:"quatsch", order:8, title:"Quatsch-Maschine", subtitle:"Lustige Zauberwörter",
    emoji:"🤪", color:"c-grape", needsPhoneme:true, mount
  });
})();
