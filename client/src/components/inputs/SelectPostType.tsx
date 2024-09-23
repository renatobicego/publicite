import { postTypesItems } from "@/utils/data/selectData";
import { Select, Selection, SelectItem } from "@nextui-org/react";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

const SelectPostType = ({
  postType,
  setPostType,
}: {
  postType: string;
  setPostType: Dispatch<SetStateAction<"good" | "service" | "petition">>;
}) => {
  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPostType(e.target.value as any);
  };
  return (
    <Select
      selectedKeys={[postType]}
      onChange={handleSelectionChange}
      items={postTypesItems}
      label="Bienes, servicios o necesidades"
      placeholder="Seleccione el tipo de anuncio"
      disallowEmptySelection
      labelPlacement="outside"
      className="max-w-64"
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      classNames={{
        trigger:
          "shadow-none hover:shadow-sm border-[0.5px] data-[focus=true]:border-light-text py-1 data-[open=true]:!border-light-text",
        value: "text-[0.8125rem]",
        label: "font-medium text-[0.8125rem]",
      }}
      radius="full"
      variant="bordered"
    >
      {(postType) => (
        <SelectItem variant="light" key={postType.value} value={postType.value}>
          {postType.label}
        </SelectItem>
      )}
    </Select>
  );
};

export default SelectPostType;
