/* ============================================================
   PLAPPO – Sprach-Tagebuch (speech diary)
   Stores the child's own recordings per word over time in
   IndexedDB (audio blobs stay on-device). Lets the child hear
   "Früher" vs "Jetzt" to notice their own improvement.
   Self-monitoring (perception precedes production) is a core
   speech-therapy principle.
   ============================================================ */
window.PlappoDiary = (function(){
  const DB = "plappo-diary", STORE = "rec", VER = 1, KEEP_PER_WORD = 8;
  let dbp = null;
  const ok = !!window.indexedDB;

  function open(){
    if(dbp) return dbp;
    dbp = new Promise((res, rej)=>{
      const r = indexedDB.open(DB, VER);
      r.onupgradeneeded = e=>{
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORE)){
          const os = db.createObjectStore(STORE, {keyPath:"id", autoIncrement:true});
          os.createIndex("word", "word", {unique:false});
        }
      };
      r.onsuccess = e=> res(e.target.result);
      r.onerror = ()=> rej(r.error);
    });
    return dbp;
  }
  function tx(mode){ return open().then(db=> db.transaction(STORE, mode).objectStore(STORE)); }

  // save a recording (blob) for a word; prune to KEEP_PER_WORD (keep oldest + most recent)
  async function save(word, sound, blob){
    if(!ok || !blob) return;
    try{
      const store = await tx("readwrite");
      store.add({ word, sound, blob, ts: Date.now() });
      await done(store.transaction);
      await prune(word);
    }catch(e){}
  }
  function done(t){ return new Promise((res,rej)=>{ t.oncomplete=()=>res(); t.onerror=()=>rej(t.error); }); }

  async function byWord(word){
    if(!ok) return [];
    let store;
    try{ store = await tx("readonly"); }catch(e){ return []; }
    return new Promise((res)=>{
      const out=[]; const idx=store.index("word");
      const rq = idx.openCursor(IDBKeyRange.only(word));
      rq.onsuccess = e=>{ const c=e.target.result; if(c){ out.push(c.value); c.continue(); } else res(out.sort((a,b)=>a.ts-b.ts)); };
      rq.onerror = ()=> res(out);
    });
  }
  async function prune(word){
    const recs = await byWord(word);
    if(recs.length <= KEEP_PER_WORD) return;
    // keep the very first (baseline) + the most recent (KEEP_PER_WORD-1)
    const keep = new Set([recs[0].id, ...recs.slice(-(KEEP_PER_WORD-1)).map(r=>r.id)]);
    const store = await tx("readwrite");
    recs.forEach(r=>{ if(!keep.has(r.id)) store.delete(r.id); });
    await done(store.transaction);
  }

  // list practised words with counts + first/latest timestamps
  async function words(){
    const store = await tx("readonly");
    return new Promise((res)=>{
      const map = new Map();
      const rq = store.openCursor();
      rq.onsuccess = e=>{
        const c = e.target.result;
        if(c){ const v=c.value; const m=map.get(v.word)||{word:v.word,sound:v.sound,count:0,first:v.ts,latest:v.ts};
          m.count++; m.first=Math.min(m.first,v.ts); m.latest=Math.max(m.latest,v.ts); map.set(v.word,m); c.continue(); }
        else res([...map.values()].sort((a,b)=>b.latest-a.latest));
      };
      rq.onerror = ()=> res([]);
    });
  }
  // {first:{blob,ts}, latest:{blob,ts}} for a word (null parts if <2 recordings)
  async function firstLatest(word){
    const recs = await byWord(word);
    if(!recs.length) return { first:null, latest:null };
    return { first: recs[0], latest: recs[recs.length-1], count: recs.length };
  }
  function url(rec){ return rec && rec.blob ? URL.createObjectURL(rec.blob) : null; }

  return { available: ok, save, words, firstLatest, byWord, url };
})();
