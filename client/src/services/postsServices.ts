"use server";
import {
  Good,
  GoodPostValues,
  PetitionPostValues,
  Post,
  ServicePostValues,
} from "@/types/postTypes";
import { getClient, query } from "@/lib/client";
import {
  deletePostMutation,
  editPostMutation,
  getPostByIdQuery,
  getPostCategories,
  getPostsOfFriendsQuery,
  getPostsQuery,
  postPostMutation,
  updateEndDtaeMutation,
} from "@/graphql/postQueries";
import { auth } from "@clerk/nextjs/server";
import { deleteFilesService } from "@/app/server/uploadThing";
import { Coordinates } from "@/app/(root)/providers/LocationProvider";
import { ApolloError, ServerError } from "@apollo/client";
import { handleApolloError } from "@/utils/functions/errorHandler";

export const getPostData = async (id: string) => {
  try {
    const { data } = await query({
      query: getPostByIdQuery,
      variables: { findPostByIdId: id },
      context: {
        fetchOptions: {
          cache: "no-cache",
        },
      },
    });

    return data.findPostById;
  } catch (error: ApolloError | any) {
    return handleApolloError(error);
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
      variables: { postRequest: values, authorId },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return data.createPost._id;
  } catch (error) {
    console.log(error);
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
  coordinates: Coordinates | null,
  limit: number | undefined = 20
) => {
  try {
    if (!coordinates) {
      return {
        error: "Error al traer los anuncios. Por favor intenta de nuevo.",
      };
    }
    console.log({
      postType,
      limit,
      page,
      searchTerm: searchTerm ? searchTerm : "",
      userLocation: coordinates,
    });
    const { data } = await query({
      query: getPostsQuery,
      variables: {
        postType,
        limit,
        page,
        searchTerm: searchTerm ? searchTerm : "",
        userLocation: coordinates,
      },
    });
    return {
      items: data.findAllPostByPostType.posts,
      hasMore: data.findAllPostByPostType.hasMore,
    }; // Return the same mocked data
  } catch (error) {
    console.log("getPosts", error);
    return {
      error: "Error al traer los anuncios. Por favor intenta de nuevo.",
    };
  }
};

export const getPostsOfContacts = async (
  searchTerm: string | null,
  page: number,
  postType: PostType,
  limit: number | undefined = 20
) => {
  try {
    const { data } = await query({
      query: getPostsOfFriendsQuery,
      variables: {
        postType,
        limit,
        page,
        searchTerm: searchTerm ? searchTerm : "",
      },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return {
      items: data.findFriendPosts.posts,
      hasMore: data.findFriendPosts.hasMore,
    }; // Return the same mocked data
  } catch (error) {
    console.log("getPosts", error);
    return {
      error:
        "Error al traer los anuncios de tus contactos. Por favor intenta de nuevo.",
    };
  }
};

export const getGoods = async (
  searchTerm: string | null,
  page: number,
  coordinates: Coordinates | null
) => {
  return await getPosts(searchTerm, page, "good", coordinates);
};

export const getServices = async (
  searchTerm: string | null,
  page: number,
  coordinates: Coordinates | null
) => {
  return await getPosts(searchTerm, page, "service", coordinates);
};

export const getPetitions = async (
  searchTerm: string | null,
  page: number,
  coordinates: Coordinates | null
) => {
  return await getPosts(searchTerm, page, "petition", coordinates);
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

export const putEndDate = async (postId: string, endDate: string) => {
  try {
    await getClient().mutate({
      mutation: updateEndDtaeMutation,
      variables: { postId },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return {
      message: "Anuncio renovado exitosamente",
    };
  } catch (error) {
    return handleApolloError(error);
  }
};
