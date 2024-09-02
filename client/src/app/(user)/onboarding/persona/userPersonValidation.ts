import { object, string } from "yup";

export const userPersonValidation = object({
    gender: string().required("El genero es requerido"),
    birthDate: string().required("La fecha de nacimiento es requerida"),
    countryRegion: string().required("El pais y la región es requerida"),

})