import { getLocalTimeZone, today } from "@internationalized/date";
import MercadoPagoConfig, { PreApproval } from "mercadopago";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 5000 },
    });

    const paymentSubscription = new PreApproval(client);
    const {formData, subscriptionPlan} = await request.json();
    paymentSubscription
      .create({
        body: {
            auto_recurring: {...subscriptionPlan.auto_recurring, 
                end_date: today(getLocalTimeZone()).add({months: 1}).toDate(getLocalTimeZone()).toISOString(),
            },
            back_url: "http://localhost:3000/",
            card_token_id: formData.token,
            // payer_email: formData.payer.email,
            payer_email: "test_user_1835982832@testuser.com",
            preapproval_plan_id: subscriptionPlan.id,
            reason: subscriptionPlan.reason,
        },
      })
      .then(console.log)
      .catch(console.log);
    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
