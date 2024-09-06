import { contactSchema } from "@/app/(root)/configuracion/[[...configuracion]]/Profile/SocialMedia/socialMediaValidation";
import { object, string } from "yup";

export const userBusinessValidation = object({
    businessName: string().required("El nombre de la empresa es requerido").min(3, "El nombre debe tener al menos 3 caracteres"),
    businessSector: string().required("El rubro de la empresa es requerido").min(8, "El rubro de la empresa es requerido"),
    contact: contactSchema
})