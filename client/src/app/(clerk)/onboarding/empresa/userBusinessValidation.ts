import { contactSchema } from "@/app/(root)/(configuracion)/Profile/SocialMedia/socialMediaValidation";
import { object, string } from "yup";

export const userBusinessValidation = object({
  businessName: string()
    .required("El nombre de la empresa es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  sector: string()
    .required("El rubro de la empresa es requerido")
    .min(8, "El rubro de la empresa es requerido"),
  contact: contactSchema,
  dni: string()
    .required("El CUIT es requerido")
    .test("dni", "El CUIT/DNI no debe incluir puntos", (value) => {
      if (!value) return false;
      return !value.includes(".");
    })
    .test("dni", "El CUIT/DNI no es válido", (value) => {
      if (!value) return false;
      const cuitRegex = /^\d{2}-\d{8}-\d$/; // CUIT format: XX-XXXXXXXX-X
      // DNI format: 7-8 digits or CUIT 10 or 11 digits
      const dniRegex = /^\d{7,11}$/;

      return (
        cuitRegex.test(value) || dniRegex.test(value.trim().replace(/-/g, ""))
      ); // Validate the CUIT/DNI format
    }),
});
