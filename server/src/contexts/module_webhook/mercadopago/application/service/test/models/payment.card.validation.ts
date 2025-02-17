
function generate_payment_card_validation(operation_type: string, amount: number) {
    const payment_card_validation_amount = {

        accounts_info: null,
        acquirer_reconciliation: [],
        additional_info: {
            tracking_id: "platform:v1-blacklabel,so:ALL,type:N/A,security:none"
        },
        authorization_code: "",
        binary_mode: false,
        brand_id: null,
        build_version: "3.86.0-rc-5",
        call_for_authorize_id: null,
        captured: true,
        card: {
            bin: null,
            cardholder: {
                identification: {
                    number: null,
                    type: null
                },
                name: null
            },
            country: null,
            date_created: null,
            date_last_updated: null,
            expiration_month: null,
            expiration_year: null,
            first_six_digits: null,
            id: "9542114951",
            last_four_digits: "3559",
            tags: []
        },
        charges_details: [
            {
                accounts: {
                    from: "collector",
                    to: "mp"
                },
                amounts: {
                    original: 4.1,
                    refunded: 0
                },
                client_id: 0,
                date_created: "2025-01-13T12:04:11.000-04:00",
                id: "99202083580-001",
                last_updated: "2025-01-13T12:04:11.000-04:00",
                metadata: {
                    source: "rule-engine"
                },
                name: "mercadopago_fee",
                refund_charges: [],
                reserve_id: null,
                type: "fee"
            }
        ],
        charges_execution_info: {
            internal_execution: {
                date: "2025-01-13T12:04:11.728-04:00",
                execution_id: "01JHG6H2R983KMDRNQHTHM94TH"
            }
        },
        collector_id: 281287230,
        corporation_id: null,
        counter_currency: null,
        coupon_amount: 0,
        currency_id: "ARS",
        date_approved: null,
        date_created: "2025-01-13T12:04:11.000-04:00",
        date_last_updated: "2025-01-13T12:04:20.000-04:00",
        date_of_expiration: null,
        deduction_schema: null,
        description: "Publicite premium",
        differential_pricing_id: null,
        external_reference: "user_2pG6slSee3PCecIF46Rnr6fwfHM",
        fee_details: [],
        financing_group: null,
        id: 99202083580,
        installments: 1,
        integrator_id: null,
        issuer_id: "1",
        live_mode: true,
        marketplace_owner: null,
        merchant_account_id: null,
        merchant_number: null,
        metadata: {
            preapproval_id: "8f03d95edd694438afe49d778339a832"
        },
        money_release_date: null,
        money_release_schema: null,
        money_release_status: "pending",
        notification_url: null,
        operation_type: operation_type,
        order: {},
        payer: {
            email: null,
            entity_type: null,
            first_name: null,
            id: "1645863715",
            identification: {
                number: null,
                type: null
            },
            last_name: null,
            operator_id: null,
            phone: {
                number: null,
                extension: null,
                area_code: null
            },
            type: null
        },
        payment_method: {
            data: {
                retried_by: "",
                routing_data: {
                    merchant_account_id: "5925204885444"
                }
            },
            id: "debvisa",
            issuer_id: "1",
            type: "debit_card"
        },
        payment_method_id: "debvisa",
        payment_type_id: "debit_card",
        platform_id: null,
        point_of_interaction: {
            application_data: {
                name: "recurring",
                version: "3.31.0-rc-1"
            },
            business_info: {
                branch: "Merchant Services",
                sub_unit: "recurring",
                unit: "online_payments"
            },
            location: {
                source: "collector",
                state_id: "AR-C"
            },
            transaction_data: {
                billing_date: "2025-01-13",
                first_time_use: true,
                invoice_id: "cfbd065a912144f9b9c51a38bdce7e89",
                invoice_period: {
                    period: 7,
                    type: "daily"
                },
                payment_reference: null,
                plan_id: "27d9e999ba284285a0de1da18717351c",
                processor: null,
                subscription_id: "8f03d95edd694438afe49d778339a832",
                subscription_sequence: {
                    number: 1,
                    total: null
                },
                ticket_id: "7518",
                user_present: null
            },
            type: "SUBSCRIPTIONS"
        },
        pos_id: null,
        processing_mode: "aggregator",
        refunds: [],
        release_info: null,
        shipping_amount: 0,
        sponsor_id: null,
        statement_descriptor: "MERPAGO*MAX",
        status: "rejected",
        status_detail: "cc_rejected_insufficient_amount",
        store_id: null,
        tags: null,
        taxes_amount: 0,
        transaction_amount: amount,
        transaction_amount_refunded: 0,
        transaction_details: {
            acquirer_reference: null,
            external_resource_url: null,
            financial_institution: null,
            installment_amount: 20,
            net_received_amount: 0,
            overpaid_amount: 0,
            payable_deferral_period: null,
            payment_method_reference_id: null,
            total_paid_amount: 20
        }
    };

    return payment_card_validation_amount;
}






export default generate_payment_card_validation