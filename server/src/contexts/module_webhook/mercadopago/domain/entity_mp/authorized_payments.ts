interface Payment {
    id: any;
    status: string;
    status_detail: string;
}


export interface authorized_payments {
    preapproval_id: string;
    id: any;
    type: string;
    status: string;
    date_created: string;
    last_modified: string;
    transaction_amount: any;
    currency_id: string;
    reason: string;
    external_reference: string;
    payment: Payment;
    retry_attempt: any;
    next_retry_date: string;
    debit_date: string;
    payment_method_id: string;
}




