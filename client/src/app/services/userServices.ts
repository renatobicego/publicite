"use server";
import {
  EditPersonProfileProps,
  UserPersonFormValues,
  UserPreferences,
} from "@/types/userTypes";
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { mockedUsers } from "../utils/data/mockedData";

const baseUrl = `${process.env.API_URL}/user/personal`;

export const postUserPerson = async (formData: UserPersonFormValues) => {
  return await axios.post(`${baseUrl}`, formData);
};

export const putUserProfileData = async (
  formData: EditPersonProfileProps,
  username: string
) => {
  return await axios.put(`${baseUrl}/${username}`, formData);
};

export const getUserProfileData = async (username: string) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user/personal-data/${username}`
    );

    return res.json();
  } catch (error) {
    return {
      error:
        "Error al traer los datos personales del usuario. Por favor intenta de nuevo.",
    };
  }
};

export const changeUserPreferences = async (
  userPreferences: UserPreferences
) => {
  const user = await currentUser();
  try {
    const { data, status } = await axios.put(
      `${process.env.API_URL}/user/user-preferences/${user?.username}`,
      userPreferences
    );
    if (status !== 200 && status !== 201) {
      return {
        error: "Error al cambiar las preferencias. Por favor intenta de nuevo.",
      };
    }
    return data;
  } catch (error) {
    console.log(error)
    return {
      error: "Error al cambiar las preferencias. Por favor intenta de nuevo.",
    };
  }
};

export const getUserPreferences = async (username: string) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user/preferences/${username}`
    );
    return res.json();
  } catch (error) {
    return {
      error: "Error al traer las preferencias. Por favor intenta de nuevo.",
    };
  }
};



export const getUsers = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockedUsers
  } catch (error) {
    return {
      error: "Error al traer las preferencias. Por favor intenta de nuevo.",
    };
  }
};
