// notifications.ts

// Request notification permission
export const requestNotificationPermission = async () => {
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// Display a browser notification
export const showBrowserNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, options);
      } else {
        console.warn("Notification permission denied.");
      }
    });
  } else {
    console.warn("Notification permission not granted.");
  }
};
