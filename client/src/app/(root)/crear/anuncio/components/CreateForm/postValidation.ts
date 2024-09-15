import { array, number, object, string } from "yup";

export const postValidation = object({
  title: string()
    .required("El título es requerido")
    .min(3, "El título debe tener al menos 3 caracteres"),
  description: string()
    .required("La descripción es requerida")
    .min(3, "La descripción debe tener al menos 3 caracteres"),
  category: string()
    .required("La categoria es requerida")
    .min(3, "La categoria es requerida"),
  price: string()
    .required("El precio es requerido")
    .min(1, "El precio debe ser mayor a 1")
    .max(200000000, "El precio debe ser menor a 200.000.000"),
  condition: string().required("La condición es requerida"),
  location: object({
    lat: number().required("La ubicación es requerida"),
    lng: number().required("La ubicación es requerida"),
  }),
  attachedFiles: array(
    object({
      url: string().required("La ubicación del archivo es requerida"),
      label: string().required("La etiqueta del archivo es requerida").min(3, "La etiqueta del archivo debe tener al menos 3 caracteres"),
    })
  )
    .optional() // attachedFiles can be omitted or empty
    .max(3, "Solo se permiten 3 archivos adjuntos"),
});