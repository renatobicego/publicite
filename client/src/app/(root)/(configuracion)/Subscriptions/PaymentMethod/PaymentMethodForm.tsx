import { Button } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { DataItem } from "../../DataBox";
import { FaCcVisa } from "react-icons/fa6";
import SecondaryButton from "@/components/buttons/SecondaryButton";

const PaymentMethodForm = ({
  setIsFormVisible,
  paymentMethod,
  paymentIcon,
}: {
  setIsFormVisible: (value: boolean) => void;
  paymentMethod: {
    lastDigits: string;
    cardId: string;
    payment_type_id: "credit_card" | "debit_card";
  };
  paymentIcon: React.ReactNode;
}) => {
  return (
    <FormCard
      title="Actualizar método de pago"
      cardBodyClassname="flex flex-col gap-2 items-start"
    >
      <DataItem className="font-semibold" Icon={paymentIcon}>
        Tarjeta de{" "}
        {paymentMethod.payment_type_id === "credit_card" ? "crédito" : "débito"}{" "}
        terminada en *****{paymentMethod.lastDigits}
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
        <SecondaryButton>Cambiar Método</SecondaryButton>
      </div>
    </FormCard>
  );
};

export default PaymentMethodForm;
