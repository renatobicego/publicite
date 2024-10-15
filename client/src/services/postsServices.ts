"use server"
import { GoodPostValues, PetitionPostValues, ServicePostValues } from "@/types/postTypes";
import { mockedPetitions, mockedPosts } from "../utils/data/mockedData";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import { editPostMutation, getPostByIdQuery, getPostCategories } from "@/graphql/postQueries";

export const getPostData = async (id: string) => {
  try {
    const {data} = await query({
      query: getPostByIdQuery,
      variables: {findPostByIdId: id},
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
    const {data} = await query({
      query: getPostCategories
    })
    return data.getAllCategoryPost;
  } catch (error) {
    return {
      error: "Error al traer las categorías de anuncios. Por favor intenta de nuevo.",
    };
  }
};

export const postPost = async (values: GoodPostValues | PetitionPostValues | ServicePostValues) => {
  try {
    const res = await axios.post(`${process.env.API_URL}/post`, values);
    return res
  } catch (error) {
    return error
  }
}


export const putPost = async (values: GoodPostValues | PetitionPostValues | ServicePostValues, id: string) => {
  try {
    const {data} = await getClient().mutate({
      mutation: editPostMutation,
      variables: {updatePostByIdId: id, postUpdate: values}
    })
    return data.updatePostById;
  } catch (error) {
    return {
      error: "Error al editar el anuncios. Por favor intenta de nuevo.",
    };
  }
}

export const getGoods = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {items: [mockedPosts[0], mockedPosts[0], mockedPosts[0], mockedPosts[0]]}; // Return the same mocked data
  } catch (error) {
    return {
      error: "Error al traer los anuncios. Por favor intenta de nuevo.",
    };
  }
}

export const getServices = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { items: [mockedPosts[1], mockedPosts[1], mockedPosts[1], mockedPosts[1]] }; // Return the same mocked data
  } catch (error) {
    return {
      error: "Error al traer los anuncios. Por favor intenta de nuevo.",
    };
  }
}

export const getPetitions = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { items: mockedPetitions } // Return the same mocked data
  } catch (error) {
    return {
      error: "Error al traer los anuncios. Por favor intenta de nuevo.",
    };
  }
}
