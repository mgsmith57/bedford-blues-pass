const staticPass = "blues-pass-v1.1"
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

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (staticPass !== key) {
                    return caches.delete(key);
                }
            })
        )).then(() => {
            console.log('Cache version installed - ' + staticPass);
        })
    );
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
});