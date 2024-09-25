import { object, string } from "yup";

export const magazineValidation = object({
  name: string().required("El nombre es obligatorio").min(3, "El nombre debe tener al menos 3 caracteres"),
  description: string().optional().max(100, "La descripción debe tener menos de 100 caracteres"),
});
