/* EveryGame Offline™ offline cache. The version changes on every build, so phones pick up new games automatically. */
const VERSION='0172aa2110';
const FILES=["./index.html", "./rarebit/index.html", "./rarebit/bank/index.json", "./casino/index.html", "./wildtrumps/index.html", "./shed/index.html", "./cheat/index.html", "./wordl/index.html", "./memory/index.html", "./2048/index.html", "./backgammon/index.html", "./minesweeper/index.html", "./cambio/index.html", "./connect4/index.html", "./findmatch/index.html", "./pool/index.html", "./soccer/index.html", "./numbermatch/index.html", "./basketball/index.html", "./privacy.html", "./manifest.webmanifest", "./icons/apple-touch-icon.png", "./icons/icon-1024.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png"];
const RUNTIME='rg-runtime';
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!==RUNTIME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // pages: try the network first so updates show straight away, fall back to the saved copy offline
    if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return}
    // everything else on this site (including Rarebit's answer bank, loaded one question at a time): saved copy first, keep new files once fetched
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})));return;
  }
  // fonts and the online-play library: keep a copy after first use
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)||u.hostname==='unpkg.com'){
    e.respondWith(caches.open(RUNTIME).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))));
  }
});
