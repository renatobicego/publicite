import {  useState } from "react";
import AccountTypeForm from "./AccountTypeForm";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { CardDataItem, EditButton } from "../../DataBox";

const AccountType = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1" keyValue="account-type">
      {isFormVisible ? (
        <AccountTypeForm
          key={"formAccountType"}
          setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <DataBox
          key={"dataAccountType"}
          className=" max-md:my-2.5 !items-start"
          labelText="Tipo de Cuenta"
          labelClassname="md:w-1/4 md:mt-2.5"
        >
          <CardDataItem
            title="Publicité Premium"
            subtitle="Próximo pago: 03/09"
            boldLabel="$100.00 por mes"
          />
          <EditButton
            text={<>Actualizar<span className="hidden min-[900px]:inline"> - Cancelar</span></>}
            onPress={() => setIsFormVisible(true)}
          />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default AccountType;
