import { mockedPosts } from "../utils/mockedData";

export const getPostData = async (id: string) => {
  try {

    // const res = await fetch(`${process.env.API_URL}/businessSector`);

    // return res.json();

    return mockedPosts[0]
  } catch (error) {
    return {
      error:
        "Error al traer los datos de los sectores de negocios. Por favor intenta de nuevo.",
    };
  }
};
