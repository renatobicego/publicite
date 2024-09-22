import { getBoards } from "@/app/services/boardServices";
import {
  getGoods,
  getPetitions,
  getServices,
} from "@/app/services/postsServices";
import { getUsers } from "@/app/services/userServices";

export const fetchDataByType = (
  postType: "good" | "service" | "petition" | "boards" | "users" | "groups",
  searchTerm: string | null
) => {
  switch (postType) {
    case "good":
      return async () => await getGoods(searchTerm);
    case "service":
      return async () => await getServices(searchTerm);
    case "petition":
      return async () => await getPetitions(searchTerm);
    case "boards":
      return async () => await getBoards(searchTerm);
    case "groups":
      return async () => [];
    case "users":
      return async () => await getUsers(searchTerm);
  }
};
