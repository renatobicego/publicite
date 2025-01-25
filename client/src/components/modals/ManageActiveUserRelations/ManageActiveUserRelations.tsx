import { UserRelations } from "@/types/userTypes";
import { CheckboxGroup } from "@nextui-org/react";
import { useMemo, useState } from "react";
import CheckboxUser from "./CheckboxUser";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";

const ManageActiveUserRelations = ({
  relations,
  activeRelationsIds,
  userId,
  closeModal,
}: {
  relations: UserRelations[];
  activeRelationsIds: ObjectId[];
  userId: ObjectId;
  closeModal: () => void;
}) => {
  const [groupSelected, setGroupSelected] = useState(activeRelationsIds);
  const [searchValue, setSearchValue] = useState("");

  const filteredRelations = useMemo(() => {
    return relations.filter((relation) => {
      const userToFilter =
        relation.userA._id === userId ? relation.userB : relation.userA;
      return (
        userToFilter.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        userToFilter.lastName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        userToFilter.username.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  }, [relations, searchValue, userId]);

  return (
    <>
      <CustomInputWithoutFormik
        value={searchValue}
        onValueChange={setSearchValue}
        label="Buscar por nombre o apellido"
        placeholder="Buscar"
        className="mb-2"
      />
      <div className="flex flex-col gap-1 w-full ">
        <CheckboxGroup
          classNames={{
            base: "w-full",
            wrapper: "max-h-[70vh] overflow-y-auto w-full flex-nowrap",
          }}
          description="Los anuncios de Agenda de Contactos que aparezcan serán unicamente de las relaciones que selecciones como activas"
          aria-label="lista de relaciones con checkbox para seleccionar las activas"
          value={groupSelected}
          onChange={setGroupSelected}
        >
          {filteredRelations.map((relation) => (
            <CheckboxUser
              key={relation._id}
              user={
                relation.userA._id === userId ? relation.userB : relation.userA
              }
              value={relation._id}
              relationType={relation.typeRelationA}
            />
          ))}
        </CheckboxGroup>
      </div>
      <menu className="flex w-full justify-end gap-2">
        <PrimaryButton variant="light" onPress={closeModal}>
          Cancelar
        </PrimaryButton>
        <PrimaryButton onPress={() => {}}>Guardar</PrimaryButton>
      </menu>
    </>
  );
};

export default ManageActiveUserRelations;
