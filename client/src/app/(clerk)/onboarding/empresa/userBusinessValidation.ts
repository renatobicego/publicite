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

/**
 * Cuenta Empresa / Agente: además pide sitio web oficial, descripción, CUIT
 * (no DNI) y la explicación de impuestos. Mismas reglas que
 * `normalizeAdAgentRegistration` del server.
 */
export const userAdAgentValidation = userBusinessValidation.shape({
  description: string()
    .required("La descripción es requerida")
    .min(20, "Escribí una descripción de al menos 20 caracteres"),
  dni: string()
    .required("El CUIT es requerido")
    .test("cuit", "Ingresá un CUIT válido de 11 dígitos", (value) =>
      /^\d{11}$/.test((value ?? "").replace(/[-\s]/g, ""))
    ),
  adAgent: object({
    website: string()
      .required("El sitio web oficial es requerido")
      .matches(
        /^https?:\/\/\S+$/i,
        "El sitio web tiene que empezar con http:// o https://"
      ),
    taxCondition: string().required("Elegí tu condición frente al IVA"),
    taxNote: string()
      .required("Explicá cómo facturás y qué impuestos se suman al precio")
      .min(10, "Explicá cómo facturás y qué impuestos se suman al precio")
      .max(1000, "Hasta 1000 caracteres"),
  }),
});
