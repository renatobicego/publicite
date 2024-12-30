import { Coordinates } from "@/app/(root)/providers/LocationProvider";
import { getBoards } from "@/services/boardServices";
import { getGroupPosts, getGroups } from "@/services/groupsService";
import { getGoods, getPetitions, getServices } from "@/services/postsServices";
import { getUsers } from "@/services/userServices";

export type PubliciteDataTypes =
  | PostType
  | "boards"
  | "users"
  | "groups"
  | "groupPosts"
  | "goodService";

export const fetchDataByType = async (
  postType: PubliciteDataTypes,
  searchTerm: string | null,
  page: number,
  coordinates: Coordinates | null,
  groupId?: string
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
    case "goodService":
      const services = await getServices(searchTerm, page, coordinates);
      const goods = await getGoods(searchTerm, page, coordinates);
      // return a mix of services and goods
      return {
        items: [...goods.items.slice(0, 5), ...services.items.slice(0, 5)],
        hasMore: services.hasMore,
      };
  }
};
