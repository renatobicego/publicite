import { Button } from "@nextui-org/react";
import DataBox from "../DataBox";
import { FaColonSign } from "react-icons/fa6";
import { useState } from "react";
import Board from "@/app/components/Board/Board";

const BoardPersonalization = () => {
  const [colorSelected, setColorSelected] = useState("bg-fondo");
  const colors = [
    "bg-fondo",
    "bg-white",
    "bg-[#D8FFC6]",
    "bg-[#20A4F3]/30",
    "bg-[#FFF275]/80",
    "bg-[#FFB238]/80",
    "bg-[#5A0001]/80",
  ];
  return (
    <DataBox labelText="Personalizar Pizarra" className="!items-start mt-2.5" labelClassname="mt-1">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-1">
          {colors.map((color: string) => (
            <Button
              key={color}
              variant="bordered"
              isIconOnly
              size="sm"
              onPress={() => setColorSelected(color)}
              className={`${color} ${
                colorSelected === color ? "border-secondary" : ""
              }`}
            >
              <FaColonSign className="size-[0.01px]" />
            </Button>
          ))}
        </div>
        <Board
          bg={colorSelected}
          isMyBoard
          board={{
            user: { name: "Javier" },
            annotations: [
              "Cambie el color de fondo de su pizarra",
              "Esta es una anotación de prueba",
            ],
            _id: "1234",
            keywords: ["Pizarra", "Publicité"],
            visibility: "Public",
          }}
        />
      </div>
    </DataBox>
  );
};

export default BoardPersonalization;
