import { SubscriptionPlan } from "@/types/subscriptions";

const PlanDetails = ({
  subscriptionPlan,
}: {
  subscriptionPlan: SubscriptionPlan;
}) => (
  <div className="flex flex-col flex-grow gap-1">
    <h3>{subscriptionPlan.reason}</h3>
    {subscriptionPlan.isFree ? (
      <p className="text-sm">{subscriptionPlan.description}</p>
    ) : (
      <>
        <h6 className="text-lg xl:text-xl">
          ${subscriptionPlan.price}{" "}
          <span className="font-medium">por mes*</span>
        </h6>
        <p className="text-xs">
          *Cancela o pausa cuando quiera. Precio referenciado en el valor del
          dólar
        </p>
      </>
    )}
  </div>
);

export default PlanDetails;
