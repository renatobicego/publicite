import { POSTS } from "@/utils/data/urls";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import {
  NotificationCard,
  NotificationBody,
  NotificationOptions,
  NotificationOptionProps,
  NotificationImage,
} from "../NotificationCard";

import {
  PostActivityNotification,
  PostActivityNotificationType,
} from "@/types/postTypes";
import { postActivitiesNotificationMessages } from "./notificationMessages";
import PostActivityImage from "./PostActivityImage";
import { checkAndAddDeleteNotification } from "../deleteNotification";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";
import { Link } from "@nextui-org/react";
import { useNotificationsIsOpen } from "@/components/Header/Notifications/notificationsOptionsProvider";

const PostActivityNotificationCard = ({
  notification,
}: {
  notification: PostActivityNotification;
}) => {
  const { setIsOpen } = useNotificationsIsOpen();
  const { event, viewed, date, _id } = notification;
  const {
    frontData: { postActivity },
  } = notification;
  const { post, user, notificationPostType } = postActivity;
  const { deleteNotification } = useNotificationsContext();

  // const { userIdLogged, usernameLogged } = useUserData();
  // const { updateSocketToken } = useSocket();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    // const notificationMessage =
    //   postActivitiesNotificationMessages[event as PostActivityNotificationType];

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
      color: "default",
      onClick: () => setIsOpen(false),
      className: "text-text-color",
      href: `${POSTS}/${post._id}`,
    });
    if (notificationPostType === "response") {
      optionsList.push({
        label: "Ver Respuesta",
        as: Link,
        color: "default",
        onClick: () => setIsOpen(false),
        className: "text-text-color",
        href: `${POSTS}/${post._id}#${postActivity.postResponse?.commentId}`,
      });
    }

    if (notificationPostType === "comment") {
      optionsList.push({
        label: "Ver Comentario",
        as: Link,
        color: "default",
        onClick: () => setIsOpen(false),
        className: "text-text-color",
        href: `${POSTS}/${post._id}#comentarios`,
      });
    }
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
    checkAndAddDeleteNotification(optionsList, event, _id, deleteNotification);

    return optionsList;
  };

  const getMessageToShow = () => {
    const notificationMessage =
      postActivitiesNotificationMessages[event as PostActivityNotificationType];
    switch (event as PostActivityNotificationType) {
      case "notification_post_new_reaction":
        return (
          <>
            <em className="font-semibold">{user.username}</em>{" "}
            {notificationMessage.message}{" "}
            <em className="font-semibold">{post.title}</em>
          </>
        );
      case "notification_post_new_comment":
        const comment =
          notificationPostType === "comment"
            ? postActivity.postComment?.comment!
            : "";
        return (
          <>
            <em className="font-semibold">{user.username}</em>{" "}
            {notificationMessage.message}{" "}
            <em>{`"${
              comment.length > 40 ? comment.slice(0, 40) + "..." : comment
            }"`}</em>
          </>
        );

      case "notification_post_new_comment_response":
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
    <NotificationCard isNew={!viewed} id={_id}>
      <NotificationImage>
        <PostActivityImage
          postTitle={post.title}
          isPetition={post.postType === "petition"}
          image={post.imageUrl}
          reaction={
            notificationPostType === "reaction"
              ? postActivity.postReaction?.emoji
              : undefined
          }
        />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">{getMessageToShow()}</p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseIsoDate(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default PostActivityNotificationCard;
