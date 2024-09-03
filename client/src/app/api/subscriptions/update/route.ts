import MercadoPagoConfig, { PreApproval } from "mercadopago";

export async function PUT(request: Request) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 5000 },
    });

    const paymentSubscription = new PreApproval(client);
    const { formData, subscriptionId } = await request.json();
    paymentSubscription
      .update({
        id: subscriptionId,
        body: {
          ...formData,
          external_reference: formData.payer.email
        },
      })
      .then(console.log)
      .catch(console.log);
    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
