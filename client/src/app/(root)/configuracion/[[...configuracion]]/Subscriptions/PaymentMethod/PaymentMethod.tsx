import { useState } from "react";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import PaymentMethodForm from "./PaymentMethodForm";
import { FaCcAmex, FaCcMastercard, FaCcVisa } from "react-icons/fa6";
import { Chip } from "@nextui-org/react";

const PaymentMethod = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

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
