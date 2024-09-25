import SecondaryButton from "@/components/buttons/SecondaryButton";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";

const RulesPopover = ({rules} : {rules: string}) => {
  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <SecondaryButton variant="flat" endContent={<FaChevronDown />}>
          Reglas del Grupo
        </SecondaryButton>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Reglas del Grupo</div>
          <div className="text-tiny">
            {rules}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RulesPopover;
