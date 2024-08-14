import axios from "axios";

export const processPayment = async (formData: any, subscriptionPlan: any) => {
  try {
    const { data } = await axios.post("/api/process_payment", {formData, subscriptionPlan});
  } catch (error) {
    console.log(error);
  }
};

export const getSubscriptionsPlans = async () => {
  try {
    const { data } = await axios.get("https://api.mercadopago.com/preapproval_plan/search?status=active", {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        }
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const getSubscriptionPlanById = async (id: string) => {
    try {
      const { data } = await axios.get("https://api.mercadopago.com/preapproval_plan/" + id, {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          }
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  }