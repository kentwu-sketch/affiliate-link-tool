// Service Worker for Affiliate Link Tool
const CACHE_NAME = 'affiliate-tool-v2.1'; // 每次更新時改變這個版本號
const urlsToCache = [
  './',
  './index.html',
  './app-icon-192.png',
  './app-icon-512.png',
  './manifest.json'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // 立即啟用新的 Service Worker
  );
});

// 啟用 Service Worker 並清除舊快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即控制所有頁面
  );
});

// 處理請求
self.addEventListener('fetch', event => {
  event.respondWith(
    // 網路優先策略 - 優先獲取最新版本
    fetch(event.request)
      .then(response => {
        // 如果成功獲取,更新快取
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 如果網路失敗,使用快取
        return caches.match(event.request);
      })
  );
});
