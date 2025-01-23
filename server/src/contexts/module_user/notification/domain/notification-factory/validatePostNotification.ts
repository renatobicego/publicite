import { NotificationPostType } from "../entity/enum/notification.post.type.enum";

interface notificationPostData {
    frontData: {
        postActivity: {
            notificationPostType: NotificationPostType
            user: {
                username: string;
            },
            post: {
                _id: string;
                title: string;
                imageUrl: string;
                postType: string;
            }
            postReaction?: {
                emoji: string;
            }
            postComment?: {
                comment: string
            },
            postResponse?: {
                author: string,
                commentId: string,
                response: string
            }

        }
    };

}

export function validatePostNotification(notificationData: notificationPostData) {
    const postActivity = notificationData.frontData.postActivity;
    const notificationType = postActivity.notificationPostType;
    console.log(notificationData)
    if (!notificationType) {
        throw new Error("Notificación no válida, se requiere el 'notificationPostType' del tipo post.");
    }

    if (notificationType === NotificationPostType.comment) {
        if (!postActivity.postComment) {
            throw new Error("Notificación no válida, se requiere 'postComment' para el tipo post de comentario.");
        }
    } else if (notificationType === NotificationPostType.reaction) {
        if (!postActivity.postReaction) {
            throw new Error("Notificación no válida, se requiere 'postReaction' para el tipo post de reacción.");
        }
    } else if (notificationType === NotificationPostType.response) {
        if (!postActivity.postResponse) {
            throw new Error("Notificación no válida, se requiere 'postReaction' para el tipo post de reacción.");
        }
    } else {
        throw new Error("Notificación no válida, tipo de actividad de post desconocido.");
    }
}