import { phoneRegex } from "@/app/(root)/(configuracion)/Profile/SocialMedia/socialMediaValidation";
import { object, string } from "yup";

export const contactFormValidation = object({
  fullName: string()
    .required("El nombre completo es requerido")
    .min(3, "El nombre completo debe tener al menos 3 caracteres"),
  email: string()
    .required("El email es requerido")
    .email("Debe ser un email válido"),
  phone: string()
    .nullable()
    .notRequired()
    .matches(phoneRegex, "El número de teléfono no es válido")
    .test(
      "is-empty-or-valid",
      "El número de teléfono no es válido",
      (value) => !value || value.trim() === "" || phoneRegex.test(value)
    ),
  message: string()
    .required("El mensaje es requerido")
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(300, "El mensaje debe tener menos de 300 caracteres"),
});
