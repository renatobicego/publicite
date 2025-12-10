import { postTypesItems } from "@/utils/data/selectData";
import { Select, SelectItem } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";

const SelectPostType = ({
  postType,
  setPostType,
}: {
  postType: PostType | null;
  setPostType: Dispatch<SetStateAction<PostType | null>>;
}) => {
  return (
    <Select
      selectedKeys={postType ? [postType] : []}
      items={postTypesItems}
      id="select-post-type"
      label="Bienes, servicios o necesidades"
      placeholder="Seleccione el tipo de anuncio"
      disallowEmptySelection
      labelPlacement="outside"
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] as PostType;
        setPostType(selectedKey);
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
        <SelectItem
          variant="light"
          className="text-text-color"
          key={postType.value}
          value={postType.value}
        >
          {postType.label}
        </SelectItem>
      )}
    </Select>
  );
};

export default SelectPostType;
