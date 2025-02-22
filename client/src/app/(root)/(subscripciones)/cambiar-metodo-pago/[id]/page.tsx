import { auth } from "@clerk/nextjs/server";
import Details from "./Details";
import { getSubscriptionsOfUser } from "@/services/subscriptionServices";
import ErrorCard from "@/components/ErrorCard";
import ChangePaymentMethodCheckout from "./ChangePaymentMethodCheckout";

export default async function ChangePaymentMethod({
  params,
}: {
  params: { id: string };
}) {
  const { sessionClaims } = auth();
  const subscriptionsOfUser = await getSubscriptionsOfUser(
    sessionClaims?.metadata.mongoId as string
  );

  if ("error" in subscriptionsOfUser)
    return (
      <ErrorCard
        message={
          "Error al traer los datos de la suscripción actual. Por favor, intente de nuevo."
        }
      />
    );

  const subscriptionPlan = subscriptionsOfUser.find(
    (subscription) => subscription.mpPreapprovalId === params.id
  );
  return (
    <main className="w-screen min-h-screen flex-col lg:flex-row flex gap-8 lg:gap-4">
      <Details subscriptionPlan={subscriptionPlan} />
      <div
        className="flex items-start bg-white lg:shadow-xl rounded-t-[40px] 
      lg:rounded-l-[40px] flex-1 px-4 md:px-8 pt-8 lg:pt-20 2xl:pt-32
      max-lg:shadow-large 
      "
      >
        <ChangePaymentMethodCheckout subscriptionId={params.id} />
      </div>
    </main>
  );
}
