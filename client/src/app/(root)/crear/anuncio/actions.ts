"use server"
import { postPost } from "@/app/services/postsServices";
import { GoodPostValues, PetitionPostValues, ServicePostValues } from "@/types/postTypes";
import { currentUser } from "@clerk/nextjs/server";

export const createPost = async (
    formData: any,
  ) => {
    const user = await currentUser();
  
    if (!user?.username) {
      return { error: "Usuario no autenticado. Por favor inicie sesión." };
    }
  
    try {
        const resApi: any = await postPost(formData);
        console.log(resApi)
        if (resApi.status !== 200 && resApi.status !== 201) {
          return {
            error:
              "Error al crear el anuncio. Por favor intenta de nuevo. Error: " +
              resApi.data.message,
          };
        }
        return { message: "Anuncio creado exitosamente", id: resApi.data._id };
    } catch (err) {
      return {
        error: "Error al crear el anuncio. Por favor intenta de nuevo.",
      };
    }
  };