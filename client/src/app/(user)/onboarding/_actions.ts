"use server";

import { postUserBusiness } from "@/app/services/businessServices";
import { postUserPerson } from "@/app/services/userServices";
import {  UserBusinessFormValues, UserPersonFormValues } from "@/types/userTypes";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const completeOnboardingPerson = async (formData: UserPersonFormValues) => {
  const { userId } = auth();

  if (!userId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi = await postUserPerson(formData)
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

export const completeOnboardingBusiness = async (formData: UserBusinessFormValues) => {
  const { userId } = auth();
  if (!userId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi = await postUserBusiness(formData)
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
}