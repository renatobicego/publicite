import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { OurFileRouter } from "../app/api/uploadThing/core";
import { generateReactHelpers } from "@uploadthing/react";

// see Uplaod Thing docs for more info
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
