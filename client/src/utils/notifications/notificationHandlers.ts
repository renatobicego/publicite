// notificationHandlers.ts
import { GroupNotification, GroupNotificationType } from "@/types/groupTypes";
import {
  MagazineNotification,
  MagazineNotificationType,
} from "@/types/magazineTypes";
import { groupNotificationBaseMessages } from "@/components/notifications/groups/notificationMessages";
import { notificationMagazineBaseMessages } from "@/components/notifications/magazines/notificationMessages";
import { showBrowserNotification } from "./browserNotifications";
import {
  UserRelationNotification,
  UserRelationNotificationType,
} from "@/types/userTypes";
import { userRelationNotificationMessages } from "@/components/notifications/users/notificationMessages";
import { relationTypes } from "../data/selectData";

// Handle group notifications
export const handleGroupNotification = (data: GroupNotification) => {
  const event = data.event as GroupNotificationType;
  const showUser = groupNotificationBaseMessages[event].showUser;
  const groupName = data.frontData.group.name;
  const message = showUser
    ? `${data.frontData.group.userInviting.username} ${groupNotificationBaseMessages[event].message} ${groupName}`
    : `${groupNotificationBaseMessages[event].message} ${groupName}`;

  showBrowserNotification("Publicité - Nueva notificación de grupo", {
    body: message,
    badge: "/logo.png",
  });
};

// Handle magazine notifications
export const handleMagazineNotification = (data: MagazineNotification) => {
  const event = data.event as MagazineNotificationType;
  const showUser = notificationMagazineBaseMessages[event].showUser;
  const magazineName = data.frontData.magazine.name;
  const message = showUser
    ? `${data.frontData.magazine.userInviting.username} ${notificationMagazineBaseMessages[event].message} ${magazineName}`
    : `${notificationMagazineBaseMessages[event].message} ${magazineName}`;

  showBrowserNotification("Publicité - Nueva notificación de revista", {
    body: message,
    badge: "/logo.png",
  });
};

// Handle user rwlation notifications
export const handleUserRelationNotification = (
  data: UserRelationNotification
) => {
  const event = data.event as UserRelationNotificationType;
  const {
    userRelation: { userFrom, typeRelation },
  } = data.frontData;
  const message = `${userFrom.username} ${
    userRelationNotificationMessages[event].message
  } ${
    relationTypes.find((r) => r.value === typeRelation)?.label || typeRelation
  }`;

  showBrowserNotification(
    "Publicité - Nueva notificación de relación de usuario",
    {
      body: message,
      badge: "/logo.png",
    }
  );
};
