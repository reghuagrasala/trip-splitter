const CACHE='trip-splitter-v5';
const SHELL=['/','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k.startsWith('trip-splitter-')&&k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/')) return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(res=>{
        if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(cache=>cache.put('/',copy)); }
        return res;
      }).catch(()=>caches.match('/'))
    );
  }else{
    event.respondWith(
      caches.match(req).then(cached=>cached||fetch(req).then(res=>{
        if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(cache=>cache.put(req,copy)); }
        return res;
      }))
    );
  }
});