import React from "react";
import { getSubscriptionsPlans } from "./services";
import { Button, Link } from "@nextui-org/react";

const SubscriptionsPlans = async () => {
  const { results} = await getSubscriptionsPlans();
  return <div>
    <h1>Subscriptions Plans</h1>
    <ul>
      {results.map((plan: any) => (
        <div key={plan.id}>
        <li >
          {plan.reason}
        </li>
        <Button as={Link} href={`/subscripcion/checkout/${plan.id}`}>
          Pagar Plan
        </Button>
        </div>
      ))}
    </ul>
  </div>;
};

export default SubscriptionsPlans;
