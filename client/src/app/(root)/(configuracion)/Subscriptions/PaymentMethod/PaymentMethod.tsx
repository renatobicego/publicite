import { useEffect, useMemo, useState } from "react";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import PaymentMethodForm from "./PaymentMethodForm";
import { getPaymentMethod } from "@/services/subscriptionServices";
import { toastifyError } from "@/utils/functions/toastify";
import { Spinner } from "@nextui-org/react";
import { getPaymentIcon } from "@/utils/functions/payments";
import { useActiveSubscriptions } from "@/app/(root)/providers/userDataProvider";

const PaymentMethod = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { accountType } = useActiveSubscriptions();
  const [paymentMethod, setPaymentMethod] = useState<{
    lastDigits: string;
    cardId: string;
    payment_type_id: "credit_card" | "debit_card";
  }>();
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      if (accountType?.subscriptionPlan.isFree) {
        setIsLoading(false);
        return;
      }
      const res = await getPaymentMethod();
      setIsLoading(false);
      if (!res) {
        return;
      }
      if ("error" in res) {
        setIsError(true);
        toastifyError(res.error as string);
        return;
      }
      setPaymentMethod(res);
    };
    if (accountType?.subscriptionPlan.isFree) {
      setIsLoading(false);
      return;
    }
    if (accountType) {
      fetchPaymentMethod();
    }
  }, [accountType]);

  const paymentIcon = useMemo(() => {
    if (isError || isLoading || !paymentMethod?.cardId) return;
    return getPaymentIcon(paymentMethod.cardId as string);
  }, [isError, isLoading, paymentMethod?.cardId]);
  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="payment-method"
    >
      {isFormVisible && paymentMethod ? (
        <PaymentMethodForm
          key={"formPaymentMethodForm"}
          setIsFormVisible={setIsFormVisible}
          paymentMethod={paymentMethod}
          paymentIcon={paymentIcon}
        />
      ) : (
        <DataBox
          key={"dataPaymentMethod"}
          className=" max-md:my-2.5"
          labelText="Método de Pago"
          labelClassname="md:w-1/4 md:my-2.5"
        >
          <DataItem Icon={paymentIcon} asDiv>
            {paymentMethod?.lastDigits ? (
              `****${paymentMethod?.lastDigits}`
            ) : isError ? (
              "Error"
            ) : isLoading ? (
              <Spinner color="warning" />
            ) : (
              "Sin método de pago"
            )}
          </DataItem>

          {paymentMethod && (
            <EditButton text="Cambiar" onPress={() => setIsFormVisible(true)} />
          )}
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default PaymentMethod;
