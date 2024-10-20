import { useEffect, useState } from "react";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import PaymentMethodForm from "./PaymentMethodForm";
import { FaCcVisa } from "react-icons/fa6";
import { getPaymentMethod } from "@/services/subscriptionServices";

const PaymentMethod = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      const res = await getPaymentMethod();
      console.log(res)
    }
    fetchPaymentMethod()
  }, [])
  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1" keyValue="payment-method">
      {isFormVisible ? (
        <PaymentMethodForm
          key={"formPaymentMethodForm"}
          setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <DataBox
          key={"dataPaymentMethod"}
          className=" max-md:my-2.5"
          labelText="Método de Pago"
          labelClassname="md:w-1/4 md:my-2.5"
        >
          <DataItem
            Icon={<FaCcVisa className="size-6 text-[#1565C0]" />}
          >
            *****1234
          </DataItem>

          <EditButton text="Cambiar" onPress={() => setIsFormVisible(true)} />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default PaymentMethod;
