import React from "react";
import CardTypeAccount from "./CardTypeAccount";
import { Divider } from "@nextui-org/react";

const SelectTypeAccount = () => {
  const accountTypes: {
    type: "person" | "company" | "agent";
    label: string;
  }[] = [
    {
      type: "person",
      label: "Persona",
    },
    {
      type: "company",
      label: "Empresa",
    },
    {
      // Única que puede publicar espacios publicitarios (radio, TV…).
      type: "agent",
      label: "Empresa / Agente",
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
      <div className="flex gap-4 max-md:flex-col">
        {accountTypes.map((accountType) => (
          <CardTypeAccount
            key={accountType.type}
            type={accountType.type}
            label={accountType.label}
          />
        ))}
      </div>
      <p className="small-text text-center max-w-md">
        Elegí <strong>Empresa / Agente</strong> si tenés un espacio
        publicitario (radio, streaming, TV, vía pública, diario, revista o
        influencer) y querés publicarlo para que te contacten.
      </p>
    </div>
  );
};

export default SelectTypeAccount;
