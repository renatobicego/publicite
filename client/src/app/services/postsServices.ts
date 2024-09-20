import { GoodPostValues, PetitionPostValues, ServicePostValues } from "@/types/postTypes";
import { mockedPetitions, mockedPosts } from "../utils/data/mockedData";
import axios from "axios";

export const getPostData = async (id: string) => {
  try {
    // const res = await fetch(`${process.env.API_URL}/businessSector`);

    // return res.json();

    // return mockedPetitions[0];
    return mockedPosts[0];
  } catch (error) {
    return {
      error:
        "Error al traer los datos de los sectores de negocios. Por favor intenta de nuevo.",
    };
  }
};

export const getCategories = async () => {
  try {
    return [
      {
        _id: "66e660c0670176213da68f22",
        label: "Casa",
      },
      {
        _id: "112egsdq",
        label: "Departamento",
      },
      {
        _id: "112qsdqsf",
        label: "Oficina",
      },
    ];
  } catch (error) {
    return {
      error: "Error al traer las categorías. Por favor intenta de nuevo.",
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
