import { useState } from "react";
import AccountTypeForm from "./AccountTypeForm";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { CardDataItem, EditButton } from "../../DataBox";
import { useActiveSubscriptions } from "@/app/(root)/providers/userDataProvider";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import { frequencyLabelFromDays } from "@/utils/functions/billingFrequency";
import { formatPaymentDate } from "@/utils/functions/packs";
import { Link } from "@nextui-org/react";
import { FRIEND_PLAN, MY_PLAN_GIFTS } from "@/utils/data/urls";

const AccountType = () => {
  const { accountType: subscription, carryovers } = useActiveSubscriptions();

  const [isFormVisible, setIsFormVisible] = useState(false);
  // El plan de Hacete Amigo se maneja desde el grupo y el regalo vence solo:
  // ninguno se cancela ni se cambia desde acá.
  const isShared = subscription?.kind === "friendGroup";
  const isGift = subscription?.kind === "gift";
  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="account-type"
    >
      {isFormVisible ? (
        <AccountTypeForm
          key={"formAccountType"}
          subscription={subscription}
          setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <DataBox
          key={"dataAccountType"}
          className=" max-md:my-2.5 !items-start"
          labelText="Tipo de Cuenta"
          labelClassname="md:w-1/4 md:mt-2.5"
        >
          {subscription && isShared ? (
            <CardDataItem
              title={`${subscription.subscriptionPlan.reason} (Hacete Amigo)`}
              subtitle="Plan compartido con tu grupo"
            />
          ) : subscription && isGift ? (
            <CardDataItem
              title={`${subscription.subscriptionPlan.reason} (regalo)`}
              subtitle={
                formatPaymentDate(subscription.expiresAt)
                  ? `Vence el ${formatPaymentDate(subscription.expiresAt)}`
                  : "Plan regalado"
              }
            />
          ) : subscription && !subscription.subscriptionPlan.isFree ? (
            <CardDataItem
              title={subscription.subscriptionPlan.reason}
              subtitle={`Próximo pago: ${showDate(
                parseIsoDate(subscription.nextPaymentDate)
              )}`}
              boldLabel={`$${subscription.subscriptionPlan.price} ${frequencyLabelFromDays(
                subscription.subscriptionPlan.intervalTime
              )}`.trim()}
            />
          ) : (
            <CardDataItem
              title="Gratuita"
              subtitle="Tu plan actual es el plan gratuito"
            />
          )}
          {/* Extra temporal de un cambio de plan: no se cancela ni se cambia desde acá. */}
          {carryovers?.map((carryover) => {
            const until = formatPaymentDate(carryover.expiresAt);
            return (
              <CardDataItem
                key={carryover.mpPreapprovalId}
                title={`Límites de tu plan anterior (${carryover.subscriptionPlan.reason})`}
                subtitle="Por el tiempo que ya pagaste antes de cambiar de plan"
                boldLabel={until ? `Hasta el ${until}` : undefined}
              />
            );
          })}
          {isShared || isGift ? (
            <Link href={isShared ? FRIEND_PLAN : MY_PLAN_GIFTS} size="sm" className="md:mt-2.5">
              {isShared ? "Ver mi grupo" : "Mis regalos"}
            </Link>
          ) : (
          <EditButton
            text={
              <>
                Actualizar
                <span className="hidden min-[900px]:inline"> - Cancelar</span>
              </>
            }
            onPress={() => setIsFormVisible(true)}
          />
          )}
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default AccountType;
