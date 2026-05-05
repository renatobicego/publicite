import { CustomInput, CustomSelect } from "@/components/inputs/CustomInputs";
import { Contact } from "@/types/userTypes";
import { Field, FieldArray, FormikErrors } from "formik";
import { FaXTwitter, FaLink, FaPlus, FaTrash } from "react-icons/fa6";
import { IoLogoFacebook, IoLogoInstagram, IoLogoWhatsapp } from "react-icons/io";
import { visibilityItems } from "@/utils/data/selectData";
import { Button } from "@nextui-org/react";
import { SocialMediaFormValues } from "./SocialMediaForm";
import SecondaryButton from "@/components/buttons/SecondaryButton";

interface FormInputsProps {
  errors: FormikErrors<SocialMediaFormValues>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => any;
  values: SocialMediaFormValues;
}

const VisibilitySelect = ({ name, label }: { name: string; label: string }) => (
  <Field
    as={CustomSelect}
    name={name}
    label={label}
    aria-label={label}
    items={visibilityItems}
    getItemValue={(item: any) => item.value}
    getItemTextValue={(item: any) => item.label}
    getItemLabel={(item: any) => item.label}
    placeholder="Visibilidad"
    className="max-w-[160px]"
  />
);

const FormInputs = ({ errors, setFieldValue, values }: FormInputsProps) => {
  return (
    <>
      {/* Phone */}
      <div className="flex gap-3 items-end w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="phone"
          label="Whatsapp / Teléfono"
          isInvalid={!!errors.phone}
          errorMessage={errors.phone}
          aria-label="contacto"
          placeholder="Ingrese teléfono de contacto"
          startContent={<IoLogoWhatsapp className="size-5 text-green-600" />}
          className="flex-1"
        />
        <VisibilitySelect name="phoneVisibility" label="Visibilidad teléfono" />
      </div>

      {/* Instagram */}
      <div className="flex gap-3 items-end w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="instagram"
          label="Instagram"
          isInvalid={!!errors.instagram}
          errorMessage={errors.instagram}
          startContent={
            <IoLogoInstagram className="size-5 instagram-gradient text-white rounded-md overflow-hidden" />
          }
          aria-label="instagram"
          placeholder="Link a Instagram"
          className="flex-1"
        />
        <VisibilitySelect name="instagramVisibility" label="Visibilidad Instagram" />
      </div>

      {/* Facebook */}
      <div className="flex gap-3 items-end w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="facebook"
          label="Facebook"
          isInvalid={!!errors.facebook}
          errorMessage={errors.facebook}
          startContent={<IoLogoFacebook className="size-5 text-blue-600" />}
          aria-label="facebook"
          placeholder="Link a Facebook"
          className="flex-1"
        />
        <VisibilitySelect name="facebookVisibility" label="Visibilidad Facebook" />
      </div>

      {/* X/Twitter */}
      <div className="flex gap-3 items-end w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="x"
          isInvalid={!!errors.x}
          errorMessage={errors.x}
          label="X/Twitter"
          startContent={<FaXTwitter className="size-4 text-slate-900" />}
          aria-label="twitter"
          placeholder="Link a X/Twitter"
          className="flex-1"
        />
        <VisibilitySelect name="xVisibility" label="Visibilidad X/Twitter" />
      </div>

      {/* Website */}
      <div className="flex gap-3 items-end w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="website"
          isInvalid={!!errors.website}
          errorMessage={errors.website}
          startContent={<FaLink className="size-4 text-text-color" />}
          label="Website"
          aria-label="website"
          placeholder="Link a página web"
          className="flex-1"
        />
        <VisibilitySelect name="websiteVisibility" label="Visibilidad Website" />
      </div>

      {/* Curriculum */}
      <div className="flex flex-col gap-1">
        <p className="text-[0.8125rem] font-medium">Curriculum (PDF)</p>
        <div className="flex gap-3 items-end max-2xl:flex-col">
          <div className="flex-1">
            <input
              type="file"
              accept=".pdf"
              aria-label="curriculum"
              className="text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setFieldValue("curriculumFile", file);
              }}
            />
            {values.curriculum?.ref && !values.curriculumFile && (
              <p className="text-xs text-default-400 mt-1">CV actual cargado</p>
            )}
          </div>
          <Field
            as={CustomSelect}
            name="curriculum.visibility"
            label="Visibilidad CV"
            aria-label="visibilidad curriculum"
            items={visibilityItems}
            getItemValue={(item: any) => item.value}
            getItemTextValue={(item: any) => item.label}
            getItemLabel={(item: any) => item.label}
            placeholder="Visibilidad"
            className="max-w-[160px]"
          />
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2">
        <p className="text-[0.8125rem] font-medium">Links adicionales</p>
        <FieldArray name="links">
          {({ push, remove }) => (
            <div className="flex flex-col gap-3">
              {(values.links ?? []).map((link, index) => (
                <div key={index} className="flex gap-2 items-end max-2xl:flex-wrap">
                  <Field
                    as={CustomInput}
                    name={`links.${index}.url`}
                    label="URL"
                    aria-label={`link url ${index}`}
                    placeholder="https://..."
                    startContent={<FaLink className="size-3 text-text-color" />}
                    className="flex-1"
                  />
                  <Field
                    as={CustomInput}
                    name={`links.${index}.label`}
                    label="Etiqueta"
                    aria-label={`link label ${index}`}
                    placeholder="Ej: Portfolio"
                    className="flex-1"
                  />
                  <Field
                    as={CustomSelect}
                    name={`links.${index}.visibility`}
                    label="Visibilidad"
                    aria-label={`link visibility ${index}`}
                    items={visibilityItems}
                    getItemValue={(item: any) => item.value}
                    getItemTextValue={(item: any) => item.label}
                    getItemLabel={(item: any) => item.label}
                    placeholder="Visibilidad"
                    className="max-w-[140px]"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    aria-label="eliminar link"
                    onPress={() => remove(index)}
                    className="mb-1"
                  >
                    <FaTrash className="size-3" />
                  </Button>
                </div>
              ))}
              <SecondaryButton
                type="button"
                variant="flat"
                onPress={() => push({ url: "", label: "", visibility: "contacts" as Visibility })}
                className="w-fit"
              >
                <FaPlus className="size-3 mr-1" /> Agregar link
              </SecondaryButton>
            </div>
          )}
        </FieldArray>
      </div>
    </>
  );
};

export default FormInputs;
