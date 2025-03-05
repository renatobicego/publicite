import { currentUser } from "@clerk/nextjs/server";
import MercadoPagoConfig, { PreApproval } from "mercadopago";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 5000 },
    });

    const paymentSubscription = new PreApproval(client);
    const { formData, subscriptionId } = await request.json();
    const user = await currentUser();
    await paymentSubscription.update({
      id: subscriptionId,
      body: {
        ...formData,
        external_reference: user?.emailAddresses[0].emailAddress,
        back_url:
          process.env.CLIENT_URL + "/suscribirse/suscripcion-actualizada",
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
