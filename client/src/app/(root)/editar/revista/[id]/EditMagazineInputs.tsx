import {
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import { EditMagazine, PostUserMagazine } from "@/types/magazineTypes";
import { relationTypes, visibilityItems } from "@/utils/data/selectData";
import { Divider } from "@nextui-org/react";
import { Field, FormikErrors } from "formik";

const EditMagazineInputs = ({
  errors,
  isUserMagazine,
}: {
  errors: FormikErrors<EditMagazine>;
  isUserMagazine: boolean;
}) => {
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
      <Divider />
      {isUserMagazine && (
        <Field
          as={CustomSelect}
          items={relationTypes}
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
      )}
    </>
  );
};

export default EditMagazineInputs;
