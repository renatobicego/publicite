import {
  EditBusinessProfileProps,
  UserBusinessFormValues,
} from "@/types/userTypes";
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
    formData
  );
};
