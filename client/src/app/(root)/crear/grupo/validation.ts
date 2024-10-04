import { array, number, object, string } from "yup";

export const groupValidation = object({
  name: string()
    .required("El nombre del grupo es requerido")
    .min(2, "El nombre del grupo debe tener al menos 2 caracteres"),
  members: array(string())
    .required("Los miembros son obligatorios")
    .min(1, "Agregue al menos un miembro"),
  details: string()
    .optional()
    .max(200, "La descripción debe tener menos de 200 caracteres"),
  rules: string()
    .optional()
    .max(300, "Las reglas del grupo deben tener menos de 300 caracteres"),
});
