import { Field, FormikErrors } from "formik";
import { ChangeEvent, memo, SetStateAction, useEffect, useState } from "react";
import {
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import { visibilityItems } from "@/utils/data/selectData";
import { mockedUsers } from "@/utils/data/mockedData";
import { Divider } from "@nextui-org/react";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { PostGroupMagazine, PostUserMagazine } from "./initialValues";
import { useUser } from "@clerk/nextjs";
import { getUsers } from "@/services/userServices";
import { SearchUsers } from "@/components/inputs/SelectUsers";

const Inputs = ({
  errors,
  isUserMagazine,
  setValues,
}: {
  errors: FormikErrors<PostUserMagazine | PostGroupMagazine>;
  isUserMagazine: boolean;
  setValues: (
    values: (
      prevValues: PostUserMagazine | PostGroupMagazine
    ) => PostUserMagazine | PostGroupMagazine,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostUserMagazine | PostGroupMagazine>>;
}) => {
  const [userContacts, setUserContacts] = useState([]);
  const { user } = useUser();

  const getUsersByQuery = (query: string | null) => {
    getUsers(query).then((users) => setUserContacts(users.items));
  };

  useEffect(() => {
    getUsersByQuery("");
  }, []);

  const handleSelectionChange = (key: any) => {
    setValues((prevValues: any) => {
      const currentArray =
        prevValues[isUserMagazine ? "collaborators" : "allowedCollaborators"];
      const updatedArray = currentArray.includes(key)
        ? currentArray.filter((item: any) => item !== key) // Remove if exists
        : [...currentArray, key]; // Add if not exists

      return {
        ...prevValues,
        [isUserMagazine ? "collaborators" : "allowedCollaborators"]:
          updatedArray,
      };
    });
  };

  const allowAllCollaborators = () => {
    setValues((prevValues) => ({
      ...prevValues,
      allowedCollaborators: mockedUsers.map((user) => user._id),
    }));
  };

  return (
    <>
      <Field
        as={CustomInput}
        name="name"
        label="Título"
        placeholder="Agregue un título"
        isRequired
        aria-label="título"
        isInvalid={!!errors.name}
        errorMessage={errors.name}
      />
      <Field
        as={CustomTextarea}
        name="description"
        label="Descripción"
        placeholder="Agregue una descripción"
        description="Máximo 100 caracteres"
        aria-label="descripción"
        isInvalid={!!errors.description}
        errorMessage={errors.description}
      />
      {isUserMagazine && (
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
        </>
      )}
      <Divider />
      <h6>
        {isUserMagazine
          ? "Invitar Colaboradores"
          : "¿Quién puede colaborar en la revista?"}
      </h6>
      <Field
        as={SearchUsers}
        onSelectionChange={handleSelectionChange}
        name={isUserMagazine ? "collaborators" : "allowedCollaborators"}
        aria-label="invitar colaboradores"
        onValueChange={(value: string | null) => getUsersByQuery(value)}
        items={userContacts}
      />
      {!isUserMagazine && (
        <SecondaryButton
          size="sm"
          className="self-end"
          onPress={allowAllCollaborators}
        >
          Permitir a todos
        </SecondaryButton>
      )}
      
    </>
  );
};

export default memo(Inputs);
