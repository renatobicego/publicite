"use server";
import { UTApi } from "uploadthing/server";
const utapi = new UTApi();
export const deleteFilesService = async (files: string[]) => {
    try {
        await utapi.deleteFiles(files);
    } catch (error) {
        throw error
    }
  };
  