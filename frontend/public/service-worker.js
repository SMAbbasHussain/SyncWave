// This runs in the background
console.log('Service Worker Loaded');

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received...', data);

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: '/badge-icon.png', // A small monochrome icon for the notification bar
        data: data.data // Pass along data to the click event
    });
});

self.addEventListener('notificationclick', e => {
    e.notification.close(); // Close the notification
    
    // This opens the app to the specified URL or a default one
    const urlToOpen = e.notification.data.url || '/';
    
    e.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // If the site is already open, focus it
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});