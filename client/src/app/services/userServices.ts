import { EditPersonProfileProps, UserPersonFormValues } from "@/types/userTypes";
import axios from "axios";

export const postUserPerson = async (formData: UserPersonFormValues) => {
  return await axios.post(`${process.env.API_URL}/user/personal`, formData);
};

export const putUserProfileData = async (
  formData: EditPersonProfileProps,
  username: string
) => {
  return await axios.put(
    `${process.env.API_URL}/user/personal/${username}`,
    formData
  );
};

export const getUserProfileData = async (username: string) => {
  return await axios.get(`${process.env.API_URL}/user/personal/${username}/personal-data`);
};
