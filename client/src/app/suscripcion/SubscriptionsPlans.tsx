import React from "react";
import { Button, Link } from "@nextui-org/react";
import { getSubscriptionsPlans } from "../services/subscriptionServices";

const SubscriptionsPlans = async () => {
  const { results } = await getSubscriptionsPlans();
  return <div>
    <h1>Subscriptions Plans</h1>
    <ul>
      {results.map((plan: any) => (
        <div key={plan.id}>
        <li >
          {plan.reason}
        </li>
        <Button as={Link} href={`/suscribirse/${plan.id}`}>
          Pagar Plan
        </Button>
        </div>
      ))}
    </ul>
  </div>;
};

export default SubscriptionsPlans;
