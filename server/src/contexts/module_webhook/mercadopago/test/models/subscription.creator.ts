import { random } from "lodash";
import { Subscription_preapproval } from "../../domain/entity_mp/subscription_preapproval";

export function get_subscription_preapproval(external_reference: string, subcriptionPlanMeli_id: string, free_trial: boolean): Subscription_preapproval {
    return {
        id: "sub_12345" + random(10000, 99999),
        payer_id: 123456789,
        payer_email: "payer@example.com",
        back_url: "https://example.com/back",
        collector_id: 987654321,
        application_id: 11223344,
        status: "active",
        reason: "Monthly subscription",
        external_reference: external_reference,
        date_created: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        init_point: "https://mercadopago.com/init",
        preapproval_plan_id: subcriptionPlanMeli_id,
        auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 9.99,
            currency_id: "USD",
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            billing_day_proportional: false,
            has_billing_day: true,
            free_trial: free_trial ? {
                frequency: 1,
                first_invoice_offset: 1,
                frequency_type: "days",
            } : null
        },
        summarized: {
            quotas: 12,
            charged_quantity: 3,
            pending_charge_quantity: 9,
            charged_amount: 29.97,
            pending_charge_amount: 89.91,
            semaphore: "open",
            last_charged_date: new Date().toISOString(),
            last_charged_amount: 9.99
        },
        next_payment_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        payment_method_id: "visa",
        card_id: "card_987654",
        payment_method_id_secondary: null,
        first_invoice_offset: null,
        subscription_id: "sub_54321",
        owner: null
    };
}

