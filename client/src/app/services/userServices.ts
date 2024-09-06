import { EditPersonProfileProps, UserPersonFormValues } from "@/types/userTypes";
import axios from "axios";

const baseUrl = `${process.env.API_URL}/user/personal`;

export const postUserPerson = async (formData: UserPersonFormValues) => {
  return await axios.post(`${baseUrl}`, formData);
};

export const putUserProfileData = async (
  formData: EditPersonProfileProps,
  username: string
) => {
  return await axios.put(
    `${baseUrl}/${username}`,
    formData
  );
};

export const getUserProfileData = async (username: string) => {
  try {
    const res = await fetch(`${process.env.API_URL}/user/personal-data/${username}`)
    return res.json()
  } catch (error) {
    throw new Error("Error al traer los datos personales del usuario.")
  }
};
