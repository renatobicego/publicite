import { Button, Chip } from "@nextui-org/react";
import { FaX } from "react-icons/fa6";

const KeywordAdded = ({
  keyword,
  deleteKeyword,
  textColor,
  borderColor,
}: {
  keyword: string;
  deleteKeyword: (keyword: string) => void;
  textColor: string;
  borderColor: string;
}) => {
  return (
    <Chip
      size="sm"
      color="default"
      variant="bordered"
      endContent={
        <Button
          isIconOnly
          color="danger"
          radius="full"
          variant="light"
          size="sm"
          onPress={() => deleteKeyword(keyword)}
        >
          <FaX />
        </Button>
      }
      className={`${textColor} ${borderColor}`}
    >
      {keyword}
    </Chip>
  );
};

export default KeywordAdded;
