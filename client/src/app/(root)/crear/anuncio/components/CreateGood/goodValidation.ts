import { number, object, string } from "yup";
import { postEditValidation, postValidation } from "../CreateForm/postValidation";
import { getLocalTimeZone, today } from "@internationalized/date";

export const goodValidation = object({
  condition: string().required("La condición es requerida"),
  year: number()
    .nullable()
    .notRequired()
    .min(1800, "El año debe ser posterior a 1800")
    .max(
      today(getLocalTimeZone()).year,
      "El año debe ser igual o anterior al actual"
    ),
  modelType: string()
    .nullable()
    .notRequired()
    .max(80, "El modelo no puede ser mayor a 80 caracteres")
    .test(
      "is-empty-or-valid",
      "El año no es válido",
      (value) => !value || value.length <= 80 || value.trim() === ""
    ),
  brand: string()
    .nullable()
    .notRequired()
    .max(40, "La marca no puede ser mayor a 40 caracteres")
    .test(
      "is-empty-or-valid",
      "El año no es válido",
      (value) => !value || value.length <= 40 || value.trim() === ""
    ),
}).concat(postValidation);

export const goodEditValidation = object({
  condition: string().required("La condición es requerida"),
  year: number()
    .nullable()
    .notRequired()
    .min(1800, "El año debe ser posterior a 1800")
    .max(
      today(getLocalTimeZone()).year,
      "El año debe ser igual o anterior al actual"
    ),
  modelType: string()
    .nullable()
    .notRequired()
    .max(80, "El modelo no puede ser mayor a 80 caracteres")
    .test(
      "is-empty-or-valid",
      "El año no es válido",
      (value) => !value || value.length <= 80 || value.trim() === ""
    ),
  brand: string()
    .nullable()
    .notRequired()
    .max(40, "La marca no puede ser mayor a 40 caracteres")
    .test(
      "is-empty-or-valid",
      "El año no es válido",
      (value) => !value || value.length <= 40 || value.trim() === ""
    ),
}).concat(postEditValidation);
