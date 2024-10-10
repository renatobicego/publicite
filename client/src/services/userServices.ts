"use server";
import {
  EditPersonProfileProps,
  UserPersonFormValues,
  UserPreferences,
} from "@/types/userTypes";
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { query } from "@/lib/client";
import getUserByUsernameQuery from "@/graphql/userQueries";
import { cookies } from "next/headers";

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

    return await res.json();
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
    console.log(error);
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
    return await res.json();
  } catch (error) {
    return {
      error: "Error al traer las preferencias. Por favor intenta de nuevo.",
    };
  }
};

export const getUsers = async (searchTerm: string | null) => {
  try {
    console.log(searchTerm)
    const res = await fetch(`${process.env.API_URL}/user?user=${searchTerm ? searchTerm : ''}&limit=20`, {
      headers: {
        Cookie: cookies().toString(),
      }
    });
    const data = await res.json();
    return {items: data.user, hasMore: data.hasMore};
  } catch (error) {
    return {
      error: "Error al traer las preferencias. Por favor intenta de nuevo.",
    };
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const { data } = await query({
      query: getUserByUsernameQuery,
      variables: { username },
    });

    return data.findOneByUsername
  } catch (error) {
    return {
      error:
        "Error al traer los datos del usuario. Por favor intenta de nuevo.",
    };
  }
};
