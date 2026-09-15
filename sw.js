const C = "canopy-cache-v10";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(C).then(c =>
      c.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./icon-192.png",
        "./icon-512.png"
      ])
    )
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== C)
          .map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Never let the Canopy service worker intercept backend API calls.
  // This keeps Render/API responses as real JSON responses.
  if (url.pathname.startsWith("/api/") ||
      url.hostname.includes("onrender.com")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r =>
      r ||
      fetch(e.request).then(x => {
        const y = x.clone();
        caches.open(C).then(c => c.put(e.request, y));
        return x;
      })
    )
  );
});

self.addEventListener("push", event => {
  let data = {
    title: "Canopy Alarm",
    body: "You have a reminder on your Canopy plan.",
    url: "./index.html",
    reminderId: ""
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (_) {}

  // This is a persistent, attention-grabbing notification. The operating
  // system controls the actual notification sound, but we ask it not to
  // silence the alert and to vibrate where supported.
  event.waitUntil(
    self.registration.showNotification(data.title || "Canopy Alarm", {
      body: data.body || "Your Canopy reminder is due.",
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: data.reminderId ? `canopy-reminder-${data.reminderId}` : "canopy-reminder",
      renotify: true,
      requireInteraction: true,
      silent: false,
      vibrate: [250, 120, 250, 120, 500],
      timestamp: Date.now(),
      actions: [
        { action: "open", title: "Open Canopy" },
        { action: "dismiss", title: "Dismiss" }
      ],
      data: {
        url: data.url || "./index.html",
        reminderId: data.reminderId || ""
      }
    })
  );
});

self.addEventListener("notificationclick", event => {
  const action = event.action;

  // Dismiss means exactly that: close the alarm without opening the app.
  if (action === "dismiss") {
    event.notification.close();
    return;
  }

  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(cs => {
      const target = event.notification.data?.url || "./index.html";
      for (const c of cs) {
        if ("focus" in c) {
          c.navigate?.(target);
          return c.focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});


// When a notification is opened while a Canopy page is available,
// ask the page to start its continuous alarm engine.
self.addEventListener("notificationclick", event => {
  const data = event.notification?.data || {};
  event.notification.close();
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({type:"window", includeUncontrolled:true});
    if (clientsList.length) {
      const client = clientsList[0];
      client.postMessage({
        type: "CANOPY_ALARM",
        title: data.title || "Canopy Alarm",
        body: data.body || "Your scheduled activity is due."
      });
      return client.focus();
    }
    return clients.openWindow(data.url || "./index.html");
  })());
});
