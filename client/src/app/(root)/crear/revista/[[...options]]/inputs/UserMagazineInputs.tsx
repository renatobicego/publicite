import { CustomSelect } from "@/components/inputs/CustomInputs";
import { SearchUsers } from "@/components/inputs/SearchUsers";
import { visibilityItems } from "@/utils/data/selectData";
import { Divider } from "@nextui-org/react";
import { Field, FormikErrors } from "formik";
import useSearchUsers from "@/utils/hooks/useSearchUsers";
import { PostGroupMagazine, PostUserMagazine } from "@/types/magazineTypes";
import { useUserData } from "@/app/(root)/providers/userDataProvider";

const UserMagazineInputs = ({
  errors,
  setValues,
}: {
  errors: FormikErrors<PostUserMagazine | PostGroupMagazine>;
  setValues: (
    values: (
      prevValues: PostUserMagazine | PostGroupMagazine
    ) => PostUserMagazine | PostGroupMagazine,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostUserMagazine | PostGroupMagazine>>;
}) => {
  const { users: userContacts, getUsersByQuery } = useSearchUsers();
  const { userIdLogged } = useUserData();

  const handleSelectionChange = (key: any) => {
    setValues((prevValues: any) => {
      const currentArray = prevValues.collaborators;
      const updatedArray = currentArray.includes(key)
        ? currentArray.filter((item: any) => item !== key) // Remove if exists
        : [...currentArray, key]; // Add if not exists

      return {
        ...prevValues,
        collaborators: updatedArray,
      };
    });
  };
  return (
    <>
      <Divider />
      <Field
        as={CustomSelect}
        items={visibilityItems}
        disallowEmptySelection
        getItemValue={(item: any) => item.value}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="visibility"
        label="Visibilidad de la Revista"
        placeholder="¿Quién puede ver la revista?"
        aria-label="visibilidad de la revista"
        isInvalid={!!(errors as FormikErrors<PostUserMagazine>).visibility}
        errorMessage={(errors as FormikErrors<PostUserMagazine>).visibility}
      />
      <Divider />
      <h6>Invitar Colaboradores</h6>
      <Field
        as={SearchUsers}
        onSelectionChange={handleSelectionChange}
        name={"collaborators"}
        aria-label="invitar colaboradores"
        onValueChange={(value: string | null) => getUsersByQuery(value)}
        items={userContacts.filter((user) => user._id !== userIdLogged)}
      />
    </>
  );
};

export default UserMagazineInputs;
