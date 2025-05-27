import { array, number, object, string } from "yup";

export const postValidation = object({
  title: string()
    .required("El título es requerido")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "El título debe tener menos de 120 caracteres"),
  description: string()
    .optional()
    .max(2000, "La descripción debe tener menos de 2000 caracteres"),
  category: string()
    .required("La categoria es requerida")
    .min(3, "La categoria es requerida"),
  price: number()
    .required("El precio es requerido")
    .min(1, "El precio debe ser mayor a 1")
    .max(200000000, "El precio debe ser menor a 200.000.000"),
  geoLocation: object({
    lat: number().required("La ubicación es requerida"),
    lng: number().required("La ubicación es requerida"),
    description: string()
      .required("La ubicación es requerida")
      .min(1, "La ubicación es requerida"),
    ratio: number().required("El radio de alcance es requerido"),
  }),
  attachedFiles: array(
    object({
      url: string().required("La ubicación del archivo es requerida"),
      label: string()
        .required("La etiqueta del archivo es requerida")
        .min(3, "La etiqueta del archivo debe tener al menos 3 caracteres"),
    })
  )
    .optional() // attachedFiles can be omitted or empty
    .max(3, "Solo se permiten 3 archivos adjuntos"),
});

export const postEditValidation = object({
  title: string()
    .required("El título es requerido")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "El título debe tener menos de 120 caracteres"),
  description: string()
    .optional()
    .max(2000, "La descripción debe tener menos de 2000 caracteres"),
  category: string()
    .required("La categoria es requerida")
    .min(3, "La categoria es requerida"),
  price: string()
    .required("El precio es requerido")
    .min(1, "El precio debe ser mayor a 1")
    .max(200000000, "El precio debe ser menor a 200.000.000"),
  attachedFiles: array(
    object({
      url: string().required("La ubicación del archivo es requerida"),
      label: string()
        .required("La etiqueta del archivo es requerida")
        .min(3, "La etiqueta del archivo debe tener al menos 3 caracteres"),
    })
  )
    .optional() // attachedFiles can be omitted or empty
    .max(3, "Solo se permiten 3 archivos adjuntos"),
});
