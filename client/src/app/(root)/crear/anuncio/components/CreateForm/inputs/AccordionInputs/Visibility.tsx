import { CustomSelect } from "@/components/inputs/CustomInputs";
import {
  GoodPostValues,
  PostBehaviourType,
  ServicePostValues,
} from "@/types/postTypes";
import {
  relationTypes,
  visibilityItems,
  visibilityRegisteredOrNot,
} from "@/utils/data/selectData";
import { Field, FormikErrors } from "formik";
import React, { memo } from "react";

const Visibility = ({
  errors,
  postBehaviourType,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  postBehaviourType: PostBehaviourType;
}) => {
  return (
    <div className="flex gap-2 max-xl:flex-wrap">
      {postBehaviourType === "agenda" && (
        <Field
          as={CustomSelect}
          items={relationTypes}
          disallowEmptySelection
          getItemValue={(item: any) => item.value}
          getItemTextValue={(item: any) => item.plural}
          getItemLabel={(item: any) => item.plural}
          name="visibility.post"
          label="Visibilidad del Anuncio"
          placeholder="¿Quién puede ver el anuncio?"
          aria-label="visibilidad del anuncio"
          isInvalid={!!errors.visibility?.post}
          errorMessage={errors.visibility?.post}
        />
      )}
      {postBehaviourType === "libre" && (
        <Field
          as={CustomSelect}
          items={visibilityRegisteredOrNot}
          disallowEmptySelection
          getItemValue={(item: any) => item.value}
          getItemTextValue={(item: any) => item.label}
          getItemLabel={(item: any) => item.label}
          name="visibility.socialMedia"
          description="Seleccione la visibilidad de sus redes sociales dentro del anuncio."
          label="Visibilidad de sus Redes Sociales"
          placeholder="¿Quién puede ver sus redes?"
          aria-label="visibilidad de sus redes"
          isInvalid={!!errors.visibility?.socialMedia}
          errorMessage={errors.visibility?.socialMedia}
        />
      )}
    </div>
  );
};

export default memo(Visibility);
