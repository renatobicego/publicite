import { array, number, object, string } from "yup";
import { postEditValidation, postValidation } from "../anuncio/components/CreateForm/postValidation";

export const petitionValidation = object({
  toPrice: number()
    .nullable() // allows toPrice to be null or undefined
    .notRequired() // makes the field optional
    .when("price", (price, schema) =>
      schema.test({
        name: "is-greater-than-price",
        message: "El precio final debe ser mayor al precio inicial",
        test: function (toPrice) {
          // Check if price is a valid number
          const priceToCompare = Number(price[0]);
          if (typeof priceToCompare !== "number") {
            return true; // No comparison if price is not a number
          }
          // Ensure toPrice is either undefined, null, or greater than price
          return toPrice === undefined || toPrice === null || toPrice > priceToCompare;
        },
      })
    ),
  attachedFiles: array(
    object({
      url: string().required("La ubicación del archivo es requerida"),
      label: string()
        .required("La etiqueta del archivo es requerida")
        .min(2, "La etiqueta del archivo debe tener al menos 3 caracteres"),
    })
  )
    .optional() // attachedFiles can be omitted or empty
    .max(1, "Solo se permiten 1 archivo adjunto"),
  petitionType: string().required("El tipo de necesidad es requerido").min(3, "El tipo de necesidad es requerido"),
}).concat(postValidation);

export const petitionEditValidation = object({
  toPrice: number()
    .nullable() // allows toPrice to be null or undefined
    .notRequired() // makes the field optional
    .when("price", (price, schema) =>
      schema.test({
        name: "is-greater-than-price",
        message: "El precio final debe ser mayor al precio inicial",
        test: function (toPrice) {
          // Check if price is a valid number
          const priceToCompare = Number(price[0]);
          if (typeof priceToCompare !== "number") {
            return true; // No comparison if price is not a number
          }
          // Ensure toPrice is either undefined, null, or greater than price
          return toPrice === undefined || toPrice === null || toPrice > priceToCompare;
        },
      })
    ),
  attachedFiles: array(
    object({
      url: string().required("La ubicación del archivo es requerida"),
      label: string()
        .required("La etiqueta del archivo es requerida")
        .min(2, "La etiqueta del archivo debe tener al menos 3 caracteres"),
    })
  )
    .optional() // attachedFiles can be omitted or empty
    .max(1, "Solo se permiten 1 archivo adjunto"),
  petitionType: string().required("El tipo de necesidad es requerido").min(3, "El tipo de necesidad es requerido"),
}).concat(postEditValidation);