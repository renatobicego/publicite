import dynamic from "next/dynamic";
import { getSubscriptionPlanById } from "../../services";

const Checkout = dynamic(() => import("./Checkout"), {
  ssr: false,
});
export default async function Page({ params }: { params: { planId: string } }) {
  const subscriptionPlan = await getSubscriptionPlanById(params.planId)
  return <Checkout subscriptionPlan={subscriptionPlan}/>
}
