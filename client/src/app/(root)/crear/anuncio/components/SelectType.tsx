"use client";

import { postTypesItems } from "@/utils/data/selectData";
import { Select, SelectItem } from "@nextui-org/react";

const SelectType = ({
  type,
  setType,
}: {
  type?: "good" | "service";
  setType: (type: "good" | "service") => void;
}) => {
  return (
    <Select
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      classNames={{
        trigger: "shadow-none hover:shadow-sm border-[0.5px] py-1",
        value: "text-[0.8125rem]",
        label: "font-medium text-[0.8125rem]",
        base: "flex-1"
      }}
      label="Bien o Servicio"
      placeholder="Seleccione si publica un bien o servicio"
      selectedKeys={type ? [type] : []}
      onChange={(e) => setType(e.target.value as "good" | "service")}
      radius="full"
      isRequired
      labelPlacement="outside"
      variant="bordered"
    >
      <SelectItem
        variant="light"
        classNames={{
          title: "text-[0.8125rem]",
        }}
        key={"good"}
        value="good"
      >
        Bien
      </SelectItem>
      <SelectItem
        variant="light"
        classNames={{
          title: "text-[0.8125rem]",
        }}
        key={"service"}
        value="service"
      >
        Servicio
      </SelectItem>
    </Select>
  );
};

export default SelectType;
