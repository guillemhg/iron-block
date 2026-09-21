const CACHE="iron-block-v3-2";
const STATIC_ASSETS=["./manifest.webmanifest","./icon-192.png","./icon-512.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.url.includes("supabase.co"))return;

  if(event.request.mode==="navigate"){
    event.respondWith(
      fetch(event.request,{cache:"no-store"}).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put("./index.html",copy));
        return response;
      }).catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request))
  );
});
