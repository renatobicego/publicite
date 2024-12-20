"use server";
import {
  EditBusinessProfileProps,
  UserBusinessFormValues,
} from "@/types/userTypes";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const postUserBusiness = async (formData: UserBusinessFormValues) => {
  return await axios.post(`${process.env.API_URL}/user/business`, formData);
};

export const putBusinessProfileData = async (
  formData: EditBusinessProfileProps,
  username: string
) => {
  return await axios.put(
    `${process.env.API_URL}/user/business/${username}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${await auth().getToken({ template: "testing" })}`,
      },
    }
  );
};

export const getBusinessSector = async () => {
  try {
    const res = await fetch(`${process.env.API_URL}/businessSector`);

    return await res.json();
  } catch (error) {
    return {
      error:
        "Error al traer los datos de los sectores de negocios. Por favor intenta de nuevo.",
    };
  }
};
