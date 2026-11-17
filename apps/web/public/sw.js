
const CACHE_NAME = "talora-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin page navigation.
  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/") || new Response(
          "You are offline. Please reconnect to use TALORA.",
          { headers: { "Content-Type": "text/plain" } }
        );
      })
    );
  }
});
