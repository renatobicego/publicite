const GROUP_NOTIFICATION_send_group = [
    'notification_group_new_user_invited', // Te han invitado a un grupo -> 0
    'notification_group_new_user_added', // Te han agregado a un grupo -> 1
    'notification_group_user_accepted', // Te han aceptado en un grupo -> 2
    'notification_group_user_rejected', // Te han rechazado en un grupo -> 3
    'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo -> 4
    'notification_group_user_request_group_invitation', // Usuario A quiere pertenecer a grupo -> 5
]

const notification_group_new_user_invited = GROUP_NOTIFICATION_send_group[0]


const user_events = [
    'notification_user_new_friend_request', // Usuario A le envia la nueva relación de contacto a Usuario B
    'notification_user_friend_request_accepted', // 
    'notification_user_friend_request_rejected', // 
    'notification_user_new_relation_change', // Nueva relacion de amistad 
    'notification_user_new_relation_accepted', // Usuario A acepto tu relacion de amistad
    'notifications_user_new_relation_rejected'
]

const notification_user_new_friend_request = user_events[0]
const notification_user_friend_request_accepted = user_events[1]
const notification_user_new_relation_change = user_events[3]


const MAGAZINE_NOTIFICATION_eventTypes = [
    'notification_magazine_new_user_invited', // Usuario A invita a Usuario B a colaborar en una revista
    'notification_magazine_acepted', // Usuario B la acepta
    'notification_magazine_rejected', // Usuario B la rechaza
    'notification_magazine_user_has_been_removed', // Te han eliminado de la revista
]
const notification_magazine_new_user_invited = MAGAZINE_NOTIFICATION_eventTypes[0]
const user_acept_the_invitation = MAGAZINE_NOTIFICATION_eventTypes[1]
const user_has_been_removed_fom_magazine = MAGAZINE_NOTIFICATION_eventTypes[3]


// MAKE ACTIONS INACTIVE 
const eventsThatMakeNotificationActionsInactive_GROUP = [
    'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo
    'notification_group_user_rejected_group_invitation',
]

const eventsThatMakeNotificationActionsInactive_MAGAZINE = [
    'notification_magazine_acepted', //usuario acepto unirse
    'notification_magazine_rejected', // Usuario B la rechaza
]


const eventsThatMakeNotificationActionsInactive_USER = [
    'notification_user_friend_request_accepted', // 
    'notification_user_friend_request_rejected', // 
    'notification_user_new_relation_accepted', // Usuario A acepto tu relacion de amistad
    'notifications_user_new_relation_rejected'
]

const notification_user_new_relation_accepted = eventsThatMakeNotificationActionsInactive_USER[2]






enum ownerType {
    user = 'user',
    group = 'group'
}

enum typeOfNotification {
    group_notification = 'group_notification',
    magazine_notification = 'magazine_notification',
    user_notification = 'user_notification'
}





interface memberForDeleteData {
    memberToDelete: string
    magazineAdmin: string
    magazineId: string,
    magazineType: string,
}

interface newMemberData {
    memberToAdd: string,
    magazineAdmin: string,
    magazineId: string,
    magazineType: string
}



export {
    memberForDeleteData,
    newMemberData,
    typeOfNotification,
    ownerType,
    MAGAZINE_NOTIFICATION_eventTypes,
    GROUP_NOTIFICATION_send_group,
    eventsThatMakeNotificationActionsInactive_GROUP,
    eventsThatMakeNotificationActionsInactive_MAGAZINE,
    eventsThatMakeNotificationActionsInactive_USER,
    user_acept_the_invitation,
    user_has_been_removed_fom_magazine,
    user_events,
    notification_user_new_friend_request,
    notification_user_new_relation_change,
    notification_user_friend_request_accepted,
    notification_group_new_user_invited,
    notification_magazine_new_user_invited,
    notification_user_new_relation_accepted
};