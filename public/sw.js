// Service Worker for MyDo App
const CACHE_NAME = "mydo-v1";
const urlsToCache = ["/", "/tasks", "/profile", "/settings"];

// Install event
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	);
});

// Fetch event
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Return cached version or fetch from network
			return response || fetch(event.request);
		})
	);
});

// Online/Offline detection
self.addEventListener("online", () => {
	// Send message to main thread that we're back online
	self.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			client.postMessage({
				type: "ONLINE_STATUS",
				isOnline: true,
				timestamp: new Date().toISOString(),
			});
		});
	});
});

self.addEventListener("offline", () => {
	// Send message to main thread that we're offline
	self.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			client.postMessage({
				type: "ONLINE_STATUS",
				isOnline: false,
				timestamp: new Date().toISOString(),
			});
		});
	});
});

// Push notification handling
self.addEventListener("push", (event) => {
	const options = {
		body: event.data ? event.data.text() : "You have a new notification!",
		icon: "/icon-192x192.png",
		badge: "/badge-72x72.png",
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1,
		},
		actions: [
			{
				action: "explore",
				title: "View",
				icon: "/icon-192x192.png",
			},
			{
				action: "close",
				title: "Close",
				icon: "/icon-192x192.png",
			},
		],
	};

	event.waitUntil(
		self.registration.showNotification("MyDo Notification", options)
	);
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/tasks"));
	}
});
