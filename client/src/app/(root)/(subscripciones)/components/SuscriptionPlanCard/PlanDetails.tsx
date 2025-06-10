import { SubscriptionPlan } from "@/types/subscriptions";

const PlanDetails = ({
  subscriptionPlan,
}: {
  subscriptionPlan: SubscriptionPlan;
}) => {
  const frequencyLabel =
    subscriptionPlan.intervalTime === 30
      ? "por mes"
      : subscriptionPlan.intervalTime === 90
      ? "por trimestre"
      : subscriptionPlan.intervalTime === 365
      ? "por año"
      : "por semana";
  return (
    <div className="flex flex-col flex-grow gap-1">
      <h3>{subscriptionPlan.reason}</h3>
      {subscriptionPlan.isFree ? (
        <p className="text-sm">{subscriptionPlan.description}</p>
      ) : (
        <>
          <h6 className="text-lg xl:text-xl">
            ${subscriptionPlan.price}{" "}
            <span className="font-medium">{frequencyLabel}*</span>
          </h6>
          <p className="text-sm">{subscriptionPlan.description}</p>
          <p className="text-xs">
            *Cancela o pausa cuando quiera. Precio referenciado en el valor del
            dólar
          </p>
        </>
      )}
    </div>
  );
};

export default PlanDetails;
