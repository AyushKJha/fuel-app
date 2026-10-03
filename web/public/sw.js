const CACHE='fuel-shell-v4';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(async cache=>{await cache.addAll(['/offline','/welcome','/privacy','/icon-192.png','/icon-512.png']);const shell=await cache.match('/offline');if(shell){const html=await shell.text(),assets=[...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map(match=>match[1]);await cache.addAll([...new Set(assets)]);}}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('fuel-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(url.pathname==='/welcome'?'/welcome':'/offline');return cached||Response.error();}));return;}
 if(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/icon-'))event.respondWith(caches.open(CACHE).then(async cache=>{const old=await cache.match(event.request);if(old)return old;const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.openWindow('/?summary=1'));});
