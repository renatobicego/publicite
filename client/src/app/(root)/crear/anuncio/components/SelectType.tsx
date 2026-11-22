"use client";

import { Button } from "@nextui-org/react";

export type CreatePostKind = "good" | "service" | "adspace";

const SelectType = ({
  type,
  setType,
  canPublishAdSpace = false,
}: {
  type?: CreatePostKind;
  setType: (type: CreatePostKind) => void;
  /** Sólo las cuentas Empresa / Agente publican espacios publicitarios. */
  canPublishAdSpace?: boolean;
}) => {
  return (
    <div id="post-behaviour" className="flex-col flex gap-1 justify-start">
      <h2 className="text-lg font-medium">Tipo de Anuncio</h2>
      <div className="flex gap-4 w-full">
        <Button
          variant={type === "good" ? "solid" : "flat"}
          color="primary"
          className="flex-1 h-20 text-center "
          onPress={() => setType("good")}
        >
          Bien
        </Button>
        <Button
          variant={type === "service" ? "solid" : "flat"}
          color="warning"
          className="flex-1 h-20 text-center"
          onPress={() => setType("service")}
        >
          Servicio
        </Button>
        {canPublishAdSpace && (
          <Button
            variant={type === "adspace" ? "solid" : "flat"}
            color="secondary"
            className="flex-1 h-20 text-center whitespace-normal"
            onPress={() => setType("adspace")}
          >
            Espacio publicitario
          </Button>
        )}
      </div>
    </div>
    // <Select
    //   scrollShadowProps={{
    //     hideScrollBar: false,
    //   }}
    //   classNames={{
    //     trigger: "shadow-none hover:shadow-sm border-[0.5px] py-1",
    //     value: "text-[0.8125rem]",
    //     label: "font-medium text-[0.8125rem]",
    //     base: "flex-1"
    //   }}
    //   label="Bien o Servicio"
    //   placeholder="Seleccione si publica un bien o servicio"
    //   selectedKeys={type ? [type] : []}
    //   onChange={(e) => setType(e.target.value as "good" | "service")}
    //   radius="full"
    //   isRequired
    //   labelPlacement="outside"
    //   variant="bordered"
    // >
    //   <SelectItem
    //     variant="light"
    //     classNames={{
    //       title: "text-[0.8125rem]",
    //     }}
    //     key={"good"}
    //     value="good"
    //   >
    //     Bien
    //   </SelectItem>
    //   <SelectItem
    //     variant="light"
    //     classNames={{
    //       title: "text-[0.8125rem]",
    //     }}
    //     key={"service"}
    //     value="service"
    //   >
    //     Servicio
    //   </SelectItem>
    // </Select>
  );
};

export default SelectType;
