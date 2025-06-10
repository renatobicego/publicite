import { contactSchema } from "@/app/(root)/(configuracion)/Profile/SocialMedia/socialMediaValidation";
import { object, string } from "yup";

export const userPersonValidation = object({
  gender: string()
    .required("El genero es requerido")
    .min(1, "El genero es requerido"),
  birthDate: string()
    .required("La fecha de nacimiento es requerida")
    .min(6, "La fecha de nacimiento es requerida"),
  countryRegion: string()
    .required("El pais y la región es requerida")
    .min(3, "El pais y la región es requerida"),
  contact: contactSchema,
  dni: string()
    .required("El DNI es requerido")
    .test("dni", "El DNI no debe incluir puntos", (value) => {
      if (!value) return false;
      return !value.includes(".");
    })
    .test("dni", "El DNI no es válido", (value) => {
      if (!value) return false;
      const dniRegex = /^\d{7,8}$/; // DNI format: 7-8 digits
      return dniRegex.test(value.trim()); // Validate the DNI format
    }),
});
