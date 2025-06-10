import { number, object, string } from "yup";
import { postEditValidation, postValidation } from "../CreateForm/postValidation";

export const serviceValidation = object({
  
}).concat(postValidation);

export const serviceEditValidation = object({
  
}).concat(postEditValidation);