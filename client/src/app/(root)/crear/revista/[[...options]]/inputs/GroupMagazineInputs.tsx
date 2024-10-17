import { Divider, SharedSelection } from "@nextui-org/react";
import { PostGroupMagazine, PostUserMagazine } from "../initialValues";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { SelectUsers } from "@/components/inputs/SelectUsers";
import { mockedUsers } from "@/utils/data/mockedData";
import { FormikErrors, Field } from "formik";
import { User } from "@/types/userTypes";
import { useEffect, useState } from "react";
import { getGroupMembersById } from "@/services/groupsService";
import { toastifyError } from "@/utils/functions/toastify";

const GroupMagazineInputs = ({
  setValues,
  id,
}: {
  setValues: (
    values: (prevValues: PostGroupMagazine) => PostGroupMagazine,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostGroupMagazine>>;

  id: string | null;
}) => {
  const [groupMembers, setGroupMembers] = useState<User[]>();

  useEffect(() => {
    if (id) {
      getGroupMembersById(id).then((data) => {
        setGroupMembers(data.members);
      });
    } else {
      setGroupMembers([]);
      toastifyError(
        "Error al traer los miembros del grupo. Por favor intenta de nuevo."
      );
    }
  }, [id]);
  const allowAllCollaborators = () => {
    setValues((prevValues) => ({
      ...prevValues,
      allowedCollaborators: mockedUsers.map((user) => user._id),
    }));
  };

  const handleSelectionChange = (key: SharedSelection) => {
    const selectedKey = Array.isArray(key) ? key : [key.currentKey]; // Ensure it's always an array

    setValues((prevValues: PostGroupMagazine) => {
      const currentArray = prevValues.allowedCollaborators || [];
      const updatedArray = currentArray.includes(selectedKey[0])
        ? currentArray.filter((item: any) => item !== selectedKey[0]) // Remove if exists
        : [...currentArray, selectedKey[0]]; // Add if not exists

      return {
        ...prevValues,
        allowedCollaborators: updatedArray,
      };
    });
  };

  return (
    <>
      <Divider />
      <h6>¿Quién puede colaborar en la revista?</h6>
      <Field
        as={SelectUsers}
        onSelectionChange={handleSelectionChange}
        name={"allowedCollaborators"}
        aria-label="invitar colaboradores"
        items={groupMembers ?? []}
        isLoading={!groupMembers}
        onChange={() => {}}
      />

      <SecondaryButton
        size="sm"
        className="self-end"
        onPress={allowAllCollaborators}
      >
        Permitir a todos
      </SecondaryButton>
    </>
  );
};

export default GroupMagazineInputs;
