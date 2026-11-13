import { useState } from "react";
import AccountTypeForm from "./AccountTypeForm";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { CardDataItem, EditButton } from "../../DataBox";
import { useActiveSubscriptions } from "@/app/(root)/providers/userDataProvider";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import { frequencyLabelFromDays } from "@/utils/functions/billingFrequency";
import { formatPaymentDate } from "@/utils/functions/packs";

const AccountType = () => {
  const { accountType: subscription, carryovers } = useActiveSubscriptions();

  const [isFormVisible, setIsFormVisible] = useState(false);
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
          {subscription && !subscription.subscriptionPlan.isFree ? (
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
          <EditButton
            text={
              <>
                Actualizar
                <span className="hidden min-[900px]:inline"> - Cancelar</span>
              </>
            }
            onPress={() => setIsFormVisible(true)}
          />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default AccountType;
