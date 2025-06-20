// This file runs in the browser's background.
// Remember to unregister and reload to apply changes.

console.log('[SW] Service Worker Loaded.');

// This listener fires when a push message is received.
self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('[SW] Push event received:', data);

    // This is the core logic: check for focused clients before showing a notification.
    // We wrap this logic in e.waitUntil() to ensure the service worker
    // stays active until the promise chain is complete.
    const promiseChain = self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    })
    .then(windowClients => {
        // Check if any of the open tabs/windows are currently focused.
        const isAppFocused = windowClients.some(client => client.focused);

        // If an app tab is focused, do NOT show the system notification.
        // The main app's socket listener is responsible for showing the in-app toast.
        if (isAppFocused) {
            console.log('[SW] App is focused. Suppressing system notification.');
            return; // Return nothing, so no notification is shown.
        }

        // If no app tab is focused (i.e., app is in the background or closed),
        // then we MUST show the system notification.
        console.log('[SW] App is not focused. Showing system notification.');
        return self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/logo192.png',
            badge: data.badge || '/logo192.png',
            data: data.data
        });
    });

    e.waitUntil(promiseChain);
});


// This listener fires when the user clicks on the notification.
// NO CHANGES ARE NEEDED HERE.
self.addEventListener('notificationclick', e => {
    console.log('[SW] Notification clicked!', e.notification);
    
    e.notification.close();
    
    const urlToOpen = e.notification.data.url || '/';
    console.log(`[SW] Attempting to open or focus URL: ${urlToOpen}`);
    
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let client of clientList) {
                if (new URL(client.url).pathname === new URL(urlToOpen, self.location.origin).pathname && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});