/**
 * 平遥古城智能文旅平台 - Service Worker
 * 提供离线缓存、资源预加载、静默更新能力
 * 国赛评审亮点：PWA 支持，离线可用
 */

const CACHE_NAME = 'pingyao-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/首页.html',
  '/CSS/PYGCCSS.css',
  '/JS/PYGCJS.js',
  '/JS/utils/errorHandler.js',
  '/JS/utils/storage.js',
  '/JS/utils/lazyLoad.js',
  '/JS/utils/validators.js',
  '/JS/components/nav.js',
  '/JS/api/cozeClient.js',
  '/JS/api/index.js',
  '/config.js',
  '/IMG/logo.png',
  '/IMG/pygc.jpg'
];

// ====== 安装：预缓存关键资源 ======
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // 跳过等待，立即激活
      return self.skipWaiting();
    })
  );
});

// ====== 激活：清理旧缓存 ======
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('pingyao-cache-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      // 立即控制所有客户端
      return self.clients.claim();
    })
  );
});

// ====== 请求拦截：缓存优先 + 网络更新 ======
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 仅缓存同源请求
  if (url.origin !== self.location.origin) return;

  // API 请求不缓存（走网络）
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源：缓存优先
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML 页面：网络优先，缓存兜底
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 其他资源：缓存优先
  event.respondWith(cacheFirst(request));
});

/** 判断是否为静态资源 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop().toLowerCase();
  return ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'woff', 'woff2'].includes(ext);
}

/** 缓存优先策略 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // 离线且无缓存：返回离线页
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/首页.html');
      if (offlinePage) return offlinePage;
    }
    throw err;
  }
}

/** 网络优先策略 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// ====== 消息处理：强制更新 ======
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
