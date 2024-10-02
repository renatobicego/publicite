import { Chip } from "@nextui-org/react";

const Keywords = ({
  keywords,
  textColor,
  borderColor,
}: {
  keywords: string[];
  textColor: string;
  borderColor: string;
}) => {
  return (
    <div className="flex gap-1">
      {keywords.map((item) => (
        <Chip
          size="sm"
          key={item}
          color="default"
          variant="bordered"
          className={`${textColor} ${borderColor}`}
        >
          {item}
        </Chip>
      ))}
    </div>
  );
};

export default Keywords;
