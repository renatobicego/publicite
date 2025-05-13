"use server";
import {
  BusinessSector,
  EditBusinessProfileProps,
  UserBusinessFormValues,
} from "@/types/userTypes";
import axios from "axios";
import { getAuthToken } from "./auth-token";

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
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    }
  );
};

export const getBusinessSector = async () => {
  try {
    const res = await fetch(`${process.env.API_URL}/businessSector`);

    const businessSector: BusinessSector[] = await res.json();
    //order by name
    return businessSector.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    return {
      error:
        "Error al traer los datos de los sectores de negocios. Por favor intenta de nuevo.",
    };
  }
};
