/* ─────────────────────────────────────────────────────────
   Pocket Procedures — Service Worker
   Strategy:
     • Shell (HTML + same-origin assets): cache-first, update in background
     • Supabase API (GET): network-first, fall back to cache for offline
     • Navigation: serve cached shell on network failure (offline SPA)
   ───────────────────────────────────────────────────────── */

const SHELL_CACHE   = 'pp-shell-v1'
const DATA_CACHE    = 'pp-data-v1'
const OFFLINE_URL   = '/index.html'

const PRECACHE_URLS = [
  '/',
  '/index.html',
]

// ── Install: pre-cache shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: purge old caches ────────────────────────────
self.addEventListener('activate', event => {
  const KEEP = [SHELL_CACHE, DATA_CACHE]
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET
  if (request.method !== 'GET') return

  // 1. Navigation requests → serve shell, fallback to cached shell offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          caches.open(SHELL_CACHE).then(c => c.put(OFFLINE_URL, response.clone()))
          return response
        })
        .catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // 2. Same-origin static assets (JS, CSS, images) → cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          caches.open(SHELL_CACHE).then(c => c.put(request, response.clone()))
          return response
        })
        return cached || networkFetch
      })
    )
    return
  }

  // 3. Supabase API → network-first, cache GET responses for offline fallback
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            caches.open(DATA_CACHE).then(c => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }
})

// ── Message: allow clients to trigger cache clear ─────────
self.addEventListener('message', event => {
  if (event.data?.type === 'CLEAR_DATA_CACHE') {
    caches.delete(DATA_CACHE)
  }
})
