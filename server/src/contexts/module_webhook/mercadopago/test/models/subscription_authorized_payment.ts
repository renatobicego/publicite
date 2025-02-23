import { authorized_payments } from "../../domain/entity_mp/authorized_payments";

export function get_subscription_authorized_payment(
    external_reference: string,
    preapproval_id: string,
    statusOfInvoce: string,
    authorized_payments_id: number,
    transaction_amount: number,
    payment: {
        id: number,
        status: string,
        status_detail: string
    },
): authorized_payments {
    return {
        preapproval_id: preapproval_id,
        id: authorized_payments_id,
        type: "recurring",
        status: statusOfInvoce,
        date_created: "2025-02-14T20:01:49.441-04:00",
        last_modified: "2025-02-14T21:05:40.158-04:00",
        transaction_amount: transaction_amount,
        currency_id: "ARS",
        reason: "Publicite prem",
        external_reference: external_reference,
        retry_attempt: 1,
        next_retry_date: "2025-02-21T19:14:36.000-04:00",
        debit_date: "2025-02-14T20:00:07.000-04:00",
        payment_method_id: "card",
        rejection_code: "null",
        payment: payment,
    };
}


export default get_subscription_authorized_payment