/* ============================================================
   PLAPPO – Audio engine
   - speak(text): German TTS (slow, clear), promise resolves at end
   - sfx(name): synthesized sound effects via WebAudio (no asset files)
   - record/playback: MediaRecorder (robust on iOS 14.3+); STT is never used
   ============================================================ */
window.PlappoAudio = (function(){
  let ctx = null;            // WebAudio context
  let unlocked = false;
  let germanVoice = null;
  let voicesReady = false;

  /* ---------- WebAudio unlock + context ---------- */
  function ensureCtx(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(AC) ctx = new AC();
    }
    if(ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Must be called from a user gesture (the start gate) to unlock iOS audio.
  function unlock(){
    ensureCtx();
    // prime speechSynthesis with an empty utterance so iOS allows later speech
    try{
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; u.lang = "de-DE";
      window.speechSynthesis.speak(u);
    }catch(e){}
    loadVoices();
    unlocked = true;
  }

  /* ---------- Voices ---------- */
  function pickGerman(voices){
    if(!voices || !voices.length) return null;
    const de = voices.filter(v => /^de(-|_|$)/i.test(v.lang));
    if(!de.length) return null;
    // prefer a MALE German voice (matches Pepe's male neural voice) for the rare fallback
    const male = de.find(v => /Martin|Markus|Yannick|Conrad|Hans|Reed|Viktor|Stefan/i.test(v.name));
    return male || de[0];
  }
  function loadVoices(){
    if(!("speechSynthesis" in window)) return;
    const v = window.speechSynthesis.getVoices();
    if(v && v.length){ germanVoice = pickGerman(v); voicesReady = true; }
  }
  if("speechSynthesis" in window){
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  /* ---------- Speak: pre-rendered neural-voice clips first, TTS fallback ---------- */
  let clipManifest = null;      // { "<text>": "<file>.mp3" }
  let clipAudio = null;         // current clip player
  let playSeq = 0;              // bumped on every speak; lets us ignore superseded clips
  function loadManifest(){
    fetch("audio/manifest.json").then(r=> r.ok ? r.json() : null)
      .then(m=>{ clipManifest = m || {}; })
      .catch(()=>{ clipManifest = {}; });
  }
  loadManifest();
  function stopClip(){ if(clipAudio){ try{ clipAudio.pause(); clipAudio.currentTime = 0; }catch(e){} } }

  function speak(text, opts={}){
    if(!text) return Promise.resolve();
    const file = clipManifest && clipManifest[text];
    if(file){
      // play the warm pre-rendered clip
      const myToken = ++playSeq;
      return new Promise(resolve=>{
        try{
          stopClip();
          if("speechSynthesis" in window) window.speechSynthesis.cancel();
          if(!clipAudio) clipAudio = new Audio();
          let done = false, fellBack = false;
          const fin = ()=>{ if(done) return; done = true; resolve(); };
          // only fall back to TTS if THIS clip genuinely failed AND wasn't superseded
          // by a newer speak() (interrupting a clip must NOT trigger the system voice)
          const fallback = ()=>{
            if(fellBack || done) return;
            if(myToken !== playSeq){ fin(); return; }   // a newer clip took over -> just resolve, no TTS
            fellBack = true; ttsSpeak(text, opts).then(fin);
          };
          clipAudio.onended = fin;
          clipAudio.onerror = fallback;
          clipAudio.src = "audio/" + file;
          clipAudio.play().catch(fallback);
          setTimeout(fin, 9000);
        }catch(e){ ttsSpeak(text, opts).then(resolve); }
      });
    }
    return ttsSpeak(text, opts);
  }

  // Web-Speech fallback (used when a clip is missing or playback fails)
  function ttsSpeak(text, opts={}){
    if(!("speechSynthesis" in window) || !text) return Promise.resolve();
    return new Promise(resolve=>{
      try{
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "de-DE";
        if(germanVoice) u.voice = germanVoice;
        u.rate = opts.rate != null ? opts.rate : 0.82;
        u.pitch = opts.pitch != null ? opts.pitch : 1.12;
        u.volume = 1;
        let done = false;
        const fin = ()=>{ if(done) return; done = true; resolve(); };
        u.onend = fin; u.onerror = fin;
        setTimeout(fin, Math.min(8000, 1200 + text.length * 110));
        window.speechSynthesis.speak(u);
      }catch(e){ resolve(); }
    });
  }
  function stopSpeak(){ stopClip(); try{ window.speechSynthesis.cancel(); }catch(e){} }

  /* ---------- SFX (synthesized) ---------- */
  function tone(freq, dur, type="sine", gain=0.22, when=0, slideTo=null){
    const c = ensureCtx(); if(!c) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  const SFX = {
    tap(){ tone(520, 0.09, "triangle", 0.18); },
    pop(){ tone(380, 0.08, "sine", 0.2, 0, 720); },
    correct(){ tone(523,0.12,"triangle",0.22); tone(659,0.12,"triangle",0.22,0.1); tone(784,0.18,"triangle",0.22,0.2); },
    wrongSoft(){ tone(300,0.14,"sine",0.16,0,220); }, // gentle, never harsh
    star(){ tone(880,0.1,"triangle",0.2); tone(1175,0.16,"triangle",0.2,0.08); },
    fanfare(){ const n=[523,659,784,1047]; n.forEach((f,i)=>tone(f,0.22,"triangle",0.22,i*0.12)); tone(1047,0.4,"sine",0.18,0.5,1568); },
    record(){ tone(660,0.1,"sine",0.18); },
    whoosh(){ tone(200,0.25,"sawtooth",0.08,0,900); },
    // silly randomized "Pups" (fart): low buzzy tone -> lowpass (muffled) ->
    // amplitude flutter (the brap-brap) -> deflating pitch. Sounds like a raspberry, not a buzzer.
    fart(){
      const c = ensureCtx(); if(!c) return;
      const t0 = c.currentTime, dur = 0.32 + Math.random()*0.5;
      const f0 = 90 + Math.random()*60;
      const osc = c.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f0, t0);
      osc.frequency.exponentialRampToValueAtTime(f0*(0.42+Math.random()*0.22), t0+dur); // pitch drops
      const lpf = c.createBiquadFilter(); lpf.type = "lowpass";
      lpf.frequency.setValueAtTime(620 + Math.random()*260, t0);
      lpf.frequency.exponentialRampToValueAtTime(260, t0+dur);   // gets duller as it ends
      lpf.Q.value = 7 + Math.random()*6;                          // resonance = squelch
      // flutter: a tremolo on the gain, slowing down (deflating)
      const trem = c.createGain(); trem.gain.value = 0.55;
      const lfo = c.createOscillator(); lfo.type = "square";
      lfo.frequency.setValueAtTime(15 + Math.random()*16, t0);
      lfo.frequency.linearRampToValueAtTime(7 + Math.random()*6, t0+dur);
      const lfoG = c.createGain(); lfoG.gain.value = 0.45;
      lfo.connect(lfoG); lfoG.connect(trem.gain);
      // overall envelope
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, t0);
      env.gain.exponentialRampToValueAtTime(0.3, t0+0.04);
      env.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
      osc.connect(lpf); lpf.connect(trem); trem.connect(env); env.connect(c.destination);
      osc.start(t0); osc.stop(t0+dur+0.05);
      lfo.start(t0); lfo.stop(t0+dur+0.05);
    }
  };
  function sfx(name){ ensureCtx(); (SFX[name]||SFX.tap)(); }

  /* ---------- Record / playback (no STT, ever) ---------- */
  let mediaStream = null, recorder = null, chunks = [], lastBlobUrl = null;

  /* ---------- On-device acoustic analysis (encouraging guide, NOT a clinical grader) ----------
     During recording we tap the mic with an AnalyserNode and collect per-frame loudness +
     spectral features. From that we derive: did the child speak? loud/clear enough? and for
     sibilants (s/sch) a real spectral check of the frication. Everything stays on-device. */
  let analyser = null, micSource = null, sampleTimer = null, feat = null, liveLevel = 0;

  function startAnalysis(){
    try{
      const c = ensureCtx(); if(!c || !mediaStream) return;
      micSource = c.createMediaStreamSource(mediaStream);
      analyser = c.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.2;
      micSource.connect(analyser);
      const td = new Uint8Array(analyser.fftSize);
      const fd = new Uint8Array(analyser.frequencyBinCount);
      const binHz = c.sampleRate / analyser.fftSize;
      feat = { frames:0, voiced:0, maxRms:0, voicedData:[] };
      clearInterval(sampleTimer);
      sampleTimer = setInterval(()=>{
        analyser.getByteTimeDomainData(td);
        let sum=0; for(let i=0;i<td.length;i++){ const v=(td[i]-128)/128; sum+=v*v; }
        const rms = Math.sqrt(sum/td.length);
        liveLevel = Math.min(1, rms/0.3);
        feat.frames++; if(rms > feat.maxRms) feat.maxRms = rms;
        if(rms > 0.045){
          analyser.getByteFrequencyData(fd);
          let mag=0, wsum=0, hi=0;
          for(let i=1;i<fd.length;i++){ const m=fd[i]; mag+=m; wsum+=m*(i*binHz); if(i*binHz>4000) hi+=m; }
          if(mag>0){ feat.voiced++; feat.voicedData.push({rms, centroid:wsum/mag, hi:hi/mag}); }
        }
      }, 25);
    }catch(e){ feat=null; }
  }
  function stopAnalysis(){
    clearInterval(sampleTimer); sampleTimer=null; liveLevel=0;
    try{ if(micSource) micSource.disconnect(); }catch(e){}
    try{ if(analyser) analyser.disconnect(); }catch(e){}
    micSource=null; analyser=null;
  }
  // verdict: 'quiet' | 'almost' | 'good' for the given phoneme {id, sound}
  function pronunciationVerdict(phoneme){
    const sound = (phoneme && phoneme.sound) || "";
    if(!feat || feat.voiced < 3 || feat.maxRms < 0.05){
      return { verdict:"quiet", level: feat ? Math.min(1, feat.maxRms/0.3) : 0, heard:false };
    }
    const level = Math.min(1, feat.maxRms/0.28);
    const sorted = feat.voicedData.slice().sort((a,b)=>b.rms-a.rms);
    const top = sorted.slice(0, Math.max(3, Math.round(sorted.length*0.4)));
    const centroid = top.reduce((s,f)=>s+f.centroid,0)/top.length;
    const hi = top.reduce((s,f)=>s+f.hi,0)/top.length;
    let verdict = "good";
    if(sound === "s"){
      verdict = (centroid >= 3600 && hi >= 0.16) ? "good" : "almost";
    } else if(sound === "sch"){
      verdict = (centroid >= 1700 && centroid <= 4600) ? "good" : "almost";
    } else {
      verdict = (feat.voiced >= 5) ? "good" : "almost";
    }
    return { verdict, level, heard:true, centroid, hi };
  }

  async function canRecord(){
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
              window.MediaRecorder);
  }
  async function startRecording(){
    if(!(await canRecord())) throw new Error("no-record");
    if(!mediaStream){
      mediaStream = await navigator.mediaDevices.getUserMedia({audio:true});
    }
    chunks = [];
    let mime = "";
    const tryTypes = ["audio/webm","audio/mp4","audio/aac",""];
    for(const t of tryTypes){ if(t==="" || (window.MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t))){ mime = t; break; } }
    recorder = mime ? new MediaRecorder(mediaStream, {mimeType:mime}) : new MediaRecorder(mediaStream);
    recorder.ondataavailable = e=>{ if(e.data && e.data.size) chunks.push(e.data); };
    recorder.start();
    startAnalysis();
  }
  function stopRecording(){
    return new Promise(resolve=>{
      if(!recorder || recorder.state === "inactive"){ resolve(null); return; }
      recorder.onstop = ()=>{
        stopAnalysis();
        const blob = new Blob(chunks, {type: recorder.mimeType || "audio/webm"});
        if(lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
        lastBlobUrl = URL.createObjectURL(blob);
        resolve(lastBlobUrl);
      };
      recorder.stop();
    });
  }
  // release the mic stream + blob so iOS turns off the mic indicator
  function stopMic(){
    try{ if(recorder && recorder.state !== "inactive") recorder.stop(); }catch(e){}
    stopAnalysis();
    if(mediaStream){ try{ mediaStream.getTracks().forEach(t=>t.stop()); }catch(e){} mediaStream = null; }
    if(lastBlobUrl){ try{ URL.revokeObjectURL(lastBlobUrl); }catch(e){} lastBlobUrl = null; }
    recorder = null; chunks = [];
  }
  let audioEl = null;
  function playback(url){
    return new Promise(resolve=>{
      if(!url){ resolve(); return; }
      if(!audioEl){ audioEl = new Audio(); }
      audioEl.src = url;
      audioEl.onended = ()=>resolve();
      audioEl.onerror = ()=>resolve();
      audioEl.play().catch(()=>resolve());
    });
  }

  return { unlock, speak, stopSpeak, sfx, canRecord, startRecording, stopRecording, playback, stopMic,
           pronunciationVerdict,
           get liveLevel(){ return liveLevel; },
           get hasVoice(){ return !!germanVoice; } };
})();
