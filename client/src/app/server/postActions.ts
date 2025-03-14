"use server";
import {
  deletePostReaction,
  deletePostService,
  postPost,
  putActiveStatus,
  putEndDate,
  putPost,
  putPostBehavior,
} from "@/services/postsServices";
import { Post, PostBehaviourType } from "@/types/postTypes";

export const createPost = async (
  formData: any,
  userCanPublishPost: boolean
) => {
  if (!userCanPublishPost) {
    return { error: "Límite de anuncios activos alcanzado" };
  }

  try {
    const resApi: string = await postPost({
      ...formData,
      endDate: new Date(formData.endDate),
    });
    return { message: "Anuncio creado exitosamente", id: resApi };
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
  try {
    const resApi: any = await putPost(
      { ...formData, endDate: new Date(formData.endDate) },
      id
    );
    if (resApi.error) {
      return resApi;
    }
    return { message: "Anuncio editado exitosamente", id: resApi };
  } catch (err) {
    return {
      error: "Error al editar el anuncio. Por favor intenta de nuevo.",
    };
  }
};

export const deletePost = async (post: Post) => {
  try {
    const resApi: any = await deletePostService(post);
    return resApi;
  } catch (err) {
    return {
      error: "Error al eliminar el anuncio. Por favor intenta de nuevo.",
    };
  }
};

export const updateEndDate = async (postId: string, endDate: string) => {
  const resApi: { message: string } | { error: string } = await putEndDate(
    postId,
    endDate
  );
  return resApi;
};

export const removePostReaction = async (postReactionId: string) => {
  const resApi: { message: string } | { error: string } =
    await deletePostReaction(postReactionId);
  return resApi;
};

export const updatePostBehaviour = async (
  postId: string,
  behaviourType: PostBehaviourType,
  authorId: ObjectId,
  visibility: {
    post: Visibility;
    socialMedia: Visibility;
  }
) => {
  const resApi: { message: string } | { error: string } = await putPostBehavior(
    postId,
    behaviourType,
    authorId,
    visibility
  );
  return resApi;
};

export const updatePostActiveStatus = async (
  postId: ObjectId,
  authorId: ObjectId,
  postBehaviourType: PostBehaviourType,
  activate: boolean
) => {
  const resApi: { message: string } | { error: string } = await putActiveStatus(
    postId,
    authorId,
    postBehaviourType,
    activate
  );
  return resApi;
};
