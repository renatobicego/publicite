import { getBoards } from "@/services/boardServices";
import { getGroupPosts, getGroups } from "@/services/groupsService";
import {
  getGoods,
  getPetitions,
  getServices,
} from "@/services/postsServices";
import { getUsers } from "@/services/userServices";

export const fetchDataByType = (
  postType: "good" | "service" | "petition" | "boards" | "users" | "groups" | "groupPosts",
  searchTerm: string | null,
  groupId?: string
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
      return async () => await getGroups(searchTerm);
    case "users":
      return async () => await getUsers(searchTerm);
    case "groupPosts":
      return async () => await getGroupPosts(searchTerm, groupId);
  }
};
