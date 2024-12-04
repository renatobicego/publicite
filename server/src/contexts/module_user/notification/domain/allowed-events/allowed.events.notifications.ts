const GROUP_NOTIFICATION_send_group = [
    'notification_group_new_user_invited', // Te han invitado a un grupo -> 0
    'notification_group_new_user_added', // Te han agregado a un grupo -> 1
    'notification_group_user_accepted', // Te han aceptado en un grupo -> 2
    'notification_group_user_rejected', // Te han rechazado en un grupo -> 3
    'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo -> 4
    'notification_group_user_request_group_invitation', // Usuario A quiere pertenecer a grupo -> 5
]

// const GROUP_NOTIFICATION_eventTypes_send_only_user = [
//     'notification_group_user_removed_from_group', // Te han eliminado del grupo, -> 6
//     'notification_group_user_new_admin', // Te han convertido en administrador -> 7
//     'notification_group_user_removed_admin', // Te han quitado el rol de administrador -> 8
// ]

const MAGAZINE_NOTIFICATION_eventTypes = [
    'notification_magazine_new_user_invited', // Usuario A invita a Usuario B a colaborar en una revista
    'notification_magazine_acepted', // Usuario B la acepta
    'notification_magazine_rejected', // Usuario B la rechaza
    'notification_magazine_user_has_been_removed', // Te han eliminado de la revista
]

const user_acept_the_invitation = MAGAZINE_NOTIFICATION_eventTypes[1]
const user_has_been_removed_fom_magazine = MAGAZINE_NOTIFICATION_eventTypes[3]


enum ownerType {
    user = 'user',
    group = 'group'
}

enum typeOfNotification {
    group_notification = 'group_notification',
    magazine_notification = 'magazine_notification'
}


const eventsThatMakeNotificationActionsInactive_GROUP = [
    'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo
    'notification_group_new_user_added', // Te han agregado a un grupo
    'notification_group_user_rejected_group_invitation',
]

const eventsThatMakeNotificationActionsInactive_MAGAZINE = [
    'notification_magazine_acepted', //usuario acepto unirse
    'notification_magazine_rejected', // Usuario B la rechaza
]



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
    //GROUP_NOTIFICATION_eventTypes_send_only_user,
    eventsThatMakeNotificationActionsInactive_GROUP,
    eventsThatMakeNotificationActionsInactive_MAGAZINE,
    user_acept_the_invitation,
    user_has_been_removed_fom_magazine
};