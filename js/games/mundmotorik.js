/* ============================================================
   GAME: "Aufwärmen" — geführte Mundmotorik-Aufwärmspiele.
   Ein animiertes Gesicht macht jede Übung VOR, das Kind macht mit.
   WICHTIG: reines Aufwärmen/Mundspiel zur Motivation —
   KEINE Korrektur von Lautfehlern, kein Therapie-Versprechen.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  function mount(root, ctx){
    const ex = UI.shuffle(D.MUNDMOTORIK).slice(0, 6);
    let idx = 0, ticking = false, timer = null;

    root.appendChild(UI.topbar({ onHome: ()=>{ stopTimer(); ctx.exit(); } }));
    root.appendChild(el("h2",{class:"screen-title"}, "👅 Aufwärmen"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } ticking = false; }

    function render(){
      stopTimer();
      prog.set(idx / ex.length);
      const e = ex[idx];
      stage.innerHTML = "";

      const face = window.PlappoFace ? PlappoFace.build(e.anim) : el("div",{class:"big-emoji emoji"}, e.emoji);
      const nameSlot = el("div",{class:"word-text"}, e.name);
      const countBadge = el("div",{class:"mf-count", style:"display:none"}, "");
      const card = el("div",{class:"word-card"},[ face, nameSlot, countBadge ]);
      stage.appendChild(card);
      stage.appendChild(el("p",{class:"screen-sub", style:"text-align:center"}, e.say));

      const listenBtn = el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); UI.say(e.say); }},
        [el("span",{class:"b-emoji emoji"}, "🔊"), "Nochmal"]);
      const playBtn = el("button",{class:"round-btn play big"},
        [el("span",{class:"b-emoji emoji"}, "▶"), "Mitmachen!"]);
      playBtn.addEventListener("click", ()=>{ if(!ticking) startCountdown(e, countBadge, nameSlot, playBtn); });
      const nextBtn = el("button",{class:"round-btn next", onclick:()=>{ UI.sfx("tap"); advance(); }},
        [el("span",{class:"b-emoji emoji"}, "➡"), "Weiter"]);

      stage.appendChild(el("div",{class:"btn-row"}, [listenBtn, playBtn, nextBtn]));
      setTimeout(()=>UI.say(e.say), 300);   // Pepe says the instruction; the face shows it
    }

    function startCountdown(e, countBadge, nameSlot, playBtn){
      ticking = true;
      playBtn.setAttribute("disabled", "true");
      nameSlot.textContent = "Mach mit!";
      countBadge.style.display = "";
      let left = e.secs;
      countBadge.textContent = String(left);
      UI.sfx("tap");
      timer = setInterval(()=>{
        left--;
        if(left > 0){
          countBadge.textContent = String(left);
          countBadge.style.animation = "none"; void countBadge.offsetWidth; countBadge.style.animation = "";
          UI.sfx("tap");
        } else {
          stopTimer();
          countBadge.textContent = "🎉";
          UI.sfx("correct");
          UI.reward({ worldId:"mundmotorik", stars:1 });
          setTimeout(advance, 1000);
        }
      }, 1000);
    }

    function advance(){
      stopTimer();
      idx++;
      if(idx >= ex.length){ prog.set(1); finish(); }
      else render();
    }

    function finish(){
      UI.bigCheer("Aufgewärmt!");
      UI.confetti(60);
      stage.innerHTML = "";
      stage.appendChild(el("div",{class:"word-card"},[
        window.PlappoFace ? PlappoFace.build("kissSmile") : el("div",{class:"big-emoji emoji"}, "👅"),
        el("div",{class:"word-text"}, "Bereit zum Sprechen!")
      ]));
      stage.appendChild(el("div",{class:"btn-row"},[
        el("button",{class:"round-btn next big", onclick:()=>{
          const fresh = UI.shuffle(D.MUNDMOTORIK).slice(0, 6);
          ex.splice(0, ex.length, ...fresh); idx = 0; render();
        }}, [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
        el("button",{class:"round-btn listen big", onclick:ctx.exit},
          [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
      ]));
    }

    render();
  }

  window.PlappoGames.push({
    id:"mundmotorik", order:0, title:"Aufwärmen", subtitle:"Mund-Turnen mit Pepe",
    emoji:"👅", color:"c-coral", needsPhoneme:false, mount
  });
})();
