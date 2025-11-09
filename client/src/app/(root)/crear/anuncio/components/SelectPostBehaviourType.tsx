import { PostBehaviourType } from "@/types/postTypes";
import { Button, Select, SelectItem } from "@nextui-org/react";

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
    <div id="post-behaviour" className="flex-col flex gap-1 justify-start">
      <h2 className="text-lg font-medium">Comportamiento de Anuncio</h2>
      <div className="flex gap-4 w-full">
        <Button
          variant={type === "libre" ? "solid" : "flat"}
          color="primary"
          className="flex-1 h-20 text-center "
          onPress={() => setType("libre")}
        >
          Anuncio Libre
        </Button>
        <Button
          variant={type === "agenda" ? "solid" : "flat"}
          color="warning"
          className="flex-1 h-20 text-center"
          onPress={() => setType("agenda")}
        >
          Anuncio de Agenda
        </Button>
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {/* <Select
        scrollShadowProps={{
          hideScrollBar: false,
        }}
        classNames={{
          trigger: "shadow-none hover:shadow-sm border-[0.5px] py-1",
          value: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
          base: "justify-start",
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
      </Select> */}
      <aside className="text-sm">
        Seleccione si el comportamiento del anuncio es libre o agenda. Los
        <em>anuncios libres</em> serán públicos y visibles por el alcance de la
        localización. Los <em>anuncios de agenda</em> serán visibles solo para
        tu agenda de contactos
      </aside>
    </div>
  );
};
export default SelectPostBehaviourType;
