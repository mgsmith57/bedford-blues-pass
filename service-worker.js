const staticPass = "blues-pass-v1"
const assets = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/app.js",
    "/js/qrious.min.js",
    "/js/qr-scanner.min.js",
    "/js/qr-scanner-worker.min.js",
    "/img/blues-small.png",
    "/img/favicon.ico"
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticPass).then(cache => {
            cache.addAll(assets)
        })
    )
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
});