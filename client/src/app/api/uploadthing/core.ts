import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  fileUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 3 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const user = await auth();

      // Throw if user isn't signed in
      if (!user)
        throw new UploadThingError(
          "You must be logged in to upload a profile picture"
        );

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.sessionClaims?.metadata.mongoId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
  uploadSingleFile: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  }) // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const user = await auth();

      // Throw if user isn't signed in
      if (!user)
        throw new UploadThingError(
          "You must be logged in to upload a profile picture"
        );

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.sessionClaims?.metadata.mongoId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
  // Archivos de un blog de Mis Producciones: además de imagen/video/audio/PDF
  // acepta documentos de Office y OpenDocument. El cliente sube de a un archivo
  // por llamada (ver `ProductionStaffToolbar`), así que `maxFileCount` no limita
  // cuántos se pueden elegir a la vez.
  productionFileUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.ms-excel": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.ms-powerpoint": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.oasis.opendocument.text": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.oasis.opendocument.presentation": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await auth();

      if (!user.userId)
        throw new UploadThingError(
          "Tenés que iniciar sesión para subir archivos"
        );

      return { userId: user.sessionClaims?.metadata.mongoId };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
