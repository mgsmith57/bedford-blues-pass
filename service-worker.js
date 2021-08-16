const staticPass = "blues-pass-v1.3"
const assets = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/app.js",
    "/js/qrious.min.js",
    "/js/qr-scanner.min.js",
    "/js/qr-scanner-worker.min.js",
    "/img/blues-small.png",
    "/img/favicon.ico",
    "/img/icon-192x192.png",
    "/img/icon-256x256.png",
    "/img/icon-384x384.png",
    "/img/icon-512x512.png",
    "https://fonts.googleapis.com/css?family=Open+Sans:300,300i,700&display=swap"
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
    );
    fetchEvent.waitUntil(
        update(fetchEvent.request).then(refresh)
    );
});

function update(request) {
    return caches.open(staticPass).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response.clone()).then(function () {
                return response;
            });
        });
    });
}

function refresh(response) {
    return self.clients.matchAll().then(function (clients) {
        clients.forEach(function (client) {
        var message = {
            type: 'refresh',
            url: response.url,
            eTag: response.headers.get('ETag')
        };
            client.postMessage(JSON.stringify(message));
        });
    });
}