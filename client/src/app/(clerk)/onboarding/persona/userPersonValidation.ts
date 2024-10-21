import { contactSchema } from "@/app/(root)/(configuracion)/Profile/SocialMedia/socialMediaValidation";
import { object, string } from "yup";

export const userPersonValidation = object({
    gender: string().required("El genero es requerido").min(1, "El genero es requerido"),
    birthDate: string().required("La fecha de nacimiento es requerida").min(6, "La fecha de nacimiento es requerida"),
    countryRegion: string().required("El pais y la región es requerida").min(3, "El pais y la región es requerida"),
    contact: contactSchema
})