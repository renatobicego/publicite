import { getSubscriptionById } from "@/services/subscriptionServices";
import dynamic from "next/dynamic";

const Checkout = dynamic(() => import("./Checkout"), {
  ssr: false,
});
export default async function Page({ params }: { params: { id: string } }) {
  const subscription= await getSubscriptionById(params.id)
  return <Checkout subscription={subscription}/>
}
