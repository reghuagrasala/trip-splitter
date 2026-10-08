const CACHE='trip-splitter-v3';
const APP_SHELL=['/','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  const url=new URL(req.url);
  if(url.origin!==location.origin) return;

  // Trip data is stored in IndexedDB by the app. Do not cache API
  // responses, which could otherwise overwrite the local-first model.
  if(url.pathname.startsWith('/api/')) return;

  // The worker serves /t/<id> with the same HTML app. Return the cached
  // app shell immediately when offline; IndexedDB restores the trip.
  if(req.mode==='navigate'){
    event.respondWith(
      caches.match('/').then(cached=>{
        const network=fetch(req).then(res=>{
          if(res.ok){
            const copy=res.clone();
            caches.open(CACHE).then(cache=>cache.put('/',copy));
          }
          return res;
        }).catch(()=>cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        if(res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
        }
        return res;
      }).catch(()=>cached);
    })
  );
});