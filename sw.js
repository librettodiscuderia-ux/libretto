/* Libretto di Scuderia · service worker */
const VERSIONE = "libretto-v1";
const BASE = ["./", "manifest.webmanifest", "icona-192.png", "icona-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const font = u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (u.origin !== location.origin && !font) return;

  if (r.mode === "navigate" || u.pathname.endsWith("/index.html")){
    e.respondWith(fetch(r).then(res => {
      if (res.ok){ const copia = res.clone(); caches.open(VERSIONE).then(c => c.put("./", copia)); }
      return res;
    }).catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.ok || res.type === "opaque"){ const copia = res.clone(); caches.open(VERSIONE).then(c => c.put(r, copia)); }
    return res;
  })));
});
