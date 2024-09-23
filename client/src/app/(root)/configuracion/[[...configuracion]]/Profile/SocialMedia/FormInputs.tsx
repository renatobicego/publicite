import { CustomInput } from "@/components/inputs/CustomInputs";
import { Contact } from "@/types/userTypes";
import { Field, FormikErrors } from "formik";
import { FaXTwitter, FaLink } from "react-icons/fa6";
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoWhatsapp,
} from "react-icons/io";
interface PersonalDataFormInputsProps {
  errors: FormikErrors<Contact>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<Contact>>;
}
const FormInputs = ({ errors }: PersonalDataFormInputsProps) => {
  return (
    <>
      <div className="flex gap-4 w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="facebook"
          label="Facebook"
          isInvalid={!!errors.facebook}
          errorMessage={errors.facebook}
          startContent={<IoLogoFacebook className="size-5 text-blue-600" />}
          aria-label="facebook"
          placeholder="Link a Facebook"
        />
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
        />
        <Field
          as={CustomInput}
          name="x"
          isInvalid={!!errors.x}
          errorMessage={errors.x}
          label="X/Twitter"
          startContent={<FaXTwitter className="size-4 text-slate-900" />}
          aria-label="twitter"
          placeholder="Link a X/Twitter"
        />
      </div>
      <div className="flex gap-4 w-full max-2xl:flex-col">
        <Field
          as={CustomInput}
          name="phone"
          label="whatsapp / Teléfono"
          isInvalid={!!errors.phone}
          errorMessage={errors.phone}
          aria-label="contacto"
          placeholder="Ingrese teléfono de contacto"
          startContent={<IoLogoWhatsapp className="size-5 text-green-600" />}
        />
        <Field
          as={CustomInput}
          name="website"
          isInvalid={!!errors.website}
          errorMessage={errors.website}
          startContent={<FaLink className="size-4 text-text-color" />}
          label="Website"
          aria-label="website"
          placeholder="Link a página web"
        />
      </div>
    </>
  );
};

export default FormInputs;
