import { PostBehaviourType } from "@/types/postTypes";
import { Select, SelectItem } from "@nextui-org/react";

const SelectPostBehaviourType = ({
  type,
  setType,
  errorMessage,
}: {
  type?: PostBehaviourType;
  setType: (type: PostBehaviourType) => void;
  errorMessage?: string;
}) => {
  return (
    <>
      <Select
        scrollShadowProps={{
          hideScrollBar: false,
        }}
        classNames={{
          trigger: "shadow-none hover:shadow-sm border-[0.5px] py-1",
          value: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
          base: "flex-1",
        }}
        label="Comportamiento de Anuncio"
        placeholder="Seleccione si el comportamiento del anuncio es libre o agenda"
        selectedKeys={type ? [type] : []}
        onChange={(e) => setType(e.target.value as PostBehaviourType)}
        radius="full"
        isRequired
        errorMessage={errorMessage}
        isInvalid={!!errorMessage}
        labelPlacement="outside"
        variant="bordered"
      >
        <SelectItem
          variant="light"
          classNames={{
            title: "text-[0.8125rem]",
          }}
          key={"libre"}
          value="libre"
        >
          Libre
        </SelectItem>
        <SelectItem
          variant="light"
          classNames={{
            title: "text-[0.8125rem]",
          }}
          key={"agenda"}
          value="agenda"
        >
          Agenda
        </SelectItem>
      </Select>
      <aside className="text-sm">
        Los <em>anuncios libres</em> serán públicos y visibles por el alcance de
        la localización. Los <em>anuncios de agenda</em> serán visibles solo
        para tu agenda de contactos
      </aside>
    </>
  );
};
export default SelectPostBehaviourType;
