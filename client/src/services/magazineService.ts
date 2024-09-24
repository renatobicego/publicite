import { mockedCompleteMagazine } from "@/utils/data/mockedData";

export const getMagazineById = async (id: string) => {
    try {
      // const res = await fetch(`${process.env.API_URL}/businessSector`);
  
      // return res.json();
  
      return mockedCompleteMagazine;
      // return mockedPosts[0];
    } catch (error) {
      return {
        error:
          "Error al traer los datos de la revista. Por favor intenta de nuevo.",
      };
    }
  };