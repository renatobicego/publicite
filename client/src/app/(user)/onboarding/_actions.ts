"use server";

import { UserBusinessFormValues, UserPersonFormValues } from "@/types/userTypes";
import { auth, clerkClient } from "@clerk/nextjs/server";
import axios, { AxiosResponse } from "axios";

export const completeOnboardingPerson = async (formData: UserPersonFormValues) => {
  const { userId } = auth();

  if (!userId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {

    const resApi = await axios.post(`${process.env.API_URL}/user/personal`, formData)
    if(resApi.status !== 200 && resApi.status !== 201){
      return { error: "Error al completar el registro. Por favor intenta de nuevo. Error: " + resApi.data.message }
    }
    const res = await clerkClient().users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    console.log(err)
    return { error: "Error al completar el registro. Por favor intenta de nuevo." };
  }
};