import UserSubscriptionCard from "./UserSubscriptionCard";
import { getSubscriptionByEmail } from "@/services/subscriptionServices";

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
