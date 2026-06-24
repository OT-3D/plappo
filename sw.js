/* Plappo service worker – offline-first precache. Bump CACHE on release. */
const CACHE = "plappo-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/diary.js",
  "./js/face.js",
  "./js/fun/bubbles.js",
  "./js/fun/catch.js",
  "./js/fun/pups.js",
  "./fonts/fredoka-500.woff2","./fonts/fredoka-600.woff2","./fonts/fredoka-700.woff2",
  "./fonts/nunito-400.woff2","./fonts/nunito-700.woff2","./fonts/nunito-800.woff2",
  "./audio/manifest.json",
  "./js/data.js",
  "./js/audio.js",
  "./js/state.js",
  "./js/ui.js",
  "./js/app.js",
  "./js/games/repeat.js",
  "./js/games/wordworld.js",
  "./js/games/sameDifferent.js",
  "./js/games/minimalpair.js",
  "./js/games/anlaut.js",
  "./js/games/syllables.js",
  "./js/games/rhyme.js",
  "./js/games/mundmotorik.js",
  "./js/games/quatschmaschine.js",
  "./js/games/zauberschluessel.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      await Promise.allSettled(ASSETS.map(a => c.add(a)));
      // precache all pre-rendered voice clips listed in the manifest
      try{
        const m = await (await fetch("./audio/manifest.json")).json();
        const files = [...new Set(Object.values(m))].map(f => "./audio/" + f);
        await Promise.allSettled(files.map(f => c.add(f)));
      }catch(e){}
    }).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// cache-first for same-origin GET; network fallback; update cache in background
self.addEventListener("fetch", (e)=>{
  const req = e.request;
  if(req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if(res && res.status === 200){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(()=> cached);
      return cached || net;
    })
  );
});
