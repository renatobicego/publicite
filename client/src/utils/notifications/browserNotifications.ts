// Check if notifications are supported in this browser
const notificationsSupported = () => {
  return "Notification" in window;
};

// Request notification permission with better user experience
export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    // Check if notifications are supported
    if (!notificationsSupported()) {
      return "denied";
    }

    // Check if we already have permission
    if (Notification.permission === "granted") {
      return "granted";
    }

    // Only ask for permission after user interaction (like a button click)
    // to avoid auto-blocking by browsers
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      return "denied";
    }
  };

// Display a browser notification with improved reliability
export const showBrowserNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  // Check if notifications are supported
  if (!notificationsSupported()) {
    return null;
  }

  // If we have permission, show the notification
  if (Notification.permission === "granted") {
    try {
      // Create notification with error handling
      const notification = new Notification(title, {
        // Set a default icon if not provided (helps with visibility)
        icon: options?.icon || "/icon.png",
        // Ensure notifications stay visible longer
        requireInteraction:
          options?.requireInteraction !== undefined
            ? options.requireInteraction
            : true,
        ...options,
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  } else if (Notification.permission === "default") {
    return null;
  } else {
    return null;
  }
};

// Check if notifications are blocked in browser settings
export const checkNotificationsBlocked = (): boolean => {
  if (!notificationsSupported()) return true;
  return Notification.permission === "denied";
};

// Helper to create a notification button that handles permission properly
export const createNotificationWithUserInteraction = (
  title: string,
  options?: NotificationOptions
) => {
  // This should be called from a click handler
  requestNotificationPermission().then((permission) => {
    if (permission === "granted") {
      showBrowserNotification(title, options);
    }
  });
};
