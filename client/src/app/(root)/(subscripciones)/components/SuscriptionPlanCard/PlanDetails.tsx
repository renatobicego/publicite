import { SubscriptionPlan } from "@/types/subscriptions";
import { HiCircleStack, HiSparkles } from "react-icons/hi2";
import { formatBytes } from "@/utils/functions/formatBytes";

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
  const aiTokens = subscriptionPlan.aiTokensPerMonth ?? 0;
  const storageBytes = subscriptionPlan.storageBytesLimit ?? 0;
  const storageDetail = storageBytes > 0 && (
    <p className="text-sm font-semibold flex items-center gap-1">
      <HiCircleStack className="shrink-0" />
      {formatBytes(storageBytes)} de almacenamiento en Mis Producciones
    </p>
  );
  return (
    <div className="flex flex-col flex-grow gap-1">
      <h3>{subscriptionPlan.reason}</h3>
      {subscriptionPlan.isFree ? (
        <>
          <p className="text-sm">{subscriptionPlan.description}</p>
          {storageDetail}
        </>
      ) : (
        <>
          <h6 className="text-lg xl:text-xl">
            ${subscriptionPlan.price}{" "}
            <span className="font-medium">{frequencyLabel}*</span>
          </h6>
          <p className="text-sm">{subscriptionPlan.description}</p>
          {aiTokens > 0 && (
            <p className="text-sm font-semibold flex items-center gap-1">
              <HiSparkles className="shrink-0" />
              {aiTokens.toLocaleString("es-AR")} tokens Publicité de IA por mes
            </p>
          )}
          {storageDetail}
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
