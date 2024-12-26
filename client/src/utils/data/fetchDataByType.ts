import { getBoards } from "@/services/boardServices";
import { getGroupPosts, getGroups } from "@/services/groupsService";
import {
  getGoods,
  getPetitions,
  getServices,
} from "@/services/postsServices";
import { getUsers } from "@/services/userServices";
import { Coordinates } from "../hooks/useLocation";

export type PubliciteDataTypes = PostType | "boards" | "users" | "groups" | "groupPosts";

export const fetchDataByType = async(
  postType: PubliciteDataTypes,
  searchTerm: string | null,
  page: number,
  coordinates: Coordinates | null,
  groupId?: string,
) => {
  switch (postType) {
    case "good":
      return await getGoods(searchTerm, page, coordinates);
    case "service":
      return await getServices(searchTerm, page, coordinates);
    case "petition":
      return await getPetitions(searchTerm, page, coordinates);
    case "boards":
      return await getBoards(searchTerm, page);
    case "groups":
      return await getGroups(searchTerm, page);
    case "users":
      return await getUsers(searchTerm, page);
    case "groupPosts":
      return await getGroupPosts(page, groupId);
  }
};
