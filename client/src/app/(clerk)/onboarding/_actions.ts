"use server";

import { postUserBusiness } from "@/services/businessServices";
import { postUserPerson } from "@/services/userServices";
import {  UserBusinessFormValues, UserPersonFormValues } from "@/types/userTypes";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAxiosError } from "axios";

const getServerMessage = (err: unknown): string | null => {
  if (!isAxiosError(err)) return null;
  // El filtro global del server (AllExceptionsFilter) manda en `message` lo que
  // devuelve `getResponse()` de la excepción: para un BadRequestException es un
  // objeto `{ message, error, statusCode }`, no el texto.
  let message = err.response?.data?.message;
  if (message && typeof message === "object" && !Array.isArray(message)) {
    message = message.message;
  }
  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" && message ? message : null;
};

export const completeOnboardingPerson = async (formData: UserPersonFormValues) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi = await postUserPerson(formData)
    if(resApi.status !== 200 && resApi.status !== 201){
      return { error: "Error al completar el registro. Por favor intenta de nuevo. Error: " + resApi.data.message }
    }
    const res = await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        userType: "Person",
        mongoId: resApi.data
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    // Si el server rechazó el alta (p. ej. el DNI no se pudo verificar con
    // RENAPER), se muestra su motivo.
    const serverMessage = getServerMessage(err);
    if (serverMessage) return { error: serverMessage };
    console.log(err)
    return { error: "Error al completar el registro. Por favor intenta de nuevo." };
  }
};

export const completeOnboardingBusiness = async (formData: UserBusinessFormValues) => {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi = await postUserBusiness(formData)
    if(resApi.status !== 200 && resApi.status !== 201){
      return { error: "Error al completar el registro. Por favor intenta de nuevo. Error: " + resApi.data.message }
    }
    const res = await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        userType: "Business",
        // Cuenta Empresa / Agente: publica espacios publicitarios.
        ...(formData.adAgent && { isAdAgent: true }),
        mongoId: resApi.data
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    // El server explica qué falta en el alta de un agente (web, CUIT…).
    const serverMessage = getServerMessage(err);
    if (serverMessage) return { error: serverMessage };
    return { error: "Error al completar el registro. Por favor intenta de nuevo." };
  }
}