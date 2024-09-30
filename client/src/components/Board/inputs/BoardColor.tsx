import { boardColors } from "@/utils/data/selectData";
import { Button } from "@nextui-org/react";
import { FaColonSign } from "react-icons/fa6";

const BoardColor = ({
  colorSelected,
  setColorSelected,
}: {
  colorSelected: string;
  setColorSelected: any;
}) => {
  return (
    <div className="flex gap-1">
      {boardColors.map((color: string, index) => (
        <Button
          key={index}
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
  );
};

export default BoardColor;
