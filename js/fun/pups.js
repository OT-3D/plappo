/* ============================================================
   FUN GAME: "Pups-Party" — pure silliness to make kids laugh.
   Tap the animals → each one parps (randomized fart sound) with
   a 💨 puff cloud + a wobble. No fail state, no pressure. Reward
   game in the Spielplatz.
   ============================================================ */
(function(){
  const UI = window.PlappoUI, A = window.PlappoAudio;
  const el = UI.el;
  window.PlappoFun = window.PlappoFun || [];

  const ANIMALS = ["🐘","🦛","🐷","🐮","🦍","🦫","🦨","🦆","🐸","🐵","🐤","🦏","🐶","🐹"];
  const CHEERS = ["Oh nein, wer war das?","Hihi, das war lustig!","Noch ein Pups!",
                  "Haha, so ein Quatsch!","Wer hat denn gepupst?","Puh, das stinkt!"];

  function mount(root, ctx){
    let count = 0, alive = true;
    const exit = ()=>{ alive = false; ctx.exit(); };

    root.appendChild(UI.topbar({ onHome: exit }));
    root.appendChild(el("h2",{class:"screen-title"}, "💨 Pups-Party"));
    const counter = el("div",{class:"screen-sub", style:"text-align:center;font-size:28px;font-weight:700"}, "💨 0");
    root.appendChild(counter);
    const area = el("div",{class:"pups-area"});
    root.appendChild(area);
    root.appendChild(el("p",{class:"screen-sub", style:"text-align:center"}, "Tipp die Tiere – und hör, was passiert! 😆"));

    UI.shuffle(ANIMALS).slice(0, 6).forEach(em=>{
      const btn = el("button",{class:"pups-char", onclick:()=>parp(btn)}, el("span",{class:"emoji"}, em));
      area.appendChild(btn);
    });
    setTimeout(()=>UI.say("Tipp die Tiere und hör, was passiert! Haha!"), 300);

    function parp(btn){
      if(!alive) return;
      const mega = Math.random() < 0.16;
      UI.sfx("fart");
      if(mega) setTimeout(()=>UI.sfx("fart"), 130);
      // wobble the animal
      btn.classList.remove("pups-jiggle"); void btn.offsetWidth; btn.classList.add("pups-jiggle");
      // puff cloud
      const puff = el("div",{class:"pups-puff emoji"+(mega?" mega":"")}, "💨");
      const r = btn.getBoundingClientRect();
      puff.style.left = (r.left + r.width*0.5) + "px";
      puff.style.top  = (r.top + r.height*0.45) + "px";
      document.body.appendChild(puff);
      setTimeout(()=>puff.remove(), 1000);

      count++; counter.textContent = "💨 " + count;
      if(count % 10 === 0){ UI.confetti(30); UI.sfx("star"); UI.say(UI.rand(CHEERS)); }
    }
  }

  window.PlappoFun.push({ id:"pups", title:"Pups-Party", emoji:"💨", unlockStars:20, mount });
})();
