import { Button } from "@nextui-org/react";
import { editSubscription, getSubscriptionByEmail } from "../services";
import UserSubscriptionCard from "./UserSubscriptionCard";

export default async function Page() {
  const subscriptions = await getSubscriptionByEmail(
    "test_user_1835982832@testuser.com"
  );
  return (
    <div>
      {subscriptions.results.map((subscription: any) => (
        <UserSubscriptionCard
          key={subscription.id}
          subscription={subscription}
        />
      ))}
    </div>
  );
}
