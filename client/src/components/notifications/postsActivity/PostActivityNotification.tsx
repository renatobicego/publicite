import { POSTS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseZonedDateTime } from "@internationalized/date";
import Link from "next/link";
import {
  NotificationCard,
  NotificationBody,
  NotificationOptions,
  NotificationOptionProps,
  NotificationImage,
} from "../NotificationCard";

import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import {
  PostActivityNotification,
  PostActivtyNotificationType,
} from "@/types/postTypes";
import { postActivitiesNotificationMessages } from "./notificationMessages";
import PostActivityImage from "./PostActivityImage";

const PostActivityNotificationCard = ({
  notification,
}: {
  notification: PostActivityNotification;
}) => {
  const { event, viewed, date } =
    notification;
  const {
    frontData: {
      postActivity: { post, user, postReaction },
    },
  } = notification;

  // const { userIdLogged, usernameLogged } = useUserData();
  // const { updateSocketToken } = useSocket();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    // const notificationMessage =
    //   postActivitiesNotificationMessages[event as PostActivtyNotificationType];

    // // Check if acceptAction exists before adding it to options
    // if (notificationMessage?.acceptAction && isActionsAvailable) {
    //   optionsList.push({
    //     label: "Aceptar Solicitud",
    //     onPress: async () => {
    //       const socket = await updateSocketToken();
    //       notificationMessage.acceptAction?.(
    //         socket,
    //         {
    //           _id: magazine._id,
    //           name: magazine.name,
    //           ownerType: magazine.ownerType,
    //         },
    //         {
    //           _id: userIdLogged,
    //           username: usernameLogged,
    //         },
    //         backData.userIdFrom,
    //         _id
    //       );
    //     },
    //   });
    // }
    optionsList.push({
      label: "Ver Anuncio",
      as: Link,
      className: "text-text-color",
      href: `${POSTS}/${post._id}`,
    });
    // if (notificationMessage?.rejectAction && isActionsAvailable) {
    //   optionsList.push({
    //     label: "Rechazar Solicitud",
    //     color: "danger",
    //     onPress: async () => {
    //       const socket = await updateSocketToken();

    //       notificationMessage.rejectAction?.(
    //         socket,
    //         {
    //           _id: magazine._id,
    //           name: magazine.name,
    //           ownerType: magazine.ownerType,
    //         },
    //         {
    //           _id: userIdLogged,
    //           username: usernameLogged,
    //         },
    //         backData.userIdFrom,
    //         _id
    //       );
    //     },
    //   });
    // }
    return optionsList;
  };

  const getMessageToShow = () => {
    const notificationMessage =
      postActivitiesNotificationMessages[event as PostActivtyNotificationType];
    switch (event) {
      case "notification_post_new_reaction":
        return (
          <>
            <em className="font-semibold">{user.username}</em>{" "}
            {notificationMessage.message}{" "}
            <em className="font-semibold">{post.title}</em>
          </>
        );
      default:
        return <>{notificationMessage.message}</>;
    }
  };

  return (
    <NotificationCard isNew={!viewed}>
      <NotificationImage>
        <PostActivityImage
          postTitle={post.title}
          isPetition={post.postType === "petition"}
          image={post.imageUrl}
          reaction={postReaction?.emoji}
        />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">{getMessageToShow()}</p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default PostActivityNotificationCard;
