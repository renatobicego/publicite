export interface Subscription_preapproval {
    id: string;
    payer_id: number;
    payer_email: string;
    back_url: string;
    collector_id: number;
    application_id: number;
    status: string;
    reason: string;
    external_reference: string;
    date_created: string; // ISO date string
    last_modified: string; // ISO date string
    init_point: string;
    preapproval_plan_id: string;
    auto_recurring: {
      frequency: number;
      frequency_type: string;
      transaction_amount: number;
      currency_id: string;
      start_date: string; // ISO date string
      end_date: string; // ISO date string
      billing_day_proportional: boolean;
      has_billing_day: boolean;
      free_trial: null | unknown; // Add specific type if free_trial structure is known
    };
    summarized: {
      quotas: number;
      charged_quantity: number;
      pending_charge_quantity: number;
      charged_amount: number;
      pending_charge_amount: number;
      semaphore: string;
      last_charged_date: string; // ISO date string
      last_charged_amount: number;
    };
    next_payment_date: string;
    payment_method_id: string;
    card_id: string;
    payment_method_id_secondary: null | string;
    first_invoice_offset: null | unknown; // Add specific type if structure is known
    subscription_id: string;
    owner: null | unknown; // Add specific type if structure is known
  }
  