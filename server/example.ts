const transactionData = {
    accounts_info: null,
    acquirer_reconciliation: [],
    additional_info: {
        tracking_id: "platform:v1-whitelabel,so:ALL,type:N/A,security:none"
    },
    authorization_code: "290674",
    binary_mode: true,
    brand_id: null,
    build_version: "3.94.0-rc-36",
    call_for_authorize_id: null,
    captured: true,
    card: {
        bin: "45175100",
        cardholder: {
            identification: {
                number: "38798407",
                type: "DNI"
            },
            name: "Maximiliano Cvetic"
        },
        country: "ARG",
        date_created: "2025-03-01T12:54:42.000-04:00",
        date_last_updated: "2025-03-01T12:54:42.000-04:00",
        expiration_month: 11,
        expiration_year: 2029,
        first_six_digits: "451751",
        id: null,
        last_four_digits: "8580",
        tags: [
            "invalid_card_art",
            "debit"
        ]
    },
    charges_details: [],
    collector_id: 281287230,
    corporation_id: null,
    counter_currency: null,
    coupon_amount: 0,
    currency_id: "ARS",
    date_approved: "2025-03-01T12:54:43.000-04:00",
    date_created: "2025-03-01T12:54:42.000-04:00",
    date_last_updated: "2025-03-01T12:54:42.000-04:00",
    date_of_expiration: null,
    deduction_schema: null,
    description: "Recurring payment validation",
    differential_pricing_id: null,
    external_reference: null,
    fee_details: [],
    financing_group: null,
    id: 103434098549,
    installments: 1,
    integrator_id: null,
    issuer_id: "1",
    live_mode: true,
    marketplace_owner: null,
    merchant_account_id: null,
    merchant_number: null,
    metadata: {},
    money_release_date: null,
    money_release_schema: null,
    money_release_status: null,
    notification_url: null,
    operation_type: "card_validation",
    order: {},
    payer: {
        email: "cveticmaxi97@gmail.com",
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
        id: "debvisa",
        issuer_id: "1",
        type: "debit_card"
    },
    payment_method_id: "debvisa",
    payment_type_id: "debit_card",
    platform_id: null,
    point_of_interaction: {
        business_info: {
            branch: "Merchant Services",
            sub_unit: "recurring",
            unit: "online_payments"
        },
        transaction_data: {},
        type: "UNSPECIFIED"
    },
    pos_id: null,
    processing_mode: "aggregator",
    refunds: [],
    release_info: null,
    shipping_amount: 0,
    sponsor_id: null,
    statement_descriptor: "MERPAGO*MERCADOPAGO",
    status: "approved",
    status_detail: "accredited",
    store_id: null,
    tags: null,
    taxes_amount: 0,
    transaction_amount: 0,
    transaction_amount_refunded: 0,
    transaction_details: {
        acquirer_reference: null,
        external_resource_url: null,
        financial_institution: null,
        installment_amount: 0,
        net_received_amount: 0,
        overpaid_amount: 0,
        payable_deferral_period: null,
        payment_method_reference_id: null,
        total_paid_amount: 0
    }
};

const preapprovalData = {
    id: "1dca12e96d9f4a60aafb26f9758ca144",
    payer_id: 1645863715,
    payer_email: "",
    back_url: "https://soonpublicite.vercel.app/suscribirse/subscripcion-exitosa",
    collector_id: 281287230,
    application_id: 4555181215793877,
    status: "authorized",
    reason: "Publicite - free trial ",
    external_reference: "67420686b02bdd1f9f0ef446",
    date_created: "2025-03-01T12:54:43.931-04:00",
    last_modified: "2025-03-01T12:54:44.214-04:00",
    init_point: "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=1dca12e96d9f4a60aafb26f9758ca144",
    preapproval_plan_id: "2c938084950cbacf01953f0ec877180e",
    auto_recurring: {
        frequency: 7,
        frequency_type: "days",
        transaction_amount: 100.00,
        currency_id: "ARS",
        start_date: "2025-03-02T12:54:43.948-04:00",
        billing_day_proportional: false,
        has_billing_day: false,
        free_trial: {
            frequency: 1,
            first_invoice_offset: 1,
            frequency_type: "days"
        }
    },
    summarized: {
        quotas: null,
        charged_quantity: null,
        pending_charge_quantity: null,
        charged_amount: null,
        pending_charge_amount: null,
        semaphore: null,
        last_charged_date: null,
        last_charged_amount: null
    },
    next_payment_date: "2025-03-02T12:54:44.000-04:00",
    payment_method_id: "debvisa",
    card_id: "9562865425",
    payment_method_id_secondary: null,
    first_invoice_offset: 1,
    subscription_id: "1dca12e96d9f4a60aafb26f9758ca144",
    owner: null
};