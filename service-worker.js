// ذخیره منابع در کش
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('my-cache').then(cache => {
            return cache.addAll([
                '/', // ریشه
                '/index.html', // صفحه اصلی
                '/style.css', // فایل CSS
                '/script.js' // فایل JS
            ]);
        })
    );
});

// پاسخ‌گویی به درخواست‌ها در حالت آفلاین
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).catch(() => {
                return caches.match('/index.html');
            });
        })
    );
});