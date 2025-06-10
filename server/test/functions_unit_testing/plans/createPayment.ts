import { Types } from "mongoose";

async function createPayment(
    paymentModel: any,
    paymentId: Types.ObjectId,
    mpPreapprovalId: string,
    external_reference: string,
    status: string,
    mpPaymentId: string
) {
    await paymentModel.create({
        _id: paymentId,
        mpPaymentId: mpPaymentId,
        descriptionOfPayment: "Publicite premium",
        mpPreapprovalId: mpPreapprovalId,
        payerId: "1645863715",
        payerEmail: " ",
        paymentTypeId: "debit_card",
        paymentMethodId: "debvisa",
        transactionAmount: 100,
        dateApproved: " ",
        external_reference: external_reference,
        status_detail: "cc_rejected_insufficient_amount",
        timeOfUpdate: "2025-01-13T16:04:18.379+00:00[UTC]",
        status: status,

    });


}

export default createPayment