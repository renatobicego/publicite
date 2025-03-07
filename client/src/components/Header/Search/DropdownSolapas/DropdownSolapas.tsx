import { Divider, Selection, useDisclosure } from "@nextui-org/react";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import OpenDropdownButton from "./OpenDropdownButton";
import ModalSelectSolapas from "./ModalSelectSolapas";

// this is the dropdwon that opens a modal to select the solapas
const DropdownSolapas = ({
  selectedKeys,
  setSelectedKeys,
  selectedPostType,
  setSelectedPostType,
}: {
  selectedKeys: string | null;
  setSelectedKeys: Dispatch<SetStateAction<string | null>>;
  selectedPostType: Selection;
  setSelectedPostType: Dispatch<SetStateAction<Selection>>;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // map the selected keys to the label
  const keyToLabel: { [key: string]: string } = {
    recomendados: "Recomendados",
    contactos: "Contactos",
    // hoy: "Anuncios de Hoy",
    // puntuados: "Mejor Puntuados",
    // vencer: "Próximos a Vencer",
    pizarras: "Pizarras",
    perfiles: "Perfiles",
    grupos: "Grupos",
  };

  // map the selected keys to the label, to be able to show the selected solapa in the dropdown text
  const selectedValue = useMemo(
    () => (selectedKeys ? keyToLabel[selectedKeys] : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedKeys]
  );

  // Check if the selected value is "Post" (for example "Grupos" is not a post)
  const postSolapas = [
    "Recomendados",
    "Contactos",
    // "Anuncios de Hoy",
    // "Mejor Puntuados",
    // "Próximos a Vencer",
  ];

  const selectedValueIsPost = useMemo(
    () =>
      postSolapas.some(
        (value) => selectedValue.includes(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedValue]
  );

  // if the selected value is not a post, reset the selected post type
  useEffect(() => {
    if (!selectedValueIsPost) {
      setSelectedPostType(new Set([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValueIsPost]);

  return (
    <>
      <Divider className="h-1/2" orientation="vertical" />
      <OpenDropdownButton onOpen={onOpen} selectedValue={selectedValue} />
      <ModalSelectSolapas
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        selectedKeys={selectedKeys}
        selectedValueIsPost={selectedValueIsPost}
        selectedPostType={selectedPostType}
        setSelectedPostType={setSelectedPostType}
        setSelectedKeys={setSelectedKeys}
      />
    </>
  );
};

export default DropdownSolapas;
