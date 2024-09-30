import DataBox from "../DataBox";
import { useState } from "react";
import Board from "@/components/Board/Board";
import BoardColor from "@/components/Board/inputs/BoardColor";

const BoardPersonalization = () => {
  const [colorSelected, setColorSelected] = useState("bg-fondo");
  
  return (
    <DataBox labelText="Personalizar Pizarra" className="!items-start mt-2.5" labelClassname="mt-1">
      <div className="flex-1 flex flex-col gap-4">
        <BoardColor colorSelected={colorSelected} setColorSelected={setColorSelected} />
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
