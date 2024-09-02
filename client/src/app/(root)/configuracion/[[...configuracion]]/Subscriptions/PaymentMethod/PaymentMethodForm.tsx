import { Button } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { DataItem } from "../../DataBox";
import { FaCcVisa } from "react-icons/fa6";
import SecondaryButton from "@/app/components/buttons/SecondaryButton";

const PaymentMethodForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  return (
    <FormCard
      title="Actualizar método de pago"
      cardBodyClassname="flex flex-col gap-2 items-start"
    >
      <DataItem className="font-semibold" Icon={<FaCcVisa className="size-6 text-[#1565C0]" />}>
        Tarjeta de crédito terminada en *****1234
      </DataItem>
      <p className="text-sm">
        Este es el mêtodo de pago que se utilizará para realizar los pagos
        recurrentes de su plan de subscripción.
      </p>
      <div className="flex gap-2 items-center w-full justify-end">
        <Button
          color="default"
          variant="light"
          radius="full"
          onPress={() => setIsFormVisible(false)}
        >
          Cancelar
        </Button>
        <SecondaryButton>
          Cambiar Método
        </SecondaryButton>
      </div>
    </FormCard>
  );
};

export default PaymentMethodForm;
