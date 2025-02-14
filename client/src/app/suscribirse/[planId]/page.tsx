import dynamic from "next/dynamic";
import Details from "./Details";
import {
  getSubscriptionPlanById,
  getSubscriptionsOfUser,
} from "@/services/subscriptionServices";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIfUserIsSubscribed } from "@/utils/functions/utils";
import ErrorCard from "@/components/ErrorCard";

const Checkout = dynamic(() => import("./Checkout"), {
  ssr: false,
});
export default async function CheckoutPage(props: {
  params: Promise<{ planId: string }>;
}) {
  const params = await props.params;
  const { sessionClaims } = auth();
  const subscriptionsOfUser = await getSubscriptionsOfUser(
    sessionClaims?.metadata.mongoId as string
  );
  if ("error" in subscriptionsOfUser)
    return <ErrorCard message={subscriptionsOfUser.error} />;
  if (checkIfUserIsSubscribed(subscriptionsOfUser, params.planId, true)) {
    redirect("/suscripciones");
  }

  const isUserSubscribedToPayedPlan = subscriptionsOfUser.some(
    (subscription) =>
      !subscription.subscriptionPlan.isFree &&
      subscription.status === "active" &&
      !subscription.subscriptionPlan.isPack
  );

  // TODO if the user is subscribed to payed plan and the id of the params.id is the not the same as the payed plan, redirect to /cambiar-plan

  const subscriptionPlan = await getSubscriptionPlanById(params.planId);
  if (subscriptionPlan.error)
    return <ErrorCard message={subscriptionPlan.error} />;

  return (
    <main className="w-screen min-h-screen flex-col lg:flex-row flex gap-8 lg:gap-4">
      <Details subscriptionPlan={subscriptionPlan} />
      <div
        className="flex items-start bg-white lg:shadow-xl rounded-t-[40px] 
      lg:rounded-l-[40px] flex-1 px-4 md:px-8 pt-8 lg:pt-20 2xl:pt-32
      max-lg:shadow-large 
      "
      >
        <Checkout subscriptionPlan={subscriptionPlan} />
      </div>
    </main>
  );
}
