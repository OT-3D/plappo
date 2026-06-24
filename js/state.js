/* ============================================================
   PLAPPO – State & persistence (localStorage, on-device only)
   Holds stars, per-world progress, unlocked stickers, and the
   parent settings (age band + chosen target sounds).
   No personal data is ever collected.
   ============================================================ */
window.PlappoState = (function(){
  const KEY = "plappo.v1";
  const STARS_PER_STICKER = 10;

  const def = {
    stars: 0,
    ageBand: "2-4",            // "2-4" | "5-7" | "8-10"
    targets: null,             // null = auto by age; else array of phoneme ids
    progress: {},              // worldId -> count of completed rounds
    phonemeReps: {},           // phonemeId -> good repetitions (drives the Laut-Garten)
    days: [],                  // YYYY-MM-DD strings the child practised (parent streak)
    stickers: [],              // unlocked sticker emojis (index into STICKERS)
    soundOn: true,
    seenIntro: false
  };

  let s = load();

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw){ return Object.assign({}, def, JSON.parse(raw)); }
    }catch(e){}
    return Object.assign({}, def);
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  /* ---- age → which phoneme tiers are unlocked ---- */
  function maxTier(){
    if(s.ageBand === "2-4") return 2;     // early sounds + k/g
    if(s.ageBand === "5-7") return 4;     // everything incl. sch, s, r
    return 4;                              // 8-10: everything
  }
  // active target phonemes (respect explicit parent choice, else by age)
  function activePhonemes(){
    const all = window.PLAPPO_DATA.PHONEMES;
    if(s.targets && s.targets.length){
      return all.filter(p => s.targets.includes(p.id));
    }
    const mt = maxTier();
    return all.filter(p => p.tier <= mt);
  }
  function isPhonemeUnlocked(id){
    return activePhonemes().some(p => p.id === id);
  }

  /* ---- stars + stickers ---- */
  function addStars(n){
    s.stars += n;
    // unlock stickers as milestones are crossed
    const earned = Math.floor(s.stars / STARS_PER_STICKER);
    const have = s.stickers.length;
    const list = window.PLAPPO_DATA.STICKERS;
    let newSticker = null;
    for(let i = have; i < earned && i < list.length; i++){
      s.stickers.push(list[i]); newSticker = list[i];
    }
    save();
    return newSticker; // emoji or null
  }

  function bumpProgress(worldId, by=1){
    s.progress[worldId] = (s.progress[worldId]||0) + by;
    markToday();
    save();
  }
  function progressOf(worldId){ return s.progress[worldId] || 0; }

  /* ---- per-phoneme growth (Laut-Garten) ---- */
  const STAGE_AT = [3, 8, 16, 28];   // reps thresholds -> stage 0..4
  const STAGE_EMOJI = ["🌱","🌿","🪴","🌳","🌸"];
  function addPhonemeRep(id, by=1){ if(!id) return; s.phonemeReps[id]=(s.phonemeReps[id]||0)+by; markToday(); save(); }
  function phonemeReps(id){ return s.phonemeReps[id]||0; }
  function phonemeStage(id){ const r=phonemeReps(id); let st=0; for(let i=0;i<STAGE_AT.length;i++){ if(r>=STAGE_AT[i]) st=i+1; } return st; }
  function stageEmoji(st){ return STAGE_EMOJI[Math.max(0,Math.min(4,st))]; }
  function stageMaxReps(){ return STAGE_AT[STAGE_AT.length-1]; }

  /* ---- practice days (for the parent streak) ---- */
  function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function markToday(){ const t=todayStr(); if(s.days[s.days.length-1]!==t){ s.days.push(t); if(s.days.length>400) s.days=s.days.slice(-400); } }
  function dayCount(){ return s.days.length; }
  function streak(){
    if(!s.days.length) return 0;
    const set=new Set(s.days); let n=0; const d=new Date();
    for(;;){ const ds=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
      if(set.has(ds)){ n++; d.setDate(d.getDate()-1); } else break; }
    return n;
  }

  /* ---- settings ---- */
  function setAge(band){ s.ageBand = band; if(s.targets) s.targets = null; save(); }
  function setTargets(arr){ s.targets = (arr && arr.length) ? arr : null; save(); }
  function toggleTarget(id){
    const cur = (s.targets || activePhonemes().map(p=>p.id)).slice();
    const i = cur.indexOf(id);
    if(i>=0) cur.splice(i,1); else cur.push(id);
    setTargets(cur);
  }
  function setSound(on){ s.soundOn = !!on; save(); }
  function markIntroSeen(){ s.seenIntro = true; save(); }

  return {
    get stars(){ return s.stars; },
    get ageBand(){ return s.ageBand; },
    get stickers(){ return s.stickers.slice(); },
    get soundOn(){ return s.soundOn; },
    get seenIntro(){ return s.seenIntro; },
    get targets(){ return s.targets; },
    starsPerSticker: STARS_PER_STICKER,
    activePhonemes, isPhonemeUnlocked, maxTier,
    addStars, bumpProgress, progressOf,
    addPhonemeRep, phonemeReps, phonemeStage, stageEmoji, stageMaxReps,
    dayCount, streak,
    setAge, setTargets, toggleTarget, setSound, markIntroSeen, save
  };
})();
