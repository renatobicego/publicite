import { object, string } from "yup";

export const userPersonValidation = object({
    name: string().required("El nombre es requerido").min(3, "El nombre debe tener al menos 3 caracteres"),
    lastname: string().required("El apellido es requerido").min(3, "El apellido debe tener al menos 3 caracteres"),
    gender: string().required("El genero es requerido"),
    birthDate: string().required("La fecha de nacimiento es requerida"),
    countryRegion: string().required("El pais y la región es requerida"),

})