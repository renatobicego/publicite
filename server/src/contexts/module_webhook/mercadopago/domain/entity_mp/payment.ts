interface Identification {
    number: string | null;
    type: string | null;
}

interface Cardholder {
    identification: Identification;
    name: string | null;
}

interface Card {
    bin: string | null;
    cardholder: Cardholder;
    country: string | null;
    date_created: string | null;
    date_last_updated: string | null;
    expiration_month: string | null;
    expiration_year: string | null;
    first_six_digits: string | null;
    id: string;
    last_four_digits: string;
    tags: string[];
}

interface Amounts {
    original: number;
    refunded: number;
}

interface Accounts {
    from: string;
    to: string;
}

interface Metadata {
    source: string;
}

interface RefundCharge {
    // Define la estructura de los cargos de reembolso si es necesario
}

interface ChargeDetails {
    accounts: Accounts;
    amounts: Amounts;
    client_id: number;
    date_created: string;
    id: string;
    last_updated: string;
    metadata: Metadata;
    name: string;
    refund_charges: RefundCharge[];
    reserve_id: string | null;
    type: string;
}

interface InternalExecution {
    date: string;
    execution_id: string;
}

interface ChargesExecutionInfo {
    internal_execution: InternalExecution;
}

interface Phone {
    number: string | null;
    extension: string | null;
    area_code: string | null;
}

interface Payer {
    email: string | null;
    entity_type: string | null;
    first_name: string | null;
    id: string;
    identification: Identification;
    last_name: string | null;
    operator_id: string | null;
    phone: Phone;
    type: string | null;
}

interface RoutingData {
    merchant_account_id: string;
}

interface PaymentMethodData {
    retried_by: string;
    routing_data: RoutingData;
}

interface PaymentMethod {
    data: PaymentMethodData;
    id: string;
    issuer_id: string;
    type: string;
}

interface ApplicationData {
    name: string;
    version: string;
}

interface BusinessInfo {
    branch: string;
    sub_unit: string;
    unit: string;
}

interface Location {
    source: string;
    state_id: string;
}

interface InvoicePeriod {
    period: number;
    type: string;
}

interface SubscriptionSequence {
    number: number;
    total: number | null;
}

interface TransactionData {
    billing_date: string;
    first_time_use: boolean;
    invoice_id: string;
    invoice_period: InvoicePeriod;
    payment_reference: string | null;
    plan_id: string;
    processor: string | null;
    subscription_id: string;
    subscription_sequence: SubscriptionSequence;
    ticket_id: string;
    user_present: boolean | null;
}

interface PointOfInteraction {
    application_data: ApplicationData;
    business_info: BusinessInfo;
    location: Location;
    transaction_data: TransactionData;
    type: string;
}

interface TransactionDetails {
    acquirer_reference: string | null;
    external_resource_url: string | null;
    financial_institution: string | null;
    installment_amount: number;
    net_received_amount: number;
    overpaid_amount: number;
    payable_deferral_period: string | null;
    payment_method_reference_id: string | null;
    total_paid_amount: number;
}

export interface Payment {
    accounts_info: null;
    acquirer_reconciliation: any[]; // Define la estructura si es necesario
    additional_info: {
        tracking_id: string;
    };
    authorization_code: string;
    binary_mode: boolean;
    brand_id: string | null;
    build_version: string;
    call_for_authorize_id: string | null;
    captured: boolean;
    card: Card;
    charges_details: ChargeDetails[];
    charges_execution_info: ChargesExecutionInfo;
    collector_id: number;
    corporation_id: string | null;
    counter_currency: string | null;
    coupon_amount: number;
    currency_id: string;
    date_approved: string | null;
    date_created: string;
    date_last_updated: string;
    date_of_expiration: string | null;
    deduction_schema: string | null;
    description: string;
    differential_pricing_id: string | null;
    external_reference: string;
    fee_details: any[]; // Define la estructura si es necesario
    financing_group: string | null;
    id: number;
    installments: number;
    integrator_id: string | null;
    issuer_id: string;
    live_mode: boolean;
    marketplace_owner: string | null;
    merchant_account_id: string | null;
    merchant_number: string | null;
    metadata: {
        preapproval_id: string;
    };
    money_release_date: string | null;
    money_release_schema: string | null;
    money_release_status: string;
    notification_url: string | null;
    operation_type: string;
    order: Record<string, unknown>; // Define la estructura si es necesario
    payer: Payer;
    payment_method: PaymentMethod;
    payment_method_id: string;
    payment_type_id: string;
    platform_id: string | null;
    point_of_interaction: PointOfInteraction;
    pos_id: string | null;
    processing_mode: string;
    refunds: any[]; // Define la estructura si es necesario
    release_info: string | null;
    shipping_amount: number;
    sponsor_id: string | null;
    statement_descriptor: string;
    status: string;
    status_detail: string;
    store_id: string | null;
    tags: string | null;
    taxes_amount: number;
    transaction_amount: number;
    transaction_amount_refunded: number;
    transaction_details: TransactionDetails;
}

