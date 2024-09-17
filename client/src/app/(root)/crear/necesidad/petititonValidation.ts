import { number, object } from "yup";
import { postValidation } from "../anuncio/components/CreateForm/postValidation";

export const petitionValidation = object({
  toPrice: number()
    .nullable() // allows toPrice to be null or undefined
    .notRequired() // makes the field optional
    .when('price', (price, schema) =>
      schema.test({
        name: 'is-greater-than-price',
        message: 'El precio final debe ser mayor al precio inicial',
        test: function(toPrice) {
          // Check if price is a valid number
          if (typeof price !== 'number') {
            return true; // No comparison if price is not a number
          }
          // Ensure toPrice is either undefined, null, or greater than price
          return toPrice === undefined || toPrice === null || toPrice > price;
        }
      })
    ),
}).concat(postValidation);
