/* ============================================================
   GAME: "Sprich nach" — Lautanbahnung with on-device sound check.
   Listen (Pepe models) -> child records -> the app analyses the
   recording (loud enough? clear? for s/sch a spectral check) and
   gives an automatic traffic-light verdict, AND plays the child's
   own voice back so they hear themselves. No cloud, no ASR.
   A parent "Passt" override and "Weiter" always keep things moving.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, S = window.PlappoState, A = window.PlappoAudio, D = window.PLAPPO_DATA;
  const el = UI.el;
  window.PlappoGames = window.PlappoGames || [];

  function highlight(word, ph){
    const graph = ph.id.toLowerCase();
    const i = word.toLowerCase().indexOf(graph);
    if(i < 0) return document.createTextNode(word);
    const span = el("span",{});
    span.appendChild(document.createTextNode(word.slice(0,i)));
    span.appendChild(el("span",{class:"tgt"}, word.slice(i, i+graph.length)));
    span.appendChild(document.createTextNode(word.slice(i+graph.length)));
    return span;
  }
  function wordList(ph){
    const out = [];
    ["A","I","E"].forEach(pos=>{ (ph.words[pos]||[]).forEach(w=> out.push(w)); });
    return UI.shuffle(out).slice(0, 6);
  }

  const VERDICT = {
    good:   { cls:"good",   icon:"🌟", text:"Klingt super!",       say:"Super gesprochen!" },
    almost: { cls:"almost", icon:"👍", text:"Fast! Hör nochmal.",   say:"Fast! Hör nochmal genau hin und sprich mit mir." },
    quiet:  { cls:"quiet",  icon:"🔈", text:"Etwas lauter, bitte.", say:"Ich hab dich kaum gehört. Sprich etwas lauter, nochmal!" }
  };

  async function mount(root, ctx){
    const ph = ctx.phoneme || S.activePhonemes()[0];
    let words = wordList(ph);
    let idx = 0, recUrl = null, recording = false, rewarded = false;
    let canRec = await A.canRecord();
    let levelTimer = null, autoStop = null, exited = false;
    const exit = ()=>{ exited = true; A.stopMic(); clearInterval(levelTimer); clearTimeout(autoStop); ctx.exit(); };

    // keep this take: grow the Laut-Garten + save to the speech diary (früher/jetzt)
    let savedThisWord = false;
    function keepRecording(){
      if(savedThisWord) return; savedThisWord = true;
      S.addPhonemeRep(ph.id);
      if(recUrl && window.PlappoDiary && PlappoDiary.available){
        fetch(recUrl).then(r=>r.blob()).then(b=> PlappoDiary.save(words[idx][0], ph.sound, b)).catch(()=>{});
      }
    }

    root.appendChild(UI.topbar({ onHome: exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🦜 Sprich nach"));
    const prog = UI.progressBar(0);
    root.appendChild(prog.node);
    const stage = el("div",{class:"play-area"});
    root.appendChild(stage);

    function modelWord(){ const [text]=words[idx]; UI.say(text, {rate:0.7}); }

    function render(){
      if(exited) return;              // don't rebuild/speak after leaving the game
      clearInterval(levelTimer); clearTimeout(autoStop);
      stage.innerHTML = "";
      recUrl = null; recording = false; rewarded = false; savedThisWord = false;
      const [text, emoji] = words[idx];
      prog.set(idx / words.length);

      stage.appendChild(el("div",{class:"word-card"},[
        el("div",{class:"big-emoji emoji"}, emoji),
        el("div",{class:"word-text"}, [highlight(text, ph)])
      ]));

      const listenBtn = el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); modelWord(); }},
        [el("span",{class:"b-emoji emoji"},"🔊"), "Hör zu"]);

      if(!canRec){
        // no microphone: fall back to listen + parent confirm
        stage.appendChild(el("div",{class:"btn-row"},[listenBtn]));
        stage.appendChild(el("p",{class:"screen-sub",style:"text-align:center"},"Gut gesprochen? Dann tippt auf ✅"));
        stage.appendChild(el("div",{class:"judge-row"},[
          el("button",{class:"judge-btn yes emoji","aria-label":"Richtig",onclick:()=>advance(true)},"✅"),
          el("button",{class:"judge-btn again emoji","aria-label":"Nochmal",onclick:()=>{ UI.tryAgain(); }},"🔁")
        ]));
        setTimeout(modelWord, 300);
        return;
      }

      // record button + live level meter
      const recBtn = el("button",{class:"round-btn record"},
        [el("span",{class:"b-emoji emoji"},"🎤"), el("span",{class:"rlabel"},"Sprich nach")]);
      const meter = el("div",{class:"analyzer-bar"}, el("i",{}));
      const meterFill = meter.firstChild;
      const resultBox = el("div",{class:"play-area", style:"gap:14px"}); // filled after recording

      recBtn.addEventListener("click", ()=> recording ? stopRec() : startRec());

      function startRec(){
        UI.sfx("record");
        A.startRecording().then(()=>{
          recording = true; recBtn.classList.add("recording");
          recBtn.querySelector(".rlabel").textContent = "Fertig ✓";
          resultBox.innerHTML = "";
          levelTimer = setInterval(()=>{ meterFill.style.width = Math.round(A.liveLevel*100)+"%"; }, 60);
          autoStop = setTimeout(()=>{ if(recording) stopRec(); }, 3200); // young kids needn't tap stop
        }).catch(()=>{ canRec=false; render(); });
      }
      async function stopRec(){
        if(!recording) return;          // guard against auto-stop + manual stop racing
        recording = false;
        clearTimeout(autoStop); clearInterval(levelTimer);
        recUrl = await A.stopRecording();
        recBtn.classList.remove("recording");
        recBtn.querySelector(".rlabel").textContent = "Nochmal";
        UI.sfx("pop");
        const v = A.pronunciationVerdict(ph);
        meterFill.style.width = Math.round((v.level||0)*100)+"%";
        showResult(v);
      }

      function showResult(v){
        const info = VERDICT[v.verdict] || VERDICT.almost;
        resultBox.innerHTML = "";
        resultBox.appendChild(el("div",{class:"verdict "+info.cls},
          [el("span",{class:"emoji"}, info.icon), info.text]));
        // self-listening: hear yourself + compare to Pepe
        resultBox.appendChild(el("div",{class:"compare-row"},[
          el("button",{class:"round-btn play", onclick:()=>{ UI.sfx("tap"); if(recUrl) A.playback(recUrl); }},
            [el("span",{class:"b-emoji emoji"},"▶"),"So klingst du"]),
          el("button",{class:"round-btn listen", onclick:()=>{ UI.sfx("tap"); modelWord(); }},
            [el("span",{class:"b-emoji emoji"},"🦜"),"So klingt Pepe"])
        ]));
        // hear yourself automatically, then Pepe's feedback
        if(recUrl) A.playback(recUrl).then(()=> setTimeout(()=>UI.say(info.say), 200));
        else UI.say(info.say);

        if(v.verdict === "good"){
          if(!rewarded){ rewarded = true; UI.reward({ worldId:"repeat", stars:1, praise:false }); }
          keepRecording();
          resultBox.appendChild(el("div",{class:"btn-row"},[
            el("button",{class:"round-btn next big", onclick:()=>advance(false)},
              [el("span",{class:"b-emoji emoji"},"➡"),"Weiter"])
          ]));
        } else {
          resultBox.appendChild(el("div",{class:"btn-row"},[
            el("button",{class:"round-btn record", onclick:()=>{ resultBox.innerHTML=""; meterFill.style.width="0%"; startRec(); }},
              [el("span",{class:"b-emoji emoji"},"🎤"),"Nochmal"]),
            el("button",{class:"round-btn next", onclick:()=>advance(false)},
              [el("span",{class:"b-emoji emoji"},"➡"),"Weiter"])
          ]));
          // small parent override
          resultBox.appendChild(el("button",{class:"link-btn", onclick:()=>{ keepRecording(); advance(true); }},
            "War doch gut? Hier tippen ✓"));
        }
      }

      stage.appendChild(el("div",{class:"btn-row"},[listenBtn, recBtn]));
      stage.appendChild(meter);
      stage.appendChild(el("p",{class:"screen-sub",style:"text-align:center;margin-top:2px"},
        "Tipp 🎤 und sprich das Wort. Ich höre zu!"));
      stage.appendChild(resultBox);
      setTimeout(modelWord, 300);
    }

    function advance(grantStar){
      if(grantStar && !rewarded){ rewarded = true; UI.reward({ worldId:"repeat", stars:1, praise:false }); }
      idx++;
      if(idx >= words.length){
        prog.set(1);
        setTimeout(()=>{
          if(exited) return;
          UI.bigCheer("Alle Wörter geschafft!"); UI.confetti(60);
          setTimeout(()=>{
            stage.innerHTML="";
            stage.appendChild(el("div",{class:"word-card"},[
              el("div",{class:"big-emoji emoji"}, ph.emoji),
              el("div",{class:"word-text"}, "Super!")
            ]));
            stage.appendChild(el("div",{class:"btn-row"},[
              el("button",{class:"round-btn next big", onclick:()=>{ words = wordList(ph); idx=0; render(); }},
                [el("span",{class:"b-emoji emoji"},"🔁"),"Nochmal"]),
              el("button",{class:"round-btn listen big", onclick:exit},
                [el("span",{class:"b-emoji emoji"},"🏠"),"Zu den Spielen"])
            ]));
          }, 1400);
        }, 500);
      } else {
        setTimeout(render, 500);
      }
    }

    render();
  }

  window.PlappoGames.push({
    id:"repeat", order:1, title:"Sprich nach", subtitle:"Hören, sprechen & selbst hören",
    emoji:"🦜", color:"c-teal", needsPhoneme:true, mount
  });
})();
