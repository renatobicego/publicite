import SecondaryButton from "@/components/buttons/SecondaryButton";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";

const RulesPopover = ({ rules }: { rules: string }) => {
  return (
    <Popover
      placement="bottom"
      classNames={{
        content: "max-w-[300px] lg:max-w-[400px] ",
      }}
    >
      <PopoverTrigger>
        <SecondaryButton variant="flat" endContent={<FaChevronDown />}>
          Reglas del Grupo
        </SecondaryButton>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Reglas del Grupo</div>
          <div className="text-tiny">
            {rules.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RulesPopover;
