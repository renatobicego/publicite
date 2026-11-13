const contact_seller_new_request = "contact_seller_new_request";;
const post_deleted = 'post.deleted';
const downgrade_plan_contact = 'downgrade_plan_contact';
const downgrade_plan_post = 'downgrade_plan_post';
const downgrade_plan_contact_notification = 'downgrade_plan_contact_notification';
const downgrade_plan_post_notification = 'downgrade_plan_post_notification';
const subscription_event = 'subscription_event';
const set_OpinionRequested_TRUE = 'set_isOpinionRequested_TRUE';
const new_review = 'new_review';
// Grupos: los escucha Mis Producciones para mantener el blog del grupo.
const group_deleted = 'group.deleted';
const group_creator_changed = 'group.creator_changed';
// Mis Producciones: avisos de venta/cobro de tickets. Los escucha Notificaciones.
const production_ticket_notification = 'production.ticket_notification';
// MercadoPago -> planes compartidos (module_friend_plan). El webhook de MP no
// depende de esos módulos: les avisa por evento cuando el pago o el preapproval
// tienen una referencia `gift:` o `friendGroup:`.
const mp_gift_payment = 'mp.gift_payment';
const mp_friend_group_preapproval = 'mp.friend_group_preapproval';
const mp_friend_group_charge_failed = 'mp.friend_group_charge_failed';
const mp_friend_group_charge_recovered = 'mp.friend_group_charge_recovered';
// Avisos de regalos y Hacete Amigo. Los escucha Notificaciones.
const plan_gift_notification = 'plan_gift.notification';
const friend_group_notification = 'friend_group.notification';
// Alta del usuario en Mongo (fin del onboarding): asigna regalos hechos a su email.
const user_created = 'user.created';

export {
    mp_gift_payment,
    mp_friend_group_preapproval,
    mp_friend_group_charge_failed,
    mp_friend_group_charge_recovered,
    plan_gift_notification,
    friend_group_notification,
    user_created,
    group_deleted,
    group_creator_changed,
    production_ticket_notification,
    contact_seller_new_request,
    post_deleted,
    downgrade_plan_contact,
    downgrade_plan_contact_notification,
    downgrade_plan_post,
    downgrade_plan_post_notification,
    subscription_event,
    set_OpinionRequested_TRUE,
    new_review
}
