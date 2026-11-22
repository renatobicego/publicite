import { mixed, object } from "yup";
import { AdSpaceData } from "@/types/postTypes";
import { validateAdSpace } from "@/utils/data/adSpaces";
import {
  postEditValidation,
  postValidation,
} from "../CreateForm/postValidation";

const adSpaceField = mixed<AdSpaceData>().test(
  "adSpace",
  "Completá los datos del espacio publicitario",
  function (value) {
    const error = validateAdSpace(value as AdSpaceData);
    return error ? this.createError({ message: error }) : true;
  }
);

export const adSpaceValidation = object({ adSpace: adSpaceField }).concat(
  postValidation
);

export const adSpaceEditValidation = object({ adSpace: adSpaceField }).concat(
  postEditValidation
);
