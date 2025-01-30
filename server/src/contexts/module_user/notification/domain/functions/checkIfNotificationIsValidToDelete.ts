const validDeleteNotification = new Set([
    'notification_magazine_acepted', // Usuario B acepta la invitacion
    'notification_magazine_rejected', // Usuario B rechaza la invitacion
    'notification_magazine_user_has_been_removed', // Te han eliminado de la revista
    'notification_group_user_accepted', // te han aceptado en un grupo
    'notification_group_user_rejected', // te han rechazado en un grupo
    'notification_group_user_removed_from_group', // te han eliminado del grupo
    'notification_group_user_new_admin', // te han convertido en administrador
    'notification_group_user_removed_admin', // Te han quitado el rol de administrador
    'notification_user_new_relation_accepted', // Usuario A acepto tu relacion de amistad
    'notifications_user_new_relation_rejected',
    'notification_user_friend_request_accepted', // 
    'notification_user_friend_request_rejected', // 
    'notification_post_new_reaction', // han reaccionado a un post
    'notification_post_new_comment', // han comentado tu post
    'notification_post_new_comment_response', // han respondido tu comentario

]);



export default function checkIfNotificationIsValidToDelete(event: string): boolean {
    return validDeleteNotification.has(event);
}



