import { useState } from "react";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import PaymentMethodForm from "./PaymentMethodForm";
import { FaCcAmex, FaCcMastercard, FaCcVisa } from "react-icons/fa6";
import { Chip } from "@nextui-org/react";

const PaymentMethod = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1">
      {isFormVisible ? (
        <PaymentMethodForm
          key={"formPaymentMethodForm"}
          setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <DataBox
          className=" max-md:my-2.5 !items-start"
          labelText="Método de Pago"
          labelClassname="md:w-1/4 md:my-2.5"
        >
          <div className="flex flex-col gap-2 flex-1 my-2.5">
            <div className="flex gap-2 items-center justify-start">
              <DataItem className="flex-none max-md:min-w-0" Icon={<FaCcVisa className="size-6 text-[#1565C0]" />}>
                *****1234
              </DataItem>
              <Chip size="sm" className="border-petition px-1" variant="bordered">
                Primario
              </Chip>
            </div>
            <DataItem
              Icon={<FaCcMastercard className="size-6 text-[#3F51B5]" />}
            >
              *****1234
            </DataItem>
            <DataItem Icon={<FaCcAmex className="size-6 text-blue-600" />}>
              *****1234
            </DataItem>
          </div>
          <EditButton text="Cambiar" onPress={() => setIsFormVisible(true)} />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default PaymentMethod;
