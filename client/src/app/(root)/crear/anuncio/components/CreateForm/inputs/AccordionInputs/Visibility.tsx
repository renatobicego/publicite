import { CustomSelect } from "@/app/components/inputs/CustomInputs";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors } from "formik";
import React from "react";

const Visibility = ({
  errors,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
}) => {
  const visibilityItems: { value: Visibility; label: string }[] = [
    {
      value: "public",
      label: "Público",
    },
    {
      value: "registered",
      label: "Usuarios Registrados",
    },
    {
      value: "Contacts",
      label: "Contactos",
    },
    {
      value: "Friends",
      label: "Amigos",
    },
    {
      value: "TopFriends",
      label: "Top Amigos",
    },
  ];
  return (
    <div className="flex gap-2 max-xl:flex-wrap">
      <Field
        as={CustomSelect}
        items={visibilityItems}
        allowEmptySelection={false}
        getItemValue={(item: any) => item.value}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="visibility.post"
        label="Visibilidad del Anuncio"
        placeholder="¿Quién puede ver el anuncio?"
        aria-label="visibilidad del anuncio"
        isInvalid={!!errors.visibility?.post}
        errorMessage={errors.visibility?.post}
      />
      <Field
        as={CustomSelect}
        items={visibilityItems}
        allowEmptySelection={false}
        getItemValue={(item: any) => item.value}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="visibility.socialMedia"
        label="Visibilidad de sus Redes Sociales"
        placeholder="¿Quién puede ver sus redes?"
        aria-label="visibilidad de sus redes"
        isInvalid={!!errors.visibility?.socialMedia}
        errorMessage={errors.visibility?.socialMedia}
      />
    </div>
  );
};

export default Visibility;
