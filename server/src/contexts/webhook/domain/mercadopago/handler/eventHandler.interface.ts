export interface MpHandlerEventsInterface {
	handleEvent_subscription_preapproval(dataID: string): Promise<boolean>
	handleEvent_subscription_authorized_payment(dataID: string): Promise<boolean>
	handleEvent_payment(dataID: string,action: string): Promise<boolean>
}