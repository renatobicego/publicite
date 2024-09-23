import { Button } from "@nextui-org/react";
import DataBox from "../DataBox";
import { FaColonSign } from "react-icons/fa6";
import { useState } from "react";
import Board from "@/components/Board/Board";
import { boardColors } from "@/utils/data/selectData";

const BoardPersonalization = () => {
  const [colorSelected, setColorSelected] = useState("bg-fondo");
  
  return (
    <DataBox labelText="Personalizar Pizarra" className="!items-start mt-2.5" labelClassname="mt-1">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-1">
          {boardColors.map((color: string) => (
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
          isProfile
          board={{
            user: { username: "javierrivas", profilePhotoUrl: "", name: "Javier" },
            annotations: [
              "Cambie el color de fondo de su pizarra",
              "Esta es una anotación de prueba",
            ],
            _id: "1234",
            keywords: ["Pizarra", "Publicité"],
            visibility: "public",
          }}
        />
      </div>
    </DataBox>
  );
};

export default BoardPersonalization;
