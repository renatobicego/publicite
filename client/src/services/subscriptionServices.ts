import axios from "axios";

export const processPayment = async (
  formData: any,
  subscriptionPlan: any,
  userId: string
) => {
  const { data, status } = await axios.post("/api/subscriptions/process_payment", {
    formData,
    subscriptionPlan,
    userId,
  });

  // if(status !== 200 && status !== 201){
  //   console.log(data);
  // }

  // console.log(data)

  return data;
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
  formData: any
) => {
  try {
    const { data } = await axios.put("/api/subscriptions/update", {
      formData,
      subscriptionId,
    });
  } catch (error) {
    console.log(error);
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
  const res = await fetch(process.env.API_URL + "/subscriptionplans", { next: { revalidate: 180 } });
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
  const res = await fetch(process.env.API_URL + "/subscription/" + userId);
  if (!res.ok) {
    return {
      error:
        "Error al traer los datos de suscripciones. Por favor intenta de nuevo.",
    };
  }
  const data = await res.json();
  return data;
};

export const getSubscriptionPlanById = async (id: string) => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval_plan/" + id,
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
