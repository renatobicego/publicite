"use server";
import { deletePostService, postPost, putPost } from "@/services/postsServices";
import { PetitionContact, Post } from "@/types/postTypes";
import { currentUser } from "@clerk/nextjs/server";

export const createPost = async (
  formData: any,
  userCanPublishPost: boolean
) => {
  if (!userCanPublishPost) {
    return { error: "Límite de anuncios activos alcanzado" };
  }
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await postPost(formData);
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

export const createContactPetition = async (formData: PetitionContact) => {
  try {
    // const resApi: any = await postPost(formData);
    // if (resApi.status !== 200 && resApi.status !== 201) {
    //   return {
    //     error:
    //       "Error al crear el anuncio. Por favor intenta de nuevo. Error: " +
    //       resApi.data.message,
    //   };
    // }
    return { message: "Petición creada exitosamente" };
  } catch (err) {
    return {
      error: "Error al crear el anuncio. Por favor intenta de nuevo.",
    };
  }
};

export const editPost = async (
  formData: any,
  id: string,
  authorUsername: string
) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  if (user.username !== authorUsername) {
    return { error: "No puedes editar este anuncio" };
  }

  try {
    const resApi: any = await putPost(formData, id);
    if (resApi.error) {
      return resApi
    }
    return { message: "Anuncio editado exitosamente", id: resApi };
  } catch (err) {
    return {
      error: "Error al editar el anuncio. Por favor intenta de nuevo.",
    };
  }
};

export const deletePost = async (
  post: Post,
) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  if (user.username !== post.author.username) {
    return { error: "No puedes borrar este anuncio" };
  }

  try {
    const resApi: any = await deletePostService(post);
    return resApi
  } catch (err) {
    return {
      error: "Error al eliminar el anuncio. Por favor intenta de nuevo.",
    };
  }
};
