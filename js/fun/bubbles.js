/* ============================================================
   FUN REWARD GAME: "Seifenblasen" — bubble pop.
   Pure fun, NO fail state, NO score that can drop, replayable.
   Colorful bubbles float UP and drift; tap to POP them with a
   satisfying burst. Unmissed bubbles just float away. Every ~20
   pops -> tiny celebration + Pepe cheers. Big tap targets.
   Robust teardown: every timer / rAF handle is tracked and
   cleared on exit AND when the play container leaves the DOM.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, A = window.PlappoAudio;
  const el = UI.el;

  // soft bubble color palettes (top highlight -> body -> rim)
  const PALETTES = [
    ["#fff7c2","#ffd25a","#f2a019"],   // sun
    ["#d8fff2","#5fe0c4","#0e8c72"],   // jade
    ["#ffe0db","#ff8473","#e8503f"],   // papaya
    ["#ece2ff","#a98fef","#6043b3"],   // plum
    ["#dff7ff","#7fd0ef","#3f9fc0"],   // sky
    ["#e6ffe8","#7bdc94","#2ea073"]    // leaf
  ];
  const CHEERS = [
    "Pop pop pop!", "Wieee, Seifenblasen!", "Du bist super schnell!",
    "Plopp! So viele!", "Pust, pust, klick!", "Hihi, das kitzelt!",
    "Was für ein Spaß!", "Mehr Blasen kommen!"
  ];

  function mount(root, ctx){
    /* ---------- all teardown handles live here ---------- */
    let spawnTimer = null;        // setInterval for spawning
    let rafId = null;             // requestAnimationFrame loop
    const bubbles = [];           // active bubble records
    const burstTimers = new Set();// setTimeout handles for pop bursts
    let alive = true;             // master kill switch
    let popped = 0;
    let lastTs = 0;

    const MAX_BUBBLES = 12;
    const SPAWN_MS = 700;

    /* ---------- header ---------- */
    root.appendChild(UI.topbar({ onHome: stopAndExit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🫧 Seifenblasen"));

    // popped counter
    const counter = el("div",{class:"screen-sub", style:
      "text-align:center; display:flex; align-items:center; justify-content:center; gap:10px; font-size:24px;"},[
      el("span",{class:"emoji", style:"font-size:30px"},"🫧"),
      el("span",{class:"bubcount"}, "0")
    ]);
    root.appendChild(counter);
    const countEl = counter.querySelector(".bubcount");

    /* ---------- play container (relative, fills area) ---------- */
    const play = el("div",{style:[
      "position:relative",
      "width:100%",
      "height:min(64vh, 560px)",
      "margin:6px auto 0",
      "border-radius:30px",
      "overflow:hidden",
      "background:radial-gradient(120% 90% at 50% 110%, rgba(95,224,196,.30), transparent 60%)," +
        "linear-gradient(180deg, #eafbff 0%, #f3fbf6 70%, #fff7e8 100%)",
      "box-shadow:inset 0 2px 10px rgba(16,60,48,.10), 0 10px 26px rgba(16,60,48,.16)",
      "touch-action:manipulation"
    ].join(";")});
    root.appendChild(play);

    UI.say("Tipp die Seifenblasen an — plopp!");

    /* ---------- spawn one bubble ---------- */
    function spawn(){
      if(!alive) return;
      if(bubbles.length >= MAX_BUBBLES) return;

      const w = play.clientWidth, h = play.clientHeight;
      if(w < 20 || h < 20) return; // not laid out yet

      const pal = UI.rand(PALETTES);
      const size = 70 + Math.random()*70;             // 70..140px (big tap targets)
      const x = Math.random()*(w - size);             // start x within bounds
      const speed = 38 + Math.random()*46;            // px per second upward
      const driftAmp = 10 + Math.random()*26;         // horizontal wobble amplitude
      const driftFreq = 0.5 + Math.random()*0.9;      // wobble speed
      const phase = Math.random()*Math.PI*2;
      const wobAmp = 0.04 + Math.random()*0.05;       // gentle squash wobble

      const node = el("div",{class:"emoji", role:"button", "aria-label":"Seifenblase", style:[
        "position:absolute",
        "left:0", "top:0",
        "width:"+size+"px", "height:"+size+"px",
        "border-radius:50%",
        "cursor:pointer",
        "will-change:transform",
        "background:radial-gradient(38% 32% at 32% 28%, rgba(255,255,255,.95), "+pal[0]+" 22%, "+pal[1]+" 62%, "+pal[2]+" 100%)",
        "box-shadow:inset 0 0 18px rgba(255,255,255,.45), inset 0 -8px 16px rgba(0,0,0,.12), 0 6px 14px rgba(16,60,48,.18)",
        "transition:transform .14s cubic-bezier(.34,1.56,.64,1), opacity .18s ease"
      ].join(";")});

      // little glossy highlight dot
      node.appendChild(el("div",{style:[
        "position:absolute", "left:22%", "top:16%",
        "width:24%", "height:18%", "border-radius:50%",
        "background:rgba(255,255,255,.85)", "filter:blur(1px)", "pointer-events:none"
      ].join(";")}));

      const rec = { node, x, y: h + size*0.2, size, speed, driftAmp, driftFreq, phase, wobAmp, t: 0, popping: false };

      const onPop = (e)=>{ if(e) { e.preventDefault(); e.stopPropagation(); } pop(rec); };
      node.addEventListener("pointerdown", onPop);

      bubbles.push(rec);
      play.appendChild(node);
    }

    /* ---------- pop a bubble (satisfying) ---------- */
    function pop(rec){
      if(!rec || rec.popping) return;
      rec.popping = true;
      UI.sfx("pop");

      popped++;
      countEl.textContent = String(popped);

      // burst: scale up + fade
      rec.node.style.transform = "translate(" + rec.x + "px," + rec.y + "px) scale(1.45)";
      rec.node.style.opacity = "0";

      sparkle(rec.x + rec.size/2, rec.y + rec.size/2, rec.size);

      const t = setTimeout(()=>{
        burstTimers.delete(t);
        removeBubble(rec);
      }, 200);
      burstTimers.add(t);

      // every 20 pops: a small celebration
      if(popped % 20 === 0){
        UI.confetti(28);
        UI.sfx("star");
        UI.say(UI.rand(CHEERS));
      }
    }

    /* ---------- sparkle burst (little stars around the pop) ---------- */
    function sparkle(cx, cy, size){
      if(!alive) return;
      const n = 6;
      for(let i=0;i<n;i++){
        const ang = (Math.PI*2/n)*i + Math.random()*0.5;
        const dist = size*0.5 + Math.random()*size*0.4;
        const s = el("div",{class:"emoji", style:[
          "position:absolute",
          "left:"+(cx-9)+"px", "top:"+(cy-9)+"px",
          "font-size:18px", "pointer-events:none", "will-change:transform,opacity",
          "transition:transform .42s ease-out, opacity .42s ease-out"
        ].join(";")}, Math.random()<0.5 ? "✨" : "💫");
        play.appendChild(s);
        const dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist;
        requestAnimationFrame(()=>{
          s.style.transform = "translate("+dx+"px,"+dy+"px) scale(.4)";
          s.style.opacity = "0";
        });
        const t = setTimeout(()=>{ burstTimers.delete(t); s.remove(); }, 460);
        burstTimers.add(t);
      }
    }

    /* ---------- remove a bubble record + node ---------- */
    function removeBubble(rec){
      const i = bubbles.indexOf(rec);
      if(i >= 0) bubbles.splice(i,1);
      if(rec.node && rec.node.parentNode) rec.node.remove();
    }

    /* ---------- animation loop: rise + drift ---------- */
    function frame(ts){
      if(!alive) return;
      // if the play container left the DOM, stop everything
      if(!play.isConnected){ teardown(); return; }

      if(!lastTs) lastTs = ts;
      let dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if(dt > 0.05) dt = 0.05; // clamp after tab-switch / jank

      for(let i = bubbles.length - 1; i >= 0; i--){
        const b = bubbles[i];
        if(b.popping) continue;
        b.t += dt;
        b.y -= b.speed * dt;                              // rise up
        const dx = Math.sin(b.t * b.driftFreq + b.phase) * b.driftAmp;
        const squash = 1 + Math.sin(b.t * 2.3 + b.phase) * b.wobAmp;
        b.node.style.transform =
          "translate(" + (b.x + dx) + "px," + b.y + "px) scaleY(" + squash + ")";

        // floated off the top, unpopped -> just remove (no penalty)
        if(b.y + b.size < -10){
          removeBubble(b);
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    /* ---------- teardown: clear EVERYTHING ---------- */
    function teardown(){
      if(!alive) return;        // idempotent
      alive = false;
      if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = null; }
      if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
      burstTimers.forEach(t => clearTimeout(t));
      burstTimers.clear();
      // remove any remaining bubble nodes
      for(let i = bubbles.length - 1; i >= 0; i--){
        const b = bubbles[i];
        if(b.node && b.node.parentNode) b.node.remove();
      }
      bubbles.length = 0;
    }

    // wrap ctx.exit so leaving ALWAYS tears down first
    function stopAndExit(){
      teardown();
      if(typeof ctx.exit === "function") ctx.exit();
    }

    /* ---------- start ---------- */
    spawnTimer = setInterval(spawn, SPAWN_MS);
    // a few immediate bubbles so the screen isn't empty
    spawn(); spawn();
    rafId = requestAnimationFrame(frame);
  }

  window.PlappoFun = window.PlappoFun || [];
  window.PlappoFun.push({ id:"bubbles", title:"Seifenblasen", emoji:"🫧", unlockStars:10, mount });
})();
