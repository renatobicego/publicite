import { getEndDateISO } from "@/utils/functions/dates";

import MercadoPagoConfig, { PreApproval } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 5000 },
    });
    // const externalID = Math.floor(Math.random() * 9000).toString();
    const paymentSubscription = new PreApproval(client);
    const { formData, subscriptionPlan, userId } = await request.json();
    const result = await paymentSubscription.create({
      body: {
        auto_recurring: subscriptionPlan.auto_recurring,
        back_url: process.env.CLIENT_URL + "/suscribirse/suscripcion-exitosa",
        card_token_id: formData.token,
        payer_email: formData.payer.email,
        preapproval_plan_id: subscriptionPlan.id,
        reason: subscriptionPlan.reason,
        external_reference: userId,
      },
    });
    return NextResponse.json({
      message: "OK",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing payment", errorMessage: error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 5000 },
    });

    const paymentSubscription = new PreApproval(client);
    const { formData, subscription } = await request.json();
    const result = await paymentSubscription.update({
      id: subscription.id,
      body: {
        card_token_id: formData.token,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
