import { getEndDateISO } from "@/utils/functions/dates";

import MercadoPagoConfig, { PreApproval } from "mercadopago";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 5000 },
    });
    // const externalID = Math.floor(Math.random() * 9000).toString();
    const paymentSubscription = new PreApproval(client);
    const { formData, subscriptionPlan, userId } = await request.json();
    paymentSubscription
      .create({
        body: {
          // auto_recurring: {
          //   ...subscriptionPlan.auto_recurring,
          //   end_date: getEndDateISO(subscriptionPlan.auto_recurring.frequency, "days"),
          // },
          auto_recurring: subscriptionPlan.auto_recurring,
          back_url: process.env.CLIENT_URL + "/suscribirse/suscripcion-exitosa",
          card_token_id: formData.token,
          payer_email: formData.payer.email,
          // payer_email: "test_user_1345316664@testuser.com",
          preapproval_plan_id: subscriptionPlan.id,
          reason: subscriptionPlan.reason,
          external_reference: userId,
        },
      })
      .then((data) => {
        return new Response(JSON.stringify(data), { status: 200 });
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    console.log(error);
    return new Response("Error", { status: 500, statusText: error as string });
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
    paymentSubscription
      .update({
        id: subscription.id,
        body: {
          card_token_id: formData.token,
        },
      })
      .then(console.log)
      .catch(console.log);
    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
