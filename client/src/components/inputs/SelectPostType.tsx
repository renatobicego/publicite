import { postTypesItems } from "@/utils/data/selectData";
import { Link, Select, SelectItem } from "@nextui-org/react";
import { usePathname } from "next/navigation";

const SelectPostType = ({ postType }: { postType: PostType }) => {
  const pathname = usePathname();
  const getUrlPostType = (postType: PostType) => {
    const urlWithoutPostType = pathname
      .replace("/servicios", "")
      .replace("/necesidades", "");
    switch (postType) {
      case "good":
        return urlWithoutPostType;
      case "service":
        return `${urlWithoutPostType}/servicios`;
      case "petition":
        return `${urlWithoutPostType}/necesidades`;
    }
  };
  return (
    <Select
      selectedKeys={[postType]}
      items={postTypesItems}
      id="select-post-type"
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
        <SelectItem
          variant="light"
          className="text-text-color"
          key={postType.value}
          value={postType.value}
          as={Link}
          href={getUrlPostType(postType.value)}
        >
          {postType.label}
        </SelectItem>
      )}
    </Select>
  );
};

export default SelectPostType;
