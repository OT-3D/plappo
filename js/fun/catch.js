/* ============================================================
   FUN REWARD GAME: "Pepe fängt" — catch the falling treats.
   Pure fun, no speech therapy, NO fail state, NO score that drops.
   Items fall; a big basket follows the child's finger/mouse and
   "catches" them. Every ~15 catches => confetti + cheer. Missed
   items just fall off-screen (no penalty). Unlocked with stars.
   ============================================================ */
(function(){
  const UI = window.PlappoUI;
  const el = UI.el;
  window.PlappoFun = window.PlappoFun || [];

  const ITEMS    = ["🍓","🍌","🍒","⭐","🎈","🌟","🍎"];
  const CHEERS   = ["Super gefangen!","Du bist toll!","Juhuu!","Weiter so!","Klasse gemacht!","Wow, prima!"];
  const MAX_ITEMS  = 10;   // cap concurrent falling items
  const CATCH_GOAL = 15;   // catches between big celebrations
  const BASKET_W   = 90;   // basket width (px)
  const ITEM_PX    = 52;   // emoji size (px)

  function mount(root, ctx){
    // --- state / handles we MUST clean up ---
    let rafId = null;
    let spawnTimer = null;
    let running = true;
    let caught = 0;
    let cheerLevel = 0;     // how many big-cheers we've crossed
    const falling = [];     // {node, x, y, vy, r}
    let lastTs = 0;

    // basket follows finger; target x (center) in play-area coords
    let basketX = 0, targetX = 0;

    // --- DOM ---
    root.appendChild(UI.topbar({ onHome: exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "🧺 Pepe fängt"));

    const counter = el("div",{
      style:"display:flex;align-items:center;gap:8px;font-family:var(--display);"+
            "font-weight:600;font-size:26px;color:var(--jade-deep);margin:0 4px 8px;"
    },[ el("span",{class:"emoji",style:"font-size:30px"},"⭐"),
        el("span",{class:"catch-n"}, "0") ]);
    root.appendChild(counter);
    const counterN = counter.querySelector(".catch-n");

    // play area
    const area = el("div",{
      style:"position:relative;width:100%;max-width:520px;height:62vh;min-height:340px;"+
            "margin:0 auto;border-radius:var(--r-xl);overflow:hidden;touch-action:none;"+
            "background:linear-gradient(180deg,#d8f3ea 0%,#bfe9e0 46%,#e8f9ef 100%);"+
            "box-shadow:inset 0 2px 10px rgba(16,60,48,.12);"
    });
    root.appendChild(area);

    root.appendChild(el("p",{class:"screen-sub",style:"text-align:center;margin-top:12px"},
      "Bewege den Korb mit dem Finger und fang die Sachen!"));

    // basket element
    const basket = el("div",{
      class:"emoji",
      style:"position:absolute;bottom:8px;width:"+BASKET_W+"px;height:"+BASKET_W+"px;"+
            "font-size:"+BASKET_W+"px;line-height:"+BASKET_W+"px;text-align:center;"+
            "pointer-events:none;transition:transform .04s linear;"+
            "filter:drop-shadow(0 6px 8px rgba(16,60,48,.25));will-change:left"
    }, "🧺");
    area.appendChild(basket);

    // --- pointer / touch control ---
    function areaW(){ return area.clientWidth || 320; }
    function setTargetFromClientX(clientX){
      const rect = area.getBoundingClientRect();
      let x = clientX - rect.left;        // center of basket follows finger
      const half = BASKET_W/2;
      x = Math.max(half, Math.min(areaW()-half, x));
      targetX = x;
    }
    function onPointerMove(e){
      if(e.cancelable) e.preventDefault();
      const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      if(cx != null) setTargetFromClientX(cx);
    }
    function onPointerDown(e){
      // tap-to-move so the youngest can play
      const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      if(cx != null) setTargetFromClientX(cx);
    }
    area.addEventListener("pointermove", onPointerMove, {passive:false});
    area.addEventListener("pointerdown", onPointerDown, {passive:false});
    area.addEventListener("touchmove",  onPointerMove, {passive:false});
    area.addEventListener("touchstart", onPointerDown, {passive:false});

    // --- spawning ---
    function spawn(){
      if(!running) return;
      if(falling.length < MAX_ITEMS){
        const w = areaW();
        const x = ITEM_PX/2 + Math.random()*(w - ITEM_PX);
        const node = el("div",{
          class:"emoji",
          style:"position:absolute;width:"+ITEM_PX+"px;height:"+ITEM_PX+"px;"+
                "font-size:"+ITEM_PX+"px;line-height:"+ITEM_PX+"px;text-align:center;"+
                "pointer-events:none;will-change:transform;"+
                "filter:drop-shadow(0 4px 5px rgba(16,60,48,.18))"
        }, UI.rand(ITEMS));
        node.style.left = (x - ITEM_PX/2) + "px";
        node.style.top  = (-ITEM_PX) + "px";
        area.appendChild(node);
        falling.push({ node, x, y:-ITEM_PX, vy: 90 + Math.random()*140, r: ITEM_PX/2 });
      }
      // varied cadence
      spawnTimer = setTimeout(spawn, 480 + Math.random()*620);
    }

    // --- sparkle on catch ---
    function sparkle(x, y){
      const s = el("div",{
        class:"emoji",
        style:"position:absolute;left:"+(x-16)+"px;top:"+(y-16)+"px;font-size:32px;"+
              "pointer-events:none;animation:correct-pop .5s ease forwards;will-change:transform"
      }, "✨");
      area.appendChild(s);
      setTimeout(()=>{ if(s.parentNode) s.remove(); }, 520);
    }

    // --- main loop ---
    function tick(ts){
      if(!running) return;
      // auto-stop if the play area got detached from the document
      if(!area.isConnected){ cleanup(); return; }

      if(!lastTs) lastTs = ts;
      let dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if(dt > 0.05) dt = 0.05;   // clamp big gaps (tab switch) to avoid jumps

      // ease basket toward target
      if(!basketX) basketX = targetX || areaW()/2;
      basketX += (targetX - basketX) * Math.min(1, dt*16);
      basket.style.left = (basketX - BASKET_W/2) + "px";

      const h = area.clientHeight || 340;
      const basketTop = h - 8 - BASKET_W;          // top edge of basket
      const catchZoneTop = basketTop - ITEM_PX*0.4; // forgiving catch zone
      const halfHit = BASKET_W/2 + ITEM_PX*0.35;     // forgiving x hit-box

      for(let i = falling.length - 1; i >= 0; i--){
        const it = falling[i];
        it.y += it.vy * dt;
        it.node.style.transform = "translateY(" + (it.y + ITEM_PX) + "px)";

        const itemBottom = it.y + ITEM_PX;
        // caught? overlap basket x-range near the bottom
        if(itemBottom >= catchZoneTop && it.y <= h - 8 &&
           Math.abs(it.x - basketX) <= halfHit){
          catchItem(it, i);
          continue;
        }
        // fell off-screen -> just remove, NO penalty
        if(it.y > h + ITEM_PX){
          if(it.node.parentNode) it.node.remove();
          falling.splice(i,1);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function catchItem(it, i){
      if(it.node.parentNode) it.node.remove();
      falling.splice(i,1);
      caught++;
      counterN.textContent = String(caught);
      UI.sfx("pop");
      sparkle(it.x, (area.clientHeight||340) - 8 - BASKET_W);
      // little basket bounce
      basket.style.transform = "scale(1.12)";
      setTimeout(()=>{ if(basket.isConnected) basket.style.transform = ""; }, 120);

      // milestone celebration every CATCH_GOAL catches
      const level = Math.floor(caught / CATCH_GOAL);
      if(level > cheerLevel){
        cheerLevel = level;
        UI.confetti(40);
        UI.sfx("star");
        UI.say(UI.rand(CHEERS));
      }
    }

    // --- lifecycle ---
    function cleanup(){
      running = false;
      if(rafId != null){ cancelAnimationFrame(rafId); rafId = null; }
      if(spawnTimer != null){ clearTimeout(spawnTimer); spawnTimer = null; }
      area.removeEventListener("pointermove", onPointerMove);
      area.removeEventListener("pointerdown", onPointerDown);
      area.removeEventListener("touchmove",  onPointerMove);
      area.removeEventListener("touchstart", onPointerDown);
      falling.length = 0;
    }
    function exit(){
      cleanup();
      if(UI.stopIdle) UI.stopIdle();
      if(typeof ctx.exit === "function") ctx.exit();
    }

    // kick off
    targetX = basketX = (areaW()/2);
    basket.style.left = (basketX - BASKET_W/2) + "px";
    UI.say("Fang die Sachen mit dem Korb!");
    spawn();
    rafId = requestAnimationFrame(tick);
  }

  window.PlappoFun.push({ id:"catch", title:"Pepe fängt", emoji:"🧺", unlockStars:30, mount });
})();
