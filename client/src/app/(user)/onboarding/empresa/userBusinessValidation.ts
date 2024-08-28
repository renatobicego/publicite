import { object, string } from "yup";

export const userBusinessValidation = object({
    name: string().required("El nombre de la empresa es requerido").min(3, "El nombre debe tener al menos 3 caracteres"),
    
})