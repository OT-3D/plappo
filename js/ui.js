/* ============================================================
   PLAPPO – Shared UI: mascot Pepe, celebrations, rewards, topbar.
   ============================================================ */
window.PlappoUI = (function(){
  const A = window.PlappoAudio, S = window.PlappoState, D = window.PLAPPO_DATA;

  /* ---------- tiny element helper ---------- */
  function el(tag, props, kids){
    const e = document.createElement(tag);
    if(props) for(const k in props){
      if(k === "class") e.className = props[k];
      else if(k === "html") e.innerHTML = props[k];
      else if(k === "text") e.textContent = props[k];
      else if(k.startsWith("on") && typeof props[k]==="function") e.addEventListener(k.slice(2), props[k]);
      else if(k === "style") e.setAttribute("style", props[k]);
      else if(props[k] != null) e.setAttribute(k, props[k]);
    }
    if(kids){ (Array.isArray(kids)?kids:[kids]).forEach(c=>{
      if(c==null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }); }
    return e;
  }
  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  /* ---------- Pepe the parrot ---------- */
  let pepeEl = null, bubbleEl = null, bubbleTimer = null;
  function mountPepe(){
    const layer = document.getElementById("mascot-layer");
    if(!pepeEl){
      pepeEl = el("div", {class:"pepe-float emoji", "aria-hidden":"true", onclick:()=>say(rand(D.PRAISE))}, "🦜");
      layer.appendChild(pepeEl);
    }
    if(!bubbleEl){
      bubbleEl = el("div", {class:"speech-bubble"});
      layer.appendChild(bubbleEl);
    }
  }
  function positionBubble(){
    if(!pepeEl || !bubbleEl) return;
    const r = pepeEl.getBoundingClientRect();
    bubbleEl.style.right = (window.innerWidth - r.right + 10) + "px";
    bubbleEl.style.bottom = (window.innerHeight - r.top + 6) + "px";
  }
  // say: animate Pepe, show bubble, speak (German TTS). Returns promise at speech end.
  function say(text, opts){
    mountPepe();
    lastPrompt = text; armIdle();   // re-prompt this if the child goes quiet
    pepeEl.classList.remove("pepe-talk"); void pepeEl.offsetWidth; pepeEl.classList.add("pepe-talk");
    bubbleEl.textContent = text;
    positionBubble();
    bubbleEl.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(()=>bubbleEl.classList.remove("show"), Math.max(2200, text.length*90));
    if(S.soundOn) return A.speak(text, opts);
    return Promise.resolve();
  }
  function hidePepe(hidden){ if(pepeEl) pepeEl.style.display = hidden ? "none" : ""; }

  /* ---------- idle re-prompt + global instant tap feedback ---------- */
  let lastPrompt = "", idleTimer = null;
  function armIdle(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(()=>{
      if(lastPrompt){
        if(pepeEl){ pepeEl.classList.remove("pepe-talk"); void pepeEl.offsetWidth; pepeEl.classList.add("pepe-talk"); }
        if(S.soundOn) A.speak(lastPrompt);
      }
      armIdle(); // keep gently reminding
    }, 8000);
  }
  function stopIdle(){ clearTimeout(idleTimer); lastPrompt = ""; }
  // any tap resets the idle clock; choice-type taps also get an instant click ack (<100ms)
  document.addEventListener("pointerdown", (e)=>{
    armIdle();
    const t = e.target && e.target.closest && e.target.closest(".choice,.bigchoice,.syll-dot,.judge-btn,.tile");
    if(t && S.soundOn) A.sfx("tap");
  }, true);

  /* ---------- sound wrapper (respects mute) ---------- */
  function sfx(name){ if(S.soundOn) A.sfx(name); }

  /* ---------- confetti ---------- */
  const CONF_COLORS = ["#ffcf3f","#34c1a8","#ff7a6b","#8a6fe0","#59c36a","#7fd0ef"];
  function confetti(n=40){
    const layer = document.getElementById("fx-layer");
    for(let i=0;i<n;i++){
      const c = el("div", {class:"confetti"});
      c.style.background = rand(CONF_COLORS);
      c.style.left = Math.random()*100 + "vw";
      c.style.top = "-20px";
      const dx = (Math.random()*2-1)*40;
      const dur = 1.4 + Math.random()*1.2;
      const rot = Math.random()*720;
      c.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
      layer.appendChild(c);
      requestAnimationFrame(()=>{
        c.style.transform = `translate(${dx}vw, 110vh) rotate(${rot}deg)`;
        c.style.opacity = "0.2";
      });
      setTimeout(()=>c.remove(), dur*1000+60);
    }
  }

  /* ---------- big cheer overlay ---------- */
  function bigCheer(text){
    const o = el("div", {class:"big-cheer"}, [
      el("div", {class:"star-burst emoji"}, "⭐"),
      el("div", {class:"cheer-text"}, text || rand(D.PRAISE))
    ]);
    document.getElementById("fx-layer").appendChild(o);
    setTimeout(()=>o.remove(), 1500);
  }
  function stickerPop(emoji){
    const s = el("div", {class:"sticker-pop emoji"}, emoji);
    document.getElementById("fx-layer").appendChild(s);
    setTimeout(()=>s.remove(), 950);
  }

  /* ---------- reward flow: stars + sticker + cheer ---------- */
  // call on a successful round. returns the new sticker emoji (or null)
  function reward({worldId, stars=1, cheer=true, praise=true}={}){
    sfx("correct");
    if(cheer) confetti(34);
    const newSticker = S.addStars(stars);
    if(worldId) S.bumpProgress(worldId, 1);
    updateStarCounter();
    if(praise) say(rand(D.PRAISE));
    sfx("star");
    if(newSticker){
      setTimeout(()=>{ stickerPop(newSticker); sfx("fanfare");
        say("Du hast einen neuen Sticker bekommen!"); }, 700);
    }
    return newSticker;
  }

  /* ---------- topbar + star counter ---------- */
  let starCounterEl = null;
  function updateStarCounter(){
    if(starCounterEl) starCounterEl.querySelector(".n").textContent = S.stars;
  }
  function topbar({onHome, onParent, showAge=false}={}){
    const left = onHome
      ? el("button", {class:"icon-btn home", "aria-label":"Start", onclick:()=>{ sfx("tap"); onHome(); }}, "🏠")
      : el("div", {style:"width:0"});
    starCounterEl = el("div", {class:"star-counter"}, [
      el("span",{class:"s emoji"},"⭐"), el("span",{class:"n"}, String(S.stars))
    ]);
    const kids = [left, el("div",{class:"spacer"})];
    if(showAge) kids.push(el("div",{class:"age-badge"}, "Alter: "+S.ageBand));
    kids.push(starCounterEl);
    if(onParent) kids.push(el("button",{class:"icon-btn","aria-label":"Eltern",onclick:()=>{ sfx("tap"); onParent(); }}, "⚙️"));
    return el("div", {class:"topbar"}, kids);
  }

  /* ---------- progress bar ---------- */
  function progressBar(frac){
    const fill = el("div",{class:"prog-fill", style:`width:${Math.round(frac*100)}%`});
    return { node: el("div",{class:"prog-wrap"}, fill),
             set:(f)=>{ fill.style.width = Math.round(f*100)+"%"; } };
  }

  /* ---------- gentle "try again" (never punishing) ---------- */
  function tryAgain(){
    sfx("wrongSoft");
    say(rand(D.TRY_AGAIN));
  }

  /* ---------- one-tap recording: tap once -> records with a visible countdown ->
       auto-stops after ~3s -> auto-plays the child back. No second tap needed.
       Returns the recording URL (or null). Pass the 🎤 button (it shows the state). */
  async function recordTake(btn, opts){
    opts = opts || {};
    const A = window.PlappoAudio, seconds = opts.seconds || 3;
    const label = btn && btn.querySelector(".rl");
    const setL = t => { if(label) label.textContent = t; };
    sfx("record");
    try{ await A.startRecording(); }
    catch(e){ if(opts.onError) opts.onError(); return null; }
    if(btn){ btn.classList.add("recording"); btn.style.pointerEvents = "none"; }
    let left = seconds; setL("Sprich! " + left);
    const iv = setInterval(()=>{ left--; setL(left > 0 ? ("Sprich! " + left) : "…"); }, 1000);
    await new Promise(r => setTimeout(r, seconds * 1000));
    clearInterval(iv);
    const url = await A.stopRecording();
    if(btn){ btn.classList.remove("recording"); btn.style.pointerEvents = ""; }
    sfx("pop");
    setL("🔁 Nochmal");
    if(url) await A.playback(url);   // hear yourself automatically
    return url;
  }

  return { el, rand, shuffle, say, hidePepe, mountPepe, sfx, confetti, bigCheer,
           stickerPop, reward, topbar, updateStarCounter, progressBar, tryAgain, stopIdle, recordTake };
})();
