import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadThing/core";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
