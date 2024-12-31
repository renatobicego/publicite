import { postTypesItems } from "@/utils/data/selectData";
import { POSTS } from "@/utils/data/urls";
import { Link, Select, SelectItem } from "@nextui-org/react";
import { usePathname } from "next/navigation";

const SelectPostType = ({ postType }: { postType: string }) => {
  const pathname = usePathname();
  const getUrlPostType = (postType: string) => {
    switch (postType) {
      case "good":
        const urlWithoutPostType = pathname.replace("/servicios", "").replace("/necesidades", "");
        return urlWithoutPostType;
      case "service":
        return `servicios`;
      case "petition":
        return `necesidades`;
    }
  };
  return (
    <Select
      selectedKeys={[postType]}
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
