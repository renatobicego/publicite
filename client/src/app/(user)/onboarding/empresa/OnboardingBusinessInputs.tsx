import {
  CustomDateInput,
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/app/components/inputs/CustomInputs";
import PlaceAutocomplete from "@/app/components/inputs/PlaceAutocomplete";
import { BusinessSector, UserBusinessFormValues } from "@/types/userTypes";
import { CalendarDate } from "@internationalized/date";
import { Field, FormikErrors } from "formik";
import { FaFacebook, FaInstagram, FaLink, FaTwitter } from "react-icons/fa6";

interface OnboardingBusinessInputsProps {
  errors: FormikErrors<UserBusinessFormValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<UserBusinessFormValues>>;
}

const OnboardingBusinessInputs = ({
  errors,
  setFieldValue,
}: OnboardingBusinessInputsProps) => {
  const mockedBusinessSectorItems: BusinessSector[] = [
    { label: "Masculino", _id: "M", description: "Lorem ipsum" },
    { label: "Femenino", _id: "F", description: "Lorem ipsum" },
    { label: "No Binario", _id: "X", description: "Lorem ipsum" },
    { label: "Otro", _id: "O", description: "Lorem ipsum" },
  ];
  return (
    <>
      <div className="flex gap-4 w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="name"
          label="Nombre de la Empresa"
          aria-label="nombre"
          isInvalid={!!errors.name}
          errorMessage={errors.name}
          placeholder="Ingrese nombre de la empresa"
          isRequired
        />
        <Field
          as={PlaceAutocomplete}
          isRequired
          name="countryRegion"
          isInvalid={!!errors.countryRegion}
          errorMessage={errors.countryRegion}
          onSelectionChange={(value: string) =>
            setFieldValue("countryRegion", value)
          }
        />
      </div>
      <div className="flex gap-4 w-full max-2xl:flex-col">
        <Field
          as={CustomSelect}
          name="businessSector"
          isRequired
          label="Rubro de la Empresa"
          aria-label="rubro de la empresa"
          placeholder="Seleccione el rubro"
          items={mockedBusinessSectorItems}
          isInvalid={!!errors.businessSector}
          errorMessage={errors.businessSector}
          renderItem={(item: BusinessSector) => (
            <div className="flex flex-col gap-1">
              <p>{item.label}</p>
              <p className="small-text">{item.description}</p>
            </div>
          )}
          getItemLabel={(item: BusinessSector) => item.label}
          getItemTextValue={(item: BusinessSector) =>
            `${item.label}: ${item.description}`
          }
          getItemValue={(item: BusinessSector) => item._id}
        />
        <Field
          as={CustomInput}
          name="contact.phone"
          label="Contacto / Teléfono (opcional)"
          aria-label="contacto"
          placeholder="Ingrese teléfono de contacto"
        />
      </div>
      <div className="flex gap-4 w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="contact.facebook"
          label="Facebook"
          startContent={<FaFacebook />}
          aria-label="facebook"
          placeholder="Link a Facebook"
        />
        <Field
          as={CustomInput}
          name="contact.instagram"
          label="Instagram"
          startContent={<FaInstagram />}
          aria-label="instagram"
          placeholder="Link a Instagram"
        />
      </div>
      <div className="flex gap-4 w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="contact.twitter"
          label="Twitter"
          startContent={<FaTwitter />}
          aria-label="twitter"
          placeholder="Link a Twitter"
        />
        <Field
          as={CustomInput}
          name="contact.website"
          startContent={<FaLink />}
          label="Website"
          aria-label="website"
          placeholder="Link a página web"
        />
      </div>
      <Field
        as={CustomTextarea}
        name="description"
        label="Descripción"
        aria-label="descripcion"
        placeholder="Ingrese una descripción para su empresa"
      />
    </>
  );
};

export default OnboardingBusinessInputs;
