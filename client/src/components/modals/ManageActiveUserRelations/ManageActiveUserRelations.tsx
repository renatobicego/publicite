import { ActiveUserRelation, UserRelations } from "@/types/userTypes";
import { CheckboxGroup, Skeleton, Slider, Spinner } from "@nextui-org/react";
import { useMemo, useState } from "react";
import CheckboxUser from "./CheckboxUser";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { putActiveRelations } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useConfigData } from "@/app/(root)/providers/userDataProvider";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateActiveRelations } = useConfigData();
  const {
    activeRelations: { limit },
  } = useUserPostLimit();

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await putActiveRelations(groupSelected);
    setIsSubmitting(false);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    const newActiveRelations: ActiveUserRelation[] = relations
      .filter((relation) => groupSelected.includes(relation._id))
      .map((relation) => ({
        ...relation,
        userA: relation.userA._id,
        userB: relation.userB._id,
      }));

    updateActiveRelations(newActiveRelations);
    toastifySuccess("Relaciones activas guardadas");
    closeModal();
  };

  if (!limit) {
    return (
      <>
        <Skeleton className="w-full h-16 rounded-lg" />
        <Skeleton className="w-full h-16 rounded-lg" />
        <Skeleton className="w-full h-40 rounded-lg" />
      </>
    );
  }

  return (
    <>
      <CustomInputWithoutFormik
        value={searchValue}
        onValueChange={setSearchValue}
        label="Buscar por nombre o apellido"
        placeholder="Buscar"
        className="mb-2"
      />
      <Slider
        className="max-w-md"
        value={groupSelected.length}
        getValue={(relations) => `${relations} activas de ${limit} disponibles`}
        label="Relaciones Activas"
        isDisabled
        hideThumb
        size="sm"
        classNames={{
          base: "opacity-100",
        }}
      />
      <PrimaryButton
        size="sm"
        onPress={() => setGroupSelected(relations.map((r) => r._id))}
      >
        Activar todos
      </PrimaryButton>
      <div className="flex flex-col gap-1 w-full ">
        <CheckboxGroup
          classNames={{
            base: "w-full",
            wrapper: "max-h-[70vh] overflow-y-auto w-full flex-nowrap",
          }}
          description="Los anuncios de Agenda de Contactos que aparezcan serán unicamente de las relaciones que selecciones como activas"
          aria-label="lista de relaciones con checkbox para seleccionar las activas"
          value={groupSelected}
          onChange={(groupSelected) => {
            if (groupSelected.length > limit) {
              toastifyError(
                `No puedes seleccionar mas de ${limit} relaciones activas`
              );
              return;
            }

            setGroupSelected(groupSelected);
          }}
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
        <PrimaryButton
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onPress={handleSubmit}
        >
          Guardar
        </PrimaryButton>
      </menu>
    </>
  );
};

export default ManageActiveUserRelations;
