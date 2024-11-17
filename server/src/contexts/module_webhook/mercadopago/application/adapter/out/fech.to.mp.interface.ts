export interface FetchToMpInterface {
    getDataFromMp_fetch(url: string): Promise<any>
    changeSubscriptionStatusInMercadopago_fetch(url: string, preapproval_id: string, subscription_action: string): Promise<any>
}