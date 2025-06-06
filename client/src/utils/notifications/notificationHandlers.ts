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
  ElementSharedNotification,
  ShareTypesEnum,
  UserRelationNotification,
  UserRelationNotificationType,
} from "@/types/userTypes";
import { userRelationNotificationMessages } from "@/components/notifications/users/notificationMessages";
import { relationTypes } from "../data/selectData";
import {
  ContactSellerNotification,
  PostActivityNotification,
  PostActivityNotificationType,
  PostCalificationNotification,
  PostCalificationNotificationType,
} from "@/types/postTypes";
import { postActivitiesNotificationMessages } from "@/components/notifications/postsActivity/notificationMessages";
import { postCalificationNotificationMessages } from "@/components/notifications/postsCalification/notificationMessages";

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

export const handlePostActivityNotification = (
  data: PostActivityNotification
) => {
  const event = data.event as PostActivityNotificationType;

  const messageInfo = postActivitiesNotificationMessages[event];
  let message = "";
  const { user, post, notificationPostType } = data.frontData.postActivity;
  switch (notificationPostType) {
    case "reaction":
      const { emoji } = data.frontData.postActivity.postReaction!;
      message = `${user.username} ${messageInfo.message} ${post.title} - ${emoji}`;
      break;
    case "comment":
      const { comment } = data.frontData.postActivity.postComment!;
      message = `${user.username} ${messageInfo.message} ${post.title} - "${
        comment.length > 40 ? comment.slice(0, 40) + "..." : comment
      }"`;
      break;
    case "response":
      const { response } = data.frontData.postActivity.postResponse!;
      message = `${user.username} ${messageInfo.message} ${post.title} - "${
        response.length > 40 ? response.slice(0, 40) + "..." : response
      }"`;
      break;
    default:
      message = messageInfo.message;
  }

  showBrowserNotification(
    "Publicité - Nueva notificación de actividad en anuncio",
    {
      body: message,
      badge: "/logo.png",
    }
  );
};

export const handlePostCalificationNotification = (
  data: PostCalificationNotification
) => {
  const event = data.event as PostCalificationNotificationType;

  const messageInfo = postCalificationNotificationMessages[event];
  const { post } = data.frontData.postCalification;
  let message = `${messageInfo.message} ${post.title}`;

  showBrowserNotification(
    "Publicité - Nueva notificación de actividad en anuncio",
    {
      body: message,
      badge: "/logo.png",
    }
  );
};

export const handlePostContactSellerNotification = (
  data: ContactSellerNotification
) => {
  const { post, client } = data.frontData.contactSeller;
  const message = `${client.name} ${client.lastName} te ha contactado por el anuncio de "${post.title}".`;
  showBrowserNotification("Publicité - Nueva petición de contacto", {
    body: message,
    badge: "/logo.png",
  });
};

export const handleElementSharedNotification = (
  data: ElementSharedNotification
) => {
  const { description, type, username } = data.frontData.share;
  const typeToShow: Record<ShareTypesEnum, string> = {
    group: "el grupo",
    post: "el anuncio",
    magazine: "la revista",
    user: "el perfil",
  };

  const typeTOSHowOnBrowserNotification: Record<ShareTypesEnum, string> = {
    group: "un grupo",
    post: "un anuncio",
    magazine: "una revista",
    user: "un perfil",
  };
  const message = `${username} te ha compartido ${typeToShow[type]} ${description}`;
  showBrowserNotification(
    "Publicité - Te han compartido " + typeTOSHowOnBrowserNotification[type],
    {
      body: message,
      badge: "/logo.png",
    }
  );
};
