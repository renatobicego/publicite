"use server";
import { getPaymentsQuery } from "@/graphql/suscriptionsQueries";
import { query } from "@/lib/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import axios from "axios";

export const processPayment = async (
  formData: any,
  subscriptionPlan: any,
  userId: string
) => {
  try {
    const { data, status } = await axios.post(
      process.env.CLIENT_URL + "/api/subscriptions/process_payment",
      {
        formData,
        subscriptionPlan,
        userId,
      }
    );
  
    // if(status !== 200 && status !== 201){
    //   console.log(data);
    // }
  
    // console.log(data)
  
    return data;
    
  } catch (error) {
    console.log("error", error)
  }
};

export const editPayment = async (formData: any, subscription: any) => {
  const { data } = await axios.put("/api/subscriptions/process_payment", {
    formData,
    subscription,
  });
  return data;
};

export const editSubscription = async (
  subscriptionId: string,
  formData: {
    status: "authorized" | "paused" | "cancelled" | "pending";
  }
) => {
  try {
    await axios.put("/api/subscriptions/update", {
      formData,
      subscriptionId,
    });
    return {
      message: "Suscripción actualizada exitosamente.",
    }
  } catch (error) {
    return {
      error: "Error al actualizar la suscripción. Por favor intenta de nuevo.",
    }
  }
};

export const getSubscriptionsPlansMP = async () => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval_plan/search?status=active",
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getSubscriptionsPlans = async () => {
  const res = await fetch(process.env.API_URL + "/subscriptionplans", {
    next: { revalidate: 180 },
    headers: {
      Authorization: `${await auth().getToken({ template: "testing" })}`,
    }
  });
  if (!res.ok) {
    return {
      error:
        "Error al traer los datos de los planes de suscripción. Por favor intenta de nuevo.",
    };
  }
  const data = await res.json();
  return data;
};

export const getSubscriptionsOfUser = async (userId: string) => {
  try {
    const res = await fetch(process.env.API_URL + "/subscription/" + userId);
    if (!res.ok) {
      return {
        error:
          "Error al traer los datos de suscripciones. Por favor intenta de nuevo.",
      };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserActivePostNumber = async (userId: string) => {
  // const res = await fetch(process.env.API_URL + "/subscription/" + userId);
  // if (!res.ok) {
  //   return {
  //     error:
  //       "Error al traer los datos de suscripciones. Por favor intenta de nuevo.",
  //   };
  // }
  // const data = await res.json();
  // return data;

  return 3;
};

export const getSubscriptionPlanById = async (id: string) => {
  try {
    const { data, status } = await axios.get(
      "https://api.mercadopago.com/preapproval_plan/" + id,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    if(status !== 200 && status !== 201){
      return {
        error:
          "Error al traer los datos del plan de suscripción. Por favor intenta de nuevo.",
      }
    }
    return data;
  } catch (error) {
    return {
      error:
        "Error al traer los datos del plan de suscripción. Por favor intenta de nuevo.",
    }
  }
};

export const getSubscriptionById = async (id: string) => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval/" + id,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getSubscriptionByEmail = async (email: string) => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval/search?status=authorized&status=paused&payer_email=" +
        email,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAuthorizedPayments = async (subscriptionId: string) => {
  // 30e07c11113748ad82e79f90ab91484f
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/authorized_payments/search?preapproval_id=" +
        subscriptionId,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getPaymentMethod = async () => {
  const user = await currentUser();
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&external_reference=" +
        // user?.id,
        "user_2mqEcO17ANFiFguUEwmrfPtU6wa",
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getPayments = async () => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }
  try {
    const { data } = await query({
      query: getPaymentsQuery,
      variables: { findPaymentByClerkIdId: user.userId },
    });
    return data.findPaymentByClerkId;
  } catch (error) {
    return {
      error: "Error al traer los pagos. Por favor intenta de nuevo.",
    }
  }
};
