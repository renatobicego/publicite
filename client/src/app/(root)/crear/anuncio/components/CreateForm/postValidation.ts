import { number, object, string } from "yup";

export const postValidation = object({
    title: string().required("El título es requerido").min(3, "El título debe tener al menos 3 caracteres"),
    description: string().required("La descripción es requerida").min(3, "La descripción debe tener al menos 3 caracteres"),
    category: string().required("La categoria es requerida").min(3, "La categoria es requerida"),
    price: string().required("El precio es requerido").min(1, "El precio debe ser mayor a 1").max(200000000, "El precio debe ser menor a 200.000.000"),
    condition: string().required("La condición es requerida"),
    location: object({
        latitude: number().required("La ubicación es requerida"),
        longitude: number().required("La ubicación es requerida")
    }),
    
})