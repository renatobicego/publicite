"use server";
import {
  Good,
  GoodPostValues,
  PetitionPostValues,
  Post,
  ServicePostValues,
} from "@/types/postTypes";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import {
  deletePostMutation,
  editPostMutation,
  getPostByIdQuery,
  getPostCategories,
  getPostsQuery,
  postPostMutation,
} from "@/graphql/postQueries";
import { auth } from "@clerk/nextjs/server";
import { deleteFilesService } from "@/app/server/uploadThing";

export const getPostData = async (id: string) => {
  try {
    const { data } = await query({
      query: getPostByIdQuery,
      variables: { findPostByIdId: id },
      context: {
        fetchOptions: {
          cache: "no-cache"
        },
      },
    });

    return data.findPostById;
  } catch (error) {
    return {
      error:
        "Error al traer los datos de los sectores de negocios. Por favor intenta de nuevo.",
    };
  }
};

export const getCategories = async () => {
  try {
    const { data } = await query({
      query: getPostCategories,
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return data.getAllCategoryPost;
  } catch (error) {
    return {
      error:
        "Error al traer las categorías de anuncios. Por favor intenta de nuevo.",
    };
  }
};

export const postPost = async (
  values: GoodPostValues | PetitionPostValues | ServicePostValues
) => {
  const authorId = auth().sessionClaims?.metadata.mongoId;
  try {
    const { data } = await getClient().mutate({
      mutation: postPostMutation,
      variables: { postRequest: values, author_id: authorId },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return data.createPost._id;
  } catch (error) {
    throw error;
  }
};

export const putPost = async (
  values: GoodPostValues | PetitionPostValues | ServicePostValues,
  id: string
) => {
  const authorId = auth().sessionClaims?.metadata.mongoId;

  try {
    const { data } = await getClient().mutate({
      mutation: editPostMutation,
      variables: { updatePostByIdId: id, postUpdate: values, authorId },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return data.updatePostById;
  } catch (error) {
    console.log(error);
    return {
      error: "Error al editar el anuncios. Por favor intenta de nuevo.",
    };
  }
};

export const getPosts = async (
  searchTerm: string | null,
  page: number,
  postType: PostType,
  limit: number | undefined = 20
) => {
  try {
    const { data } = await query({
      query: getPostsQuery,
      variables: {
        postType,
        limit,
        page,
        searchTerm: searchTerm ? searchTerm : "",
      },
    });
    return {
      items: data.findAllPostByPostType.posts,
      hasMore: data.findAllPostByPostType.hasMore,
    }; // Return the same mocked data
  } catch (error) {
    console.log(error);
    return {
      error: "Error al traer los anuncios. Por favor intenta de nuevo.",
    };
  }
};

export const getGoods = async (searchTerm: string | null, page: number) => {
  return await getPosts(searchTerm, page, "good");
};

export const getServices = async (searchTerm: string | null, page: number) => {
  return await getPosts(searchTerm, page, "service");
};

export const getPetitions = async (searchTerm: string | null, page: number) => {
  return await getPosts(searchTerm, page, "petition");
};

export const deletePostService = async (post: Post) => {
  try {
    await getClient().mutate({
      mutation: deletePostMutation,
      variables: {
        deletePostByIdId: post._id,
        authorId: auth().sessionClaims?.metadata.mongoId,
      },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    await deleteFilesService(post.attachedFiles.map((file) => file.url));
    if (
      "imagesUrls" in post &&
      post.imagesUrls &&
      (post as Good).imagesUrls.length > 0
    ) {
      await deleteFilesService((post as Good).imagesUrls);
    }
    return { message: "Anuncio borrado exitosamente" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al eliminar el anuncio. Por favor intenta de nuevo.",
    };
  }
};
