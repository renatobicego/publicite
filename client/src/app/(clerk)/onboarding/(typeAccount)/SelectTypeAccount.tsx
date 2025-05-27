import React from "react";
import CardTypeAccount from "./CardTypeAccount";
import { Divider } from "@nextui-org/react";

const SelectTypeAccount = () => {
  const accountTypes: { type: "person" | "company"; label: string }[] = [
    {
      type: "person",
      label: "Persona",
    },
    {
      type: "company",
      label: "Empresa",
    },
  ];
  return (
    <div className="card flex flex-col items-center bg-white px-6 md:px-10 py-8 gap-4 max-md:w-5/6">
      <div>
        <h5 className="text-center">¿Cómo planea utilizar su cuenta?</h5>
        <p className="small-text text-center">
          Seleccione el tipo de cuenta que desea crear.
        </p>
      </div>
      <Divider />
      <div className="flex gap-4">
        {accountTypes.map((accountType) => (
          <CardTypeAccount
            key={accountType.type}
            type={accountType.type}
            label={accountType.label}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectTypeAccount;
