export enum payment_notification_events_enum {
    payment_approved = 'payment_approved',
    payment_pending = 'payment_pending',
    payment_rejected = 'payment_rejected'
}

export interface PaymentDataFromMeli {
    event: payment_notification_events_enum,
    subscriptionPlanId: any,
    reason: string,
    status: string,
    retryAttemp: string,
    userId: string


}