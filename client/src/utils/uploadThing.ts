// import { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";

// see Uplaod Thing docs for more info
export const { useUploadThing } = generateReactHelpers<any>();
export const UploadButton = generateUploadButton<any>();
export const UploadDropzone = generateUploadDropzone<any>();
