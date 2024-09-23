import dynamic from "next/dynamic";
import Details from "./Details";
import {
  getSubscriptionPlanById,
  getSubscriptionsOfUser,
} from "@/services/subscriptionServices";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Subscription } from "@/types/subscriptions";
import { checkIfUserIsSubscribed } from "@/app/utils/utils";

const Checkout = dynamic(() => import("./Checkout"), {
  ssr: false,
});
export default async function Page({ params }: { params: { planId: string } }) {
  const { userId } = auth();
  const subscriptionsOfUser = await getSubscriptionsOfUser(userId as string);
  if (checkIfUserIsSubscribed(subscriptionsOfUser, params.planId, true)) {
    redirect("/suscripciones");
  }
  const subscriptionPlan = await getSubscriptionPlanById(params.planId);
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
