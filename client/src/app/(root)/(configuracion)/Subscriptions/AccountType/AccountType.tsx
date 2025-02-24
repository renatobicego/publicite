import { useState } from "react";
import AccountTypeForm from "./AccountTypeForm";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { CardDataItem, EditButton } from "../../DataBox";
import { Subscription } from "@/types/subscriptions";

const AccountType = ({ subscription }: { subscription?: Subscription }) => {
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
          {subscription ? (
            <CardDataItem
              title={subscription.subscriptionPlan.reason}
              subtitle={`Próximo pago: ${subscription.endDate}`}
              boldLabel={`$${subscription.subscriptionPlan.price} por mes`}
            />
          ) : (
            <CardDataItem
              title="Gratuita"
              subtitle="Tu plan actual es el plan gratuito"
            />
          )}
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
