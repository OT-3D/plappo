/* ============================================================
   GAME: "Zauberschlüssel" — der Lautschlüssel nach Sprachify.
   Ein Tier-Helfer zeigt den Trick, mit dem ein schwerer Laut
   "hervorkommt" (Rabe: Kra→k, Tiger: Grrr→r, Schlange: Schhh→sch).
   Das Kind macht es nach (aufnehmen & selbst hören) und übt dann
   den Laut in echten Wörtern. Mit Humor & Tieren statt Drill.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  function pickWords(ph){
    const out = [];
    ["A","I","E"].forEach(p=>(ph.words[p]||[]).forEach(w=> out.push(w)));
    return UI.shuffle(out).slice(0, 4);
  }
  // one-tap record + self-listen. Gives the success ⭐ right after recording,
  // then reveals a big "Weiter". opts = { label, onReward, onDone }.
  function recordBlock(stage, canRec, opts){
    opts = opts || {};
    let rewarded = false;
    const doReward = ()=>{ if(!rewarded){ rewarded = true; if(opts.onReward) opts.onReward(); } };
    const weiter = ()=> el("button",{class:"round-btn next big",
      onclick:()=>{ doReward(); if(opts.onDone) opts.onDone(); }},
      [el("span",{class:"b-emoji emoji"},"➡"),"Weiter"]);
    if(!canRec){ stage.appendChild(el("div",{class:"btn-row"},[ weiter() ])); return; }
    const recBtn = el("button",{class:"round-btn record big"},
      [el("span",{class:"b-emoji emoji"},"🎤"), el("span",{class:"rl"}, opts.label||"Mach es nach")]);
    const row = el("div",{class:"btn-row"},[recBtn]);
    stage.appendChild(row);
    recBtn.addEventListener("click", async ()=>{   // ONE tap -> records 3s -> plays you back -> ⭐
      const u = await UI.recordTake(recBtn, {onError:()=>{ if(!row.querySelector(".round-btn.next")){ recBtn.style.display="none"; row.appendChild(weiter()); } }});
      if(u){ doReward(); if(!row.querySelector(".round-btn.next")) row.appendChild(weiter()); }
    });
  }

  async function mount(root, ctx){
    const ph = ctx.phoneme || S.activePhonemes()[0];
    const key = (D.LAUTSCHLUESSEL && D.LAUTSCHLUESSEL[ph.id]) || null;
    const words = pickWords(ph);
    let step = -1, exited = false;   // -1 = trick intro, 0..n-1 = word rounds
    let canRec = await A.canRecord();
    const exit = ()=>{ exited = true; A.stopMic(); ctx.exit(); };

    root.appendChild(UI.topbar({ onHome: exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🔑 Zauberschlüssel"));
    const prog = UI.progressBar(0); root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"}); root.appendChild(stage);

    function renderTrick(){
      if(exited) return;
      stage.innerHTML = ""; prog.set(0);
      if(!key){ step = 0; renderWord(); return; }   // no key -> straight to words
      // a funny mouth animation SHOWS where the tongue/lips go (front sounds),
      // or the helper animal for the back sounds (k/g/r)
      const visual = (key.face && window.PlappoFace)
        ? PlappoFace.build(key.face)
        : el("div",{class:"big-emoji emoji zs-animal"}, key.animal);
      stage.appendChild(el("div",{class:"word-card"},[ visual, el("div",{class:"word-text"}, "Der Zaubertrick") ]));
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"}, key.trick));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); UI.say(key.trick); }},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Hör zu"]),
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); UI.say(key.again); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"])
      ]));
      recordBlock(stage, canRec, {
        label:"Mach es nach",
        onReward:()=>{ UI.reward({ worldId:"zauber", stars:1 }); },
        onDone:()=>{ UI.say("Toll gemacht! Jetzt probieren wir echte Wörter."); step = 0; setTimeout(renderWord, 800); }
      });
      setTimeout(()=>UI.say(key.trick), 350);
    }

    function highlight(word){
      const g = ph.id.toLowerCase(), i = word.toLowerCase().indexOf(g);
      if(i<0) return document.createTextNode(word);
      const s = el("span",{});
      s.appendChild(document.createTextNode(word.slice(0,i)));
      s.appendChild(el("span",{class:"tgt"}, word.slice(i,i+g.length)));
      s.appendChild(document.createTextNode(word.slice(i+g.length)));
      return s;
    }

    function renderWord(){
      if(exited) return;
      if(step >= words.length){ return finish(); }
      stage.innerHTML = ""; prog.set((step+1)/(words.length+1));
      const [text, emoji] = words[step];
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, emoji),
        el("div",{class:"word-text"}, [highlight(text)])
      ]));
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"}, "Jetzt mit deinem Zauber-Laut!"));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); UI.say(text,{rate:0.7}); }},
          [el("span",{class:"b-emoji emoji"},"🔊"),"Hör zu"])
      ]));
      recordBlock(stage, canRec, {
        label:"Sprich nach",
        onReward:()=>{ UI.reward({ worldId:"zauber", stars:1 }); S.addPhonemeRep(ph.id); },
        onDone:()=>{ step++; setTimeout(renderWord, 700); }
      });
      setTimeout(()=>UI.say(text,{rate:0.7}), 350);
    }

    function finish(){
      if(exited) return;
      prog.set(1);
      UI.bigCheer("Zauberschlüssel gefunden!"); UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, key ? key.animal : ph.emoji),
        el("div",{class:"word-text"}, "Stark!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{ step=-1; words.splice(0, words.length, ...pickWords(ph)); renderTrick(); }},
          [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    renderTrick();
  }

  window.PlappoGames.push({
    id:"zauber", order:1.5, title:"Zauberschlüssel", subtitle:"Tier-Trick für deinen Laut",
    emoji:"🔑", color:"c-teal", needsPhoneme:true, mount
  });
})();
