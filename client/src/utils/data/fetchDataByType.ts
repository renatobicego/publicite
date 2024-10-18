import { getBoards } from "@/services/boardServices";
import { getGroupPosts, getGroups } from "@/services/groupsService";
import {
  getGoods,
  getPetitions,
  getServices,
} from "@/services/postsServices";
import { getUsers } from "@/services/userServices";

export const fetchDataByType = async(
  postType: "good" | "service" | "petition" | "boards" | "users" | "groups" | "groupPosts",
  searchTerm: string | null,
  page: number,
  groupId?: string,
) => {
  switch (postType) {
    case "good":
      return await getGoods(searchTerm);
    case "service":
      return await getServices(searchTerm);
    case "petition":
      return await getPetitions(searchTerm);
    case "boards":
      return await getBoards(searchTerm, page);
    case "groups":
      return await getGroups(searchTerm, page);
    case "users":
      return await getUsers(searchTerm, page);
    case "groupPosts":
      return await getGroupPosts(searchTerm, groupId);
  }
};
